import {gql} from 'apollo-server-express';

export default gql`
    type DataObject {
        id: ID!
        slug: String
        projectId: ID!
        title: String
        type: String!
        templateTypeId: String
        fields: JSONObject
        contents: JSONObject
        createdAt: Date
        modifiedAt: Date
    }
    input DataObjectInput {
        id: ID
        title: String
        slug: String
        projectId: String!
        type: String!
        templateTypeId: String
        fields: JSONObject
        contents: JSONObject
    }
    extend type Query {
        allDataObjects(projectId: String!, limit: Int, skip: Int): [DataObject!]
        allDataObjectsByType(projectId: String!, type: String!, limit: Int, skip: Int): [DataObject!]
        dataObjectsBySlug(projectId: String!, slug: String!): DataObject
        _allDataObjectsMeta: Meta
        _allDataObjectsByTypeMeta: Meta
    }
    extend type Mutation {
        addDataObject(dataObject: DataObjectInput!, projectId: String!): DataObject
        updateDataObject(dataObject: DataObjectInput!, projectId: String!): DataObject
        deleteDataObject(id: String!, projectId: String!): DataObject
    }
`;
