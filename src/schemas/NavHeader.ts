import { gql } from 'apollo-server-express';

export default gql`
  type menuItem {
    menuText: String!
    slug: String!
  }
  input menuItemInput {
    menuText: String!
    slug: String!
  }
  type NavHeader {
    id: ID!
    title: String!
    navMenu: [menuItem]
    createdAt: Date
    modifiedAt: Date
  }
  extend type Query {
    getAllHeader: [NavHeader!]
    getHeaderById(id: ID!): NavHeader
  }
  extend type Mutation {
    addHeader(title: String!, navMenu: [menuItemInput]): NavHeader!
    updateHeader(id: ID!, title: String, navMenu: [menuItemInput]): NavHeader!
    deleteHeader(id: ID!): Boolean!
  }
`;
