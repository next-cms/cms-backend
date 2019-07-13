/* =============================
        Import All
================================ */
import mongoClient from "./service-providers/mongoClient";
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import {Request, Response} from 'express';
import schemas from './schemas';
import resolvers from './resolvers';

/* =============================
        Import The App
================================ */
import app from "./app";
import {resolveUserWithToken} from "./utils/securityUtils";

dotenv.config();
process.on("uncaughtException", e => {
    console.log(e);
    process.exit(1);
});
process.on("unhandledRejection", e => {
    console.log(e);
    process.exit(1);
});

/* =============================
        Setup Database
================================ */
const mongoConnection = mongoClient.connection;

/* =============================
        Setup GraphQL
================================ */
const server = new ApolloServer({
    typeDefs: schemas,
    resolvers: resolvers as any,
    context: async ({ req }) => {
        const currentUser = await resolveUserWithToken(req);
        return {
            user: currentUser,
            secret: process.env.JWT_TOKEN_SECRET
        }
    },
    // mocks: true,
    // mockEntireSchema: false,
    introspection: true,
    playground: true,
    formatError: error => {
        console.log(error);
        return error;
    },
    formatResponse: (response: Response) => {
        // console.log(response);
        return response;
    },
});
server.applyMiddleware({ app, path: '/graphql' });

/*==============================
        Setup Server Port
================================ */
let port = process.env.SERVER_PORT || 3000;

/* =============================
        Launch App To Listen
                TO
           Specified Port
================================ */
app.listen(port, () => {
    console.log(`
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Running backend Pi-CMS on port ${port}.
    GraphQL Path: ${server.graphqlPath}
    MongoDB Models: ${mongoConnection.modelNames()}
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`);
});
