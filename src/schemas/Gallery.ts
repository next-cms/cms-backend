import {gql} from 'apollo-server-express';

export default gql`
    type FileInfo {
        name: String
        src: String
        height: Float
        width: Float
    }
    extend type Query {
        allMedia(projectId: String!, limit: Int, skip: Int): [FileInfo!]
    }
    extend type Mutation {
        upload: String
    }
`;
