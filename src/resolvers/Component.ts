import { combineResolvers } from 'graphql-resolvers';
import { IResolvers } from 'apollo-server-express';
import {getAvailableComponents} from "../parsers/component-parsers/AvailableComponentsCollector";

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
            return
        }
    }
};

export default FooterResolver;
