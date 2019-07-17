import { gql } from 'apollo-server-express';

export default gql`
  type Page {
    id: ID!
    title: String!
    createdAt: Date
    modifiedAt: Date
  }
  extend type Query {
    getAllPage: [Page!]
    getPageById(id: ID!): Page
  }
  extend type Mutation {
    addPage(title: String!): Page!
    updatePage(id: ID!, title: String): Page!
    deletePage(id: ID!): Boolean!
  }
`;
