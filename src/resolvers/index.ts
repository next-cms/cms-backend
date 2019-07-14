import { GraphQLDateTime } from 'graphql-iso-date';

import userResolvers from './User';
import projectResolvers from './Project';
import {IResolvers} from "graphql-tools";

const customScalarResolver: IResolvers = {
    Date: GraphQLDateTime,
};

const resolvers: IResolvers[] = [
    customScalarResolver,
    userResolvers,
    projectResolvers
];

export default resolvers;
