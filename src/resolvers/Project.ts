import {combineResolvers} from 'graphql-resolvers';
import {ForbiddenError, IResolvers, UserInputError} from 'apollo-server-express';

import Project from "../models/Project";
import {isAdmin, isAuthenticated, isAuthorized} from "./Authorization";

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
                if (project && project.ownerId === user.id) return project;
                return new ForbiddenError('Not authorized.');
            }
        ),
        _projectsMeta: combineResolvers(isAuthenticated,
            async (parent, args, {user}) => {
                return {
                    count: await Project.count({ownerId: user.id})
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

                if (project && project.ownerId === user.id) {
                    await project.remove();
                    return true;
                } else {
                    return new ForbiddenError('Not authorized.');
                }
            },
        ),
    }
};

export default ProjectResolver;
