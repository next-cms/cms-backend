import { gql } from 'apollo-server-express';

export default gql`
  type IntBox {
    value: Int
    start: Int
    end: Int  
  }
  type StringBox {
    value: String
    start: Int
    end: Int  
  }
  type RawValue {
    value: String
    start: Int
    end: Int
  }
`;
