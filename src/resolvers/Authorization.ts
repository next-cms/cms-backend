import { ForbiddenError } from 'apollo-server-express';
import { combineResolvers, skip } from 'graphql-resolvers';
import {resolveUserWithToken} from "../utils/SecurityUtils";
import Project from "../models/Project";

export const isAuthenticated = (parent, args, { user }) =>
    user ? skip : new ForbiddenError('Not authenticated as user.');

export const isAuthorized = async (parent, {}, { user, project }) => {
    if (project && project.ownerId === user.id) return skip;
    return new ForbiddenError('Not authorized.');
};

export const isAdmin = combineResolvers(
    isAuthenticated,
    (parent, args, { user: { role } }) =>
        role === 'ADMIN'
            ? skip
            : new ForbiddenError('Not authorized as admin.'),
);

export const createContext = async ({ req }) => {
    const context = {
        user: await resolveUserWithToken(req),
        secret: process.env.JWT_TOKEN_SECRET,
        project: undefined
    };
    if (req.body.projectId || req.body.variables.projectId) {
        if (context.user) {
            const project = await Project.findById(req.body.projectId || req.body.variables.projectId);
            if (project.ownerId === context.user.id) {
                context.project = project;
            }
        }
    }
    return context;
};
