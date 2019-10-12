import { gql } from 'apollo-server-express';

import userSchema from './User';
import projectSchema from './Project';
import pageSchema from './Page';
import componentSchema from './Component';
import gallerySchema from './Gallery';

const linkSchema = gql`
  scalar Date
  scalar JSON
  scalar JSONObject
  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
  type Subscription {
    _: Boolean
  }
`;

export default [linkSchema, userSchema, projectSchema, pageSchema, componentSchema, gallerySchema];
