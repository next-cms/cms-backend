import { gql } from 'apollo-server-express';

export default gql`
  type Brand {
    icon: String
    siteTitle: String
  }
  input BrandInput {
    icon: String
    siteTitle: String
  }
  
  type Project {
    id: ID!
    name: String
    title: String!
    description: String
    websiteUrl: String
    siteName: String
    brand: Brand
    siteMeta: String
    port: String
    createdAt: Date
    deletedAt: Date
    modifiedAt: Date
    isDeleted: Boolean
    ownerId: String!
  }
  input ProjectInput {
    id: String!
    name: String!
    title: String!
    description: String
    websiteUrl: String!
    siteName: String!
    brand: BrandInput
    siteMeta: String
    port: String
    isDeleted: Boolean
    ownerId: String!
  }
  extend type Query {
    allProjects(limit: Int, skip: Int): [Project!]
    projects(limit: Int, skip: Int): [Project!]
    project(id: String!): Project
    _projectsMeta: Meta
  }
  extend type Mutation {
    createProject(
      title: String!
      description: String
      websiteUrl: String!
    ): Project!
    updateProject(project: ProjectInput): Project!
    deleteProject(id: ID!): Boolean
    deployProject(id: ID!): Boolean
  }
`;
