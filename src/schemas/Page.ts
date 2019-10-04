import {gql} from 'apollo-server-express';

export default gql`
    type Page {
        slug: String!
        key: String!
        title: String!
        path: String!
        pathAs: String!
        pathParam: String!
    }

    input PageInput {
        slug: String!
        key: String!
        title: String!
        path: String!
        pathAs: String!
        pathParam: String!
    }

    type Component {
        name: String
        start: Int
        end: Int
        attributes: [JSONObject]
        children: [JSONObject]
    }

    type PageDetails {
        title: String,
        slug: String!,
        children: [JSONObject]
        hooks: [String]
        effects: [String]
    }
    extend type Query {
        allPages: [Page!]
        page(projectId: String!, page: String!): PageDetails
        pageSourceCode(projectId: String!, page: String!): String
    }
    extend type Mutation {
        addPage: Page!
        updatePage(projectId: String!, page: PageInput!): Page!
        deletePage(projectId: String!, pageId: String!): Boolean!
        savePageSourceCode(sourceCode: String!, projectId: String!, page: String!): Boolean!
    }
`;
