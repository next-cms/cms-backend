import { gql } from 'apollo-server-express';

export default gql`
  type Token {
    token: String!
  }
  type User {
    id: ID!
    name: String!
    email: String!
    password: String!
    role: String
  }
  extend type Query {
    users: [User!]
    user(id: ID!): User
    currentUser: User
  }
  extend type Mutation {
    signUp(
      name: String!
      email: String!
      password: String!
    ): User!
    signIn(email: String!, password: String!): Token!
    updateUser(name: String, email: String!, password: String): User!
    deleteUser(id: ID!): Boolean!
  }
`;
