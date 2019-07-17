import { gql } from 'apollo-server-express';

export default gql`
  type NavHeader {
    id: ID!
    title: String!
    createdAt: Date
    modifiedAt: Date
  }
  extend type Query {
    getAllHeader: [NavHeader!]
    getHeaderById(id: ID!): NavHeader
  }
  extend type Mutation {
    addHeader(title: String!): NavHeader!
    updateHeader(id: ID!, title: String): NavHeader!
    deleteHeader(id: ID!): Boolean!
  }
`;
