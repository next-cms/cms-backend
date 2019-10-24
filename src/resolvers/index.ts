import { GraphQLDateTime } from 'graphql-iso-date';
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';

import userResolvers from './User';
import projectResolvers from './Project';
import { IResolvers } from "graphql-tools";
import pageResolver from './Page';
import componentResolver from './Component';
import galleryResolver from './Gallery';
import dataModelTemplatesResolver from './DataModelTemplate';
import dataModelsResolver from './DataModel';
import dataObjectsResolver from './DataObject';
import layoutTemplateResolver from './LayoutTemplate';
import layoutResolver from './Layout';

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
    galleryResolver,
    dataModelTemplatesResolver,
    dataModelsResolver,
    dataObjectsResolver,
    layoutTemplateResolver,
    layoutResolver
];

export default resolvers;
