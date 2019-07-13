import { GraphQLDateTime } from 'graphql-iso-date';

import userResolvers from './user';
import {IResolverObject, IResolvers} from "graphql-tools";

const customScalarResolver: IResolvers = {
    Date: GraphQLDateTime,
};

const resolvers: IResolvers[] = [
    customScalarResolver,
    userResolvers
];

export default resolvers;
