import {gql} from 'apollo-server-express';

export default gql`
    type AvailableComponent {
        id: ID!
        importSignature: String!
        name: String!
        vendor: String
        props: JSONObject
    }
    type ComponentMeta {
        count: Int
    }
    extend type Query {
        allAvailableComponents(limit: Int, skip: Int): [AvailableComponent!]
        allProjectAvailableComponents(projectId: String!, limit: Int, skip: Int): [AvailableComponent!]
        availableComponentById(id: String!): AvailableComponent
        _allAvailableComponentsMeta: ComponentMeta
        _allProjectAvailableComponentsMeta: ComponentMeta
    }
    extend type Mutation {
        addComponent(componentId: String!, parent: JSONObject, projectId: String!, page: String!): Boolean
        saveComponent(component: JSONObject!, projectId: String!, page: String!): Boolean
        deleteComponent(component: JSONObject, projectId: String!, page: String!): Boolean
        updateComponentPlacement(components: [JSONObject], projectId: String!, page: String!): Boolean
        addComponents(componentIds: [String!], parent: JSONObject, projectId: String!, page: String!): Boolean
    }
`;
