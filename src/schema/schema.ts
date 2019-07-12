import { gql } from 'apollo-server-express';
import User from '../model/User';

// This is a (sample) collection of books we'll be able to query
// the GraphQL server for.  A more complete example might fetch
// from an existing data source like a REST API or database.
const books = [
  {
    id: "1",
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
  },
  {
    id: '2',
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
];

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
export const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.

  # This "Book" type can be used in other type declarations.

  type Book {
    id: String
    title: String
    author: String
  }

  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  
  type Query {
    books: [Book]
    bookById(id: String): [Book]

    # User
    getUsers: [User]
  }

  # ========== User ===========

  type User {
    name: String
    email: String
    password: String
  }

  type Mutation {
    addUser(name: String!, email: String!, password: String!): User
    updateUser(name: String, email: String!, password: String): User
  }

  `;


// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
export const resolvers = {
  Query: {
    books: () => books,
    /** All resolvers receive 3 params. They are parent, args, context.
     * @param _ is the parent
     * @param id is from args
     * @param context*/
    bookById(_, { id }, context) {
      console.log(context);
      return books.filter((book) => book.id === id)
    },

    /* User */
    getUsers: async () => User.find().catch(err => {
      console.log(err)
      return err
    })
  },
  Mutation: {
    addUser: (_, args) => {
      try {
        const user = new User(args);
        return user.save().then(res => {
          return res;
        }).catch(err => {
          console.log(err)
          return err;
        })
      } catch (e) {
        return e.message;
      }
    },
    updateUser: (_, args) => {
      try {
        return User.findOneAndUpdate({ email: args.email }, args).then(res => {
          if (res === null) return null;
          return { ...res, ...args };
        }).catch(err => {
          console.log(err)
          return err;
        })
      } catch (e) {
        return e.message;
      }
    },
  }
};
