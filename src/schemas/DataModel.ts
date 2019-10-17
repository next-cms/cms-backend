import {gql} from 'apollo-server-express';

export default gql`
    type DataModel {
        id: ID!
        projectId: ID!
        name: String!
        type: String!
        templateTypeId: String
        fields: JSONObject
        contents: JSONObject
        createdAt: Date
        modifiedAt: Date
    }
    input DataModelInput {
        name: String!
        projectId: String!
        type: String!
        templateTypeId: String!
        fields: JSONObject
        contents: JSONObject
    }
    extend type Query {
        allDataModels(projectId: String!, limit: Int, skip: Int): [DataModel!]
        _allDataModelsMeta: Meta
    }
    extend type Mutation {
        addDataModel(dataModel: DataModelInput!, projectId: String!): DataModel
        updateDataModel(dataModel: DataModelInput!, projectId: String!): DataModel
        deleteDataModel(id: String!, projectId: String!): DataModel
    }
`;
