import {combineResolvers} from 'graphql-resolvers';
import {ForbiddenError, IResolvers, UserInputError} from 'apollo-server-express';

import Project from "../models/Project";
import {isAdmin, isAuthenticated} from "./Authorization";
import {PROJECT_ROOT} from "../constants/DirectoryStructureConstants";

import {deployProjectInDockerWithNginx, initializeNewProject} from '../project-manager';
import {debuglog} from "util";

const fs = require("fs-extra");
const log = debuglog("pi-cms.resolvers.Project");

const ProjectResolver: IResolvers = {
    Query: {
        allProjects: combineResolvers(
            isAdmin, async (parent, {limit, skip}, context) => {
                return await Project.getAllProjects(limit, skip);
            }
        ),
        projects: combineResolvers(
            isAuthenticated, async (parent, {limit, skip}, {user}) => {
                return await Project.getAllProjectsByOwnerId(user.id, limit, skip);
            }
        ),
        project: combineResolvers(
            isAuthenticated, async (parent, {id}, {user}) => {
                const project = await Project.findById(id);
                if (project && project.ownerId === user.id) {
                    return project;
                }
                return new ForbiddenError('Not authorized.');
            }
        ),
        _projectsMeta: combineResolvers(isAuthenticated,
            async (parent, args, {user}) => {
                return {
                    count: await Project.countDocuments({ownerId: user.id})
                    // count: await Project.estimatedDocumentCount({})
                };
            }
        ),
    },

    Mutation: {
        createProject: combineResolvers(
            isAuthenticated, async (parent,
                                    {title, description, websiteUrl},
                                    {user},
            ) => {
                try {
                    let project = new Project({title, description, websiteUrl, ownerId: user.id});
                    return project.save().then(res => {
                        console.log(res);
                        return initializeNewProject(res).then(()=>{
                            return res;
                        });
                    }).catch(err => {
                        console.log(err);
                        return err;
                    })
                } catch (e) {
                    console.error(e);
                    throw e;
                }
            }
        ),
        updateProject: combineResolvers(
            isAuthenticated,
            async (parent,
                   {project},
                   {user},
            ) => {
                const projectInDB = await Project.findById(project.id);
                if (!projectInDB) {
                    throw new UserInputError(
                        'No project found with this id.',
                    );
                }
                if (projectInDB.ownerId === user.id) {
                    Object.assign(projectInDB, project, {modifiedAt: Date.now()});
                    return await projectInDB.save().then(updatedProject=>{
                        log(updatedProject);
                        return updatedProject
                    });
                }
                return new ForbiddenError('Not authorized.');
            }
        ),
        deleteProject: combineResolvers(
            isAuthenticated,
            async (parent, {id}, {user}) => {
                const project = await Project.findById(id);
                console.log("project is: ", project);
                const path = `${PROJECT_ROOT}/${project.id}`;

                if (project && project.ownerId === user.id) {
                    await project.remove();
                    //deleting project folder
                    await fs.remove(path, err => {
                        console.error(err);
                    });
                    return true;
                } else {
                    return new ForbiddenError('Not authorized.');
                }
            },
        ),
        deployProject: combineResolvers(
            isAuthenticated,
            async (parent, {id}, {user}) => {
                const project = await Project.findById(id);
                console.log("project is: ", project);
                if (project && project.ownerId === user.id) {
                    return deployProjectInDockerWithNginx(project).then((res)=>{
                        return res;
                    });
                } else {
                    return new ForbiddenError('Not authorized.');
                }
            },
        ),
    }
};

export default ProjectResolver;
