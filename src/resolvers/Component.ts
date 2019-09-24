import { combineResolvers } from 'graphql-resolvers';
import { IResolvers } from 'apollo-server-express';
import {
    collectCustomComponents,
    getAvailableComponents
} from "../parsers/component-parsers/AvailableComponentsCollector";
import {debuglog} from "util";
import {addNewElement} from "../generators/JSXElementModifiers";
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
            return addNewElement(projectId, page, {importSignature: componentId}, parent);
        }
    }
};

export default ComponentResolver;
