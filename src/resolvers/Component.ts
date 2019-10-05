import { combineResolvers } from 'graphql-resolvers';
import { IResolvers } from 'apollo-server-express';
import {
    collectCustomComponents,
    getAvailableComponents
} from "../parsers/component-parsers/AvailableComponentsCollector";
import {debuglog} from "util";
import {addNewElement, deleteElement, saveElement} from "../generators/JSXElementModifiers";
import {isAuthenticated} from "./Authorization";
import Component from "../models/Component";
const debug = debuglog("pi-cms.resolvers.Component");

const ComponentResolver: IResolvers = {
    Query: {
        allAvailableComponents: combineResolvers(
            isAuthenticated, async (parent, {projectId, limit, skip}, context) => {
                return [
                    ...await Component.getAllComponent(limit, skip),
                    ...await collectCustomComponents(projectId)
                ];
            }
        ),
        availableComponentById: async (parent, { limit, skip }, context) => {
            // return await Footer.getAllFooter(limit, skip);
        }
    },
    Mutation: {
        addComponent: async (parentMutation, {componentId, parent, projectId, page}, context) => {
            return await addNewElement(projectId, page, {id: componentId}, parent);
        },
        saveComponent: async (parentMutation, {component, projectId, page}, context) => {
            return await saveElement(projectId, page, component);
        },
        deleteComponent: async (parentMutation, {component, projectId, page}, context) => {
            return await deleteElement(projectId, page, component);
        },
        addComponents: async (parentMutation, {componentIds, parent, projectId, page}, context) => {
            for (const componentId of componentIds) {
                await addNewElement(projectId, page, {id: componentId}, parent);
            }
            return true;
        }
    }
};

export default ComponentResolver;
