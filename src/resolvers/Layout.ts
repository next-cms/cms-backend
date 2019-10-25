import { combineResolvers } from 'graphql-resolvers';
import { IResolvers, UserInputError } from 'apollo-server-express';
import { debuglog } from "util";
import { isAuthenticated, isAuthorized } from './Authorization';
import Layout from '../models/Layout';
const log = debuglog("pi-cms.resolvers.LayoutTemplate");

const LayoutResolver: IResolvers = {
    Query: {
        allLayoutsByProject: combineResolvers(
            isAuthenticated, isAuthorized, async (parent, { projectId, limit, skip }, context) => {
                return await Layout.getAllProjectLayouts(projectId, limit, skip);
            }
        ),
        _allLayoutsByProjectMeta: combineResolvers(isAuthenticated, isAuthorized, async (parent, { projectId }, context) => {
            return {
                count: await Layout.countDocuments({ projectId })
            };
        }),
        getLayoutById: combineResolvers(isAuthenticated, isAuthorized, async (parent, { id }, context) => {
            const layout = await Layout.findOne({ _id: id });
            if (!layout) throw new UserInputError(`Layout not found by id: ${id}`);
            return layout;
        })
    },
    Mutation: {
        createLayout: combineResolvers(isAuthenticated, isAuthorized,
            async (parentMutation, { layout }, context) => {
                const layoutModel = new Layout(layout);
                return await layoutModel.save();
            }),
        updateLayout: combineResolvers(isAuthenticated, isAuthorized,
            async (parentMutation, { layout }, context) => {
                let layoutDB = await Layout.findById(layout.id);
                if (!layoutDB) throw new UserInputError("Layout not found!");
                Object.assign(layoutDB, layout, { modifiedAt: new Date() })
                return await layoutDB.save().then(updatedLayout => {
                    return updatedLayout;
                });
            }),
        deleteLayout: combineResolvers(isAuthenticated, isAuthorized,
            async (parentMutation, { id }, context) => {
                const layout = await Layout.findOne({ _id: id });
                if (!layout) throw new UserInputError(`Layout not found by id: ${id}`);
                await layout.remove();
                return true;
            }),
    }
};

export default LayoutResolver;
