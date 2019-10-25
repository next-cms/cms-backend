import { gql } from 'apollo-server-express';

export default gql`
    
    type Layout {
        id: ID!,
        name: String!
        header: String,
        footer: String,
        leftSider: String,
        rightSider: String,
        layoutTemplateId: String!,
        projectId: String!
    }

    input LayoutInput {
        id: String,
        name: String!
        header: String,
        footer: String,
        leftSider: String,
        rightSider: String,
        layoutTemplateId: String!,
        projectId: String!
    }

    extend type Query {
        allLayoutsByProject(projectId: String!, limit: Int, skip: Int): [Layout!]
        _allLayoutsByProjectMeta(projectId: String!): Meta
        getLayoutById(id: ID!): Layout!

    }

    extend type Mutation {
        createLayout(layout: LayoutInput, projectId: String!): Layout!
        updateLayout(layout: LayoutInput, projectId: String!): Layout!
        deleteLayout(id: ID!, projectId: String!): Boolean!
    }
`;
