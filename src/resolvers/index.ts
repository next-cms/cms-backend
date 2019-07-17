import { GraphQLDateTime } from 'graphql-iso-date';

import userResolvers from './User';
import projectResolvers from './Project';
import { IResolvers } from "graphql-tools";
import navHeaderResolver from './NavHeader';
import footerResolver from './Footer';
import pageResolver from './Page';

const customScalarResolver: IResolvers = {
    Date: GraphQLDateTime,
};

const resolvers: IResolvers[] = [
    customScalarResolver,
    userResolvers,
    projectResolvers,
    navHeaderResolver,
    footerResolver,
    pageResolver
];

export default resolvers;
