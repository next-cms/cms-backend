import { combineResolvers } from 'graphql-resolvers';
import { IResolvers } from 'apollo-server-express';
import {debuglog} from "util";
import { isAuthenticated } from './Authorization';
import LayoutTemplate from '../models/LayoutTemplate';
const log = debuglog("pi-cms.resolvers.LayoutTemplate");

const LayoutTemplateResolver: IResolvers = {
    Query: {
        allLayoutTemplates: combineResolvers(
            isAuthenticated, async (parent, {limit, skip}, context) => {
                return await LayoutTemplate.getAllLayoutTemplate(limit, skip);
            }
        ),
        _allLayoutTemplatesMeta: combineResolvers(isAuthenticated, async (parent, { limit, skip }, context) => {
            return {
                count: await LayoutTemplate.countDocuments()
            };
        })
    },
    Mutation: {
        
    }
};

export default LayoutTemplateResolver;
