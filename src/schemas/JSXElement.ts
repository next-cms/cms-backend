import { gql } from 'apollo-server-express';

export default gql`
  type JSXElement {
    name: String!
    start: Int!
    end: Int!
    attributes: [RawValue]
    children: [JSXElement]
  }
`;
