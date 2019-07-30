import { gql } from 'apollo-server-express';

export default gql`
  type Page {
    id: ID!
    key: String!
    title: String!
    slug: String!
  }
  extend type Query {
    allPages: [Page!]
    page(id: String!): Page
  }
  extend type Mutation {
    addPage(title: String!): Page!
    updatePage(id: String!, title: String): Page!
    deletePage(id: String!): Boolean!
  }
`;
