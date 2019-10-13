import {gql} from 'apollo-server-express';

export default gql`
    type FileInfo {
        name: String
        src: String
        height: Float
        width: Float
    }
    type MediaResult {
        data: [FileInfo],
        hasMore: Boolean
    }
    extend type Query {
        allMedia(projectId: String!, limit: Int, skip: Int): MediaResult
    }
    extend type Mutation {
        upload: String
    }
`;
