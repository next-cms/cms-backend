import { combineResolvers } from 'graphql-resolvers';
import { IResolvers } from 'apollo-server-express';
import {debuglog} from "util";
import { isAuthenticated, isAuthorized } from './Authorization';
import Layout from '../models/Layout';
const log = debuglog("pi-cms.resolvers.LayoutTemplate");

const LayoutResolver: IResolvers = {
    Query: {
        allLayoutsByProject: combineResolvers(
            isAuthenticated,  isAuthorized, async (parent, {projectId, limit, skip}, context) => {
                return await Layout.getAllProjectLayouts(projectId, limit, skip);
            }
        ),
        _allLayoutsByProjectMeta: combineResolvers(isAuthenticated, isAuthorized, async (parent, { projectId }, context) => {
            return {
                count: await Layout.countDocuments({projectId})
            };
        }),
        getLayoutById: combineResolvers(isAuthenticated, isAuthorized, async (parent, { projectId }, context) => {
            return {
                count: await Layout.find({projectId})
            };
        })
    },
    Mutation: {
        createLayout: combineResolvers(isAuthenticated, isAuthorized,
            async (parentMutation, {layout}, context) => {
                let layoutModel = new Layout(layout);
                console.log(layoutModel);
            return await layoutModel.save();
        }),
    }
};

export default LayoutResolver;
