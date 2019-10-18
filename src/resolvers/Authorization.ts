import { ForbiddenError } from 'apollo-server-express';
import { combineResolvers, skip } from 'graphql-resolvers';
import {resolveUserWithToken} from "../utils/SecurityUtils";
import Project from "../models/Project";

export const isAuthorizedToRead = async (parent, {}, { user, project, xAuth }) => {
    console.log(xAuth);
    if (xAuth) {
        console.log(xAuth);
        console.log(project);
        console.log(project.id);
        if (project && project.id === xAuth)
            return skip;
    }
    if (project && project.ownerId === user.id) return skip;
    return new ForbiddenError('Not authorized.');
};

export const isAuthenticated = (parent, args, { user }) =>{
    return user ? skip : new ForbiddenError('Not authenticated as user.');
};

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
        project: undefined,
        xAuth: req.headers["xauth"]
    };
    if (req.body.projectId || req.body.variables.projectId) {
        if (context.user || context.xAuth) {
            const project = await Project.findById(req.body.projectId || req.body.variables.projectId);
            if (context.xAuth) return {
                ...context,
                project
            };
            if (project.ownerId === context.user.id) {
                context.project = project;
            }
        }
    }
    return context;
};
