import { combineResolvers } from 'graphql-resolvers';
import { IResolvers } from 'apollo-server-express';
import {
    collectCustomComponents
} from "../parsers/component-parsers/AvailableComponentsCollector";
import {debuglog} from "util";
import {addNewElement, deleteElement, saveElement, updateComponentPlacement} from "../generators/JSXElementModifiers";
import {isAuthenticated, isAuthorized} from "./Authorization";
import Component from "../models/Component";
const debug = debuglog("pi-cms.resolvers.Component");

const ComponentResolver: IResolvers = {
    Query: {
        allAvailableComponents: combineResolvers(
            isAuthenticated, async (parent, {limit, skip}, context) => {
                return await Component.getAllComponent(limit, skip);
            }
        ),
        allProjectAvailableComponents: combineResolvers(
            isAuthenticated, async (parent, {projectId, limit, skip}, context) => {
                return await collectCustomComponents(projectId);
            }
        ),
        availableComponentById: combineResolvers(isAuthenticated, isAuthorized, async (parent, { limit, skip }, context) => {
            // return await Footer.getAllFooter(limit, skip);
        }),
        _allAvailableComponentsMeta: combineResolvers(isAuthenticated, async (parent, { limit, skip }, context) => {
            return {
                count: await Component.countDocuments()
                // count: await Project.estimatedDocumentCount({})
            };
        }),
        _allProjectAvailableComponentsMeta: combineResolvers(isAuthenticated, isAuthorized, async (parent, { projectId, limit, skip }, context) => {
            return {
                count: await Component.countDocuments({projectId})
                // count: await Project.estimatedDocumentCount({})
            };
        })
    },
    Mutation: {
        addComponent: combineResolvers(isAuthenticated, isAuthorized,async (parentMutation, {componentId, parent, projectId, page}, context) => {
            return await addNewElement(projectId, page, {id: componentId}, parent);
        }),
        saveComponent: combineResolvers(isAuthenticated, isAuthorized,async (parentMutation, {component, projectId, page}, context) => {
            return await saveElement(projectId, page, component);
        }),
        deleteComponent: combineResolvers(isAuthenticated, isAuthorized,async (parentMutation, {component, projectId, page}, context) => {
            return await deleteElement(projectId, page, component);
        }),
        updateComponentPlacement: combineResolvers(isAuthenticated, isAuthorized,async (parentMutation, {components, projectId, page}, context) => {
            return await updateComponentPlacement(components, projectId, page);
        }),
        addComponents: combineResolvers(isAuthenticated, isAuthorized,async (parentMutation, {componentIds, parent, projectId, page}, context) => {
            for (const componentId of componentIds) {
                await addNewElement(projectId, page, {id: componentId}, parent);
            }
            return true;
        })
    }
};

export default ComponentResolver;
