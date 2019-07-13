import { ForbiddenError } from 'apollo-server-express';
import { combineResolvers, skip } from 'graphql-resolvers';

export const isAuthenticated = (parent, args, { user }) =>
    user ? skip : new ForbiddenError('Not authenticated as user.');

export const isAdmin = combineResolvers(
    isAuthenticated,
    (parent, args, { user: { role } }) =>
        role === 'ADMIN'
            ? skip
            : new ForbiddenError('Not authorized as admin.'),
);
