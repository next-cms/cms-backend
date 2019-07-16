import { combineResolvers } from 'graphql-resolvers';
import { IResolvers, UserInputError } from 'apollo-server-express';

import Project from "../model/Project";
import { isAdmin, isAuthenticated } from "./Authorization";

const ProjectResolver: IResolvers = {
    Query: {
        allProjects: combineResolvers(
            isAdmin, async (parent, { limit, skip }, context) => {
                return await Project.getAllProjects(limit, skip);
            }),
        projects: combineResolvers(
            isAuthenticated, async (parent, { limit, skip }, { user }) => {
                return await Project.getAllProjectsByOwnerId(user.id, limit, skip);
            }),
        project: combineResolvers(
            isAuthenticated, async (parent, { id }, { user }) => {
                return await Project.findById(id);
            }),
        _projectsMeta: async (parent, args, { user }) => {
            return {
                // count: await Project.count({ownerId: user.id})
                count: await Project.estimatedDocumentCount({})
            };
        },
    },

    Mutation: {
        createProject: combineResolvers(
            isAuthenticated, async (parent,
                { title, description, websiteUrl },
                { user },
            ) => {
                try {
                    let project = new Project({ title, description, websiteUrl, ownerId: user.id });
                    return project.save().then(res => {
                        return res;
                    }).catch(err => {
                        console.log(err);
                        return err;
                    })
                } catch (e) {
                    return e.message;
                }
            }),

        updateProject: combineResolvers(
            isAuthenticated, async (parent,
                { id, title, description, websiteUrl, icon, siteTitle, siteMeta },
                { user },
            ) => {
                const project = await Project.findByIdAndUpdate(id, {
                    title, description, websiteUrl, brand: { icon, siteTitle }, siteMeta, modifiedAt: Date.now()
                }, { new: true });

                if (!project) {
                    throw new UserInputError(
                        'No project found with this id.',
                    );
                }
                return project;
            }),

        deleteUser: combineResolvers(
            isAuthenticated,
            async (parent, { id }, { user }) => {
                const project = await Project.findById(id);

                if (project) {
                    await project.remove();
                    return true;
                } else {
                    return false;
                }
            },
        ),
    }
};

export default ProjectResolver;
