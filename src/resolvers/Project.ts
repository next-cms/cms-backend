import {combineResolvers} from 'graphql-resolvers';
import {ForbiddenError, IResolvers, UserInputError} from 'apollo-server-express';

import Project from "../models/Project";
import {isAdmin, isAuthenticated} from "./Authorization";
import {PROJECT_ROOT} from "../constants/DirectoryStructureConstants";

import {initializeNewProject} from '../project-initialize';

const fs = require("fs-extra");

const ProjectResolver: IResolvers = {
    Query: {
        allProjects: combineResolvers(
            isAdmin, async (parent, {limit, skip}, context) => {
                return await Project.getAllProjects(limit, skip);
            }
        ),
        projects: combineResolvers(
            isAuthenticated, async (parent, {title, limit, skip}, {user}) => {
                if(title === ""){
                    return await Project.getAllProjectsByOwnerId(user.id, limit, skip);
                }
                else
                {
                    return await Project.getAllFilteredProjectsByOwnerId(user.id, title, limit, skip);
                }
                
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
            async (parent, args,{user}) => {
                 return {
                        count: await Project.find({ownerId: user.id}).count()
                        // count: await Project.estimatedDocumentCount({})
                    };

            }
        )
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
                        initializeNewProject(res._id);
                        return res;
                    }).catch(err => {
                        console.log(err);
                        return err;
                    })
                } catch (e) {
                    return e.message;
                }
            }
        ),
        updateProject: combineResolvers(
            isAuthenticated,
            async (parent,
                   {id, title, description, websiteUrl, brand, siteMeta},
                   {user},
            ) => {
                const project = await Project.findById(id);
                if (!project) {
                    throw new UserInputError(
                        'No project found with this id.',
                    );
                }
                if (project.ownerId === user.id) {
                    const updatedProject = {
                        ...project, ...{
                            title, description, websiteUrl, brand, siteMeta, modifiedAt: Date.now()
                        }
                    };
                    await updatedProject.save();
                    return updatedProject;
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
    }
};

export default ProjectResolver;
