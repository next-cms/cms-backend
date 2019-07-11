/* =============================
        Import All
================================ */
import mongoose from "./config/mongoDBConfig";
import {ApolloServer} from 'apollo-server-express';
/* =============================
        Import The App
================================ */
import app from "./app";
import {resolvers, typeDefs} from './schema/schema';
import dotenv from "dotenv";

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
const mongoDB = mongoose.connection;

/* =============================
        Setup Routes
================================ */

const server = new ApolloServer({typeDefs, resolvers});
server.applyMiddleware({app});

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
    console.log(`Running backend pi cms on port ${port}. GraphQL path is ${server.graphqlPath}`);
});
