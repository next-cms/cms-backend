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
        children: [JSONObject]
        hooks: [String]
        effects: [String]
    }
    extend type Query {
        allPages: [Page!]
        page(id: String!, page: String!): PageDetails
    }
    extend type Mutation {
        addPage: Page!
        updatePage(id: String!, title: String): Page!
        deletePage(id: String!): Boolean!
    }
`;
