import {gql} from 'apollo-server-express';

export default gql`
    type LayoutTemplate {
        id: ID!,
        name: String!
        fileName: String!
        image: String
        header: Boolean,
        footer: Boolean,
        sider: Boolean
    }
    extend type Query {
        allLayoutTemplates(limit: Int, skip: Int): [LayoutTemplate!]
        _allLayoutTemplatesMeta: Meta
    }
`;
