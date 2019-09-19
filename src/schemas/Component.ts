import {gql} from 'apollo-server-express';

export default gql`
    type AvailableComponent {
        id: ID!
        title: String!
        createdAt: Date
        modifiedAt: Date
    }
    extend type Query {
        getAllAvailableComponents(projectId: String!, limit: Int, skip: Int): [AvailableComponent!]
        getAvailableComponentById(id: String!): AvailableComponent
    }
    extend type Mutation {
        addComponent(componentId: String!, parent: JSONObject, projectId: String!, page: String!): Boolean
    }
`;
