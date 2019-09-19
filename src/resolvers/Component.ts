import { combineResolvers } from 'graphql-resolvers';
import { IResolvers } from 'apollo-server-express';
import {getAvailableComponents} from "../parsers/component-parsers/AvailableComponentsCollector";
import {debuglog} from "util";
import {addNewElement} from "../generators/JSXElementModifiers";
const debug = debuglog("pi-cms.resolvers.Component");

const FooterResolver: IResolvers = {
    Query: {
        getAllAvailableComponents: async (parent, { projectId, limit, skip }, context) => {
            return await getAvailableComponents(projectId);
        },
        getAvailableComponentById: async (parent, { limit, skip }, context) => {
            // return await Footer.getAllFooter(limit, skip);
        }
    },
    Mutation: {
        addComponent: async (parentMutation, {componentId, parent, projectId, page}, context) => {
            return addNewElement(projectId, page, {id: componentId}, parent);
        }
    }
};

export default FooterResolver;
