import {gql} from 'apollo-server-express';

export default gql`
    type DataModelTemplate {
        id: ID!
        name: String!
        type: String!
        fields: JSONObject
        createdAt: Date
        modifiedAt: Date
    }
    input DataModelTemplateInput {
        name: String!
        type: String!
        fields: JSONObject
    }
    extend type Query {
        allDataModelTemplates(limit: Int, skip: Int): [DataModelTemplate!]
        _allDataModelTemplatesMeta: Meta
    }
`;
