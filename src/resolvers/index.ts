import { GraphQLDateTime } from 'graphql-iso-date';
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';

import userResolvers from './User';
import projectResolvers from './Project';
import { IResolvers } from "graphql-tools";
import navHeaderResolver from './NavHeader';
import footerResolver from './Footer';
import pageResolver from './Page';

const customScalarResolver: IResolvers = {
    Date: GraphQLDateTime,
    JSON: GraphQLJSON,
    JSONObject: GraphQLJSONObject
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
