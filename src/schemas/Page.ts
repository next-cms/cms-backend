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

    type Component {
        name: String
        start: Int
        end: Int
        attributes: [JSONObject]
        children: [JSONObject]
    }

    type PageDetails {
        key: String,
        name: String,
        slug: String!,
        children: [JSONObject]
        hooks: [String]
        effects: [String]
    }

    input PageDetailsInput {
        key: String,
        name: String,
        slug: String!,
        children: [JSONObject]
        hooks: [String]
        effects: [String]
    }
    
    extend type Query {
        allPages(projectId: String!): [Page!]
        page(projectId: String!, page: String!): PageDetails
        pageSourceCode(projectId: String!, page: String!): String
    }
    extend type Mutation {
        addPage(projectId: String!): Page!
        updatePage(pageDetails: PageDetailsInput, projectId: String!, page: String!): Page!
        deletePage(projectId: String!, page: String!): Boolean!
        savePageSourceCode(sourceCode: String!, projectId: String!, page: String!): Boolean!
    }
`;
