import {gql} from 'apollo-server-express';

export default gql`
    type AvailableLayoutTemplate {
        id: ID!,
        name: String!
        fileName: String!
        image: String
        header: Boolean,
        footer: Boolean,
        sider: Boolean
    }
    type LayoutTemplateMeta {
        count: Int
    }
    extend type Query {
        allAvailableComponents(limit: Int, skip: Int): [AvailableLayoutTemplate!]
        allAvailableLayoutTemplatesMeta: LayoutTemplateMeta
    }
`;
