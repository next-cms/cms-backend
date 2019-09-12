import { combineResolvers } from 'graphql-resolvers';
import { IResolvers } from 'apollo-server-express';
import {getAvailableComponents} from "../parsers/component-parsers/AvailableComponentsCollector";
import {debuglog} from "util";
import {addNewComponent} from "../generators/ComponentGenerator";
const debug = debuglog("pi-cms.resolvers.Component");

const FooterResolver: IResolvers = {
    Query: {
        getAllAvailableComponent: async (parent, { limit, skip }, context) => {
            return await getAvailableComponents();
        },
        getAvailableComponentById: async (parent, { limit, skip }, context) => {
            // return await Footer.getAllFooter(limit, skip);
        }
    },
    Mutation: {
        addComponent: async (parentMutation, {componentId, parent, projectId, page}, context) => {
            return addNewComponent(projectId, page, {id: componentId}, parent);
        }
    }
};

export default FooterResolver;
