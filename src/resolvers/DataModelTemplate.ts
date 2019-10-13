import { combineResolvers } from 'graphql-resolvers';
import { IResolvers } from 'apollo-server-express';
import {debuglog} from "util";
import {isAuthenticated} from "./Authorization";
import DataModelTemplate from "../models/DataModelTemplate";
const debug = debuglog("pi-cms.resolvers.DataModelTemplate");

const GalleryResolver: IResolvers = {
    Query: {
        allDataModelTemplates: combineResolvers(
            isAuthenticated, async (parent, {limit, skip}, {}) => {
                return await DataModelTemplate.getAll(limit, skip);
            }
        ),
        _allDataModelTemplatesMeta: combineResolvers(isAuthenticated,
            async (parent, {}, {}) => {
                return {
                    count: await DataModelTemplate.countDocuments()
                };
            }
        )
    }
};

export default GalleryResolver;
