import { gql } from 'apollo-server-express';

export default gql`
  type Page {
    slug: String!
    key: String!
    title: String!
    path: String!
    pathAs: String!
    pathParam: String!
  }
  type PageDetails {
    title: String
    components: [String]
    hooks: [String]
    effects: [String]
  }
  extend type Query {
    allPages: [Page!]
    page(id: String!, page: String!): PageDetails
  }
  extend type Mutation {
    addPage(title: String!): Page!
    updatePage(id: String!, title: String): Page!
    deletePage(id: String!): Boolean!
  }
`;
