import {gql} from 'apollo-server-express';

export default gql`
  type Project {
    id: ID!
    title: String!
    description: String
    websiteUrl: String!
    createdAt: Date
    deletedAt: Date
    modifiedAt: Date
    isDeleted: Boolean
    ownerId: String!
  }
  type ProjectMeta {
    count: Int
  }
  extend type Query {
    allProjects(limit: Int, skip: Int): [Project!]
    projects(limit: Int, skip: Int): [Project!]
    project(id: ID!): Project
    _projectsMeta: ProjectMeta
  }
  extend type Mutation {
    createProject(
      title: String!
      description: String
      websiteUrl: String!
    ): Project!
    updateProject(
      id: ID!
      title: String
      description: String
      websiteUrl: String
    ): Project!
    deleteProject(id: ID!): Boolean!
  }
`;
