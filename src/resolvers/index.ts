import { GraphQLDateTime } from 'graphql-iso-date';
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';

import userResolvers from './User';
import projectResolvers from './Project';
import { IResolvers } from "graphql-tools";
import pageResolver from './Page';
import componentResolver from './Component';
import galleryResolver from './Gallery';

const customScalarResolver: IResolvers = {
    Date: GraphQLDateTime,
    JSON: GraphQLJSON,
    JSONObject: GraphQLJSONObject
};

const resolvers: IResolvers[] = [
    customScalarResolver,
    userResolvers,
    projectResolvers,
    pageResolver,
    componentResolver,
    galleryResolver
];

export default resolvers;
