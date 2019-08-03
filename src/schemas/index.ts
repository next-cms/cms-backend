import { gql } from 'apollo-server-express';

import userSchema from './User';
import projectSchema from './Project';
import navHeaderSchema from './NavHeader';
import footerSchema from './Footer';
import valueSchema from './ValueTypes';
import pageSchema from './Page';
import jsxSchema from './JSXElement';

const linkSchema = gql`
  scalar Date
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

export default [linkSchema, userSchema, projectSchema, navHeaderSchema, footerSchema, pageSchema, valueSchema, jsxSchema];
