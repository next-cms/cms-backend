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
    title: String!
    description: String
    websiteUrl: String!
    brand: Brand
    siteMeta: String
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
    projects(title: String, limit: Int, skip: Int): [Project]
    project(id: String!): Project
    _projectsMeta: [ProjectMeta]
   
  }
  extend type Mutation {
    createProject(
      title: String!
      description: String
      websiteUrl: String!
    ): Project!
    updateProject(
      id: String!
      title: String
      description: String
      websiteUrl: String
      siteMeta: String
      brand: BrandInput
    ): Project!
    deleteProject(id: ID!): Boolean
  }
`;
