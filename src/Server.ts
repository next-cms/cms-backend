export declare var PopStateEvent: any;
/* =============================
        Import All
================================ */
import mongoClient from "./service-providers/MongoClient";
import { ApolloServer} from 'apollo-server-express';
import dotenv from "dotenv";
import {Response} from 'express';
import schemas from './schemas';
import resolvers from './resolvers';

/* =============================
        Import The App
================================ */
import app from "./App";
import {createContext} from "./resolvers/Authorization";
import ProjectController from "./services/project-service/ProjectController";

dotenv.config();
process.on('exit', ProjectController.cleanUp);
process.on('SIGINT', ProjectController.cleanUp); //catch ctrl+c event
process.on('SIGTERM', ProjectController.cleanUp); // catch kill
// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', ProjectController.cleanUp);
process.on('SIGUSR2', ProjectController.cleanUp);
//catches uncaught exceptions
process.on('uncaughtException', ProjectController.cleanUp);

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
    context: createContext,
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
