import { gql } from 'apollo-server-express';

export default gql`
  type Footer {
    id: ID!
    title: String!
    createdAt: Date
    modifiedAt: Date
  }
  extend type Query {
    getAllFooter: [Footer!]
    getFooterById(id: ID!): Footer
  }
  extend type Mutation {
    addFooter(title: String!): Footer!
    updateFooter(id: ID!, title: String): Footer!
    deleteFooter(id: ID!): Boolean!
  }
`;
