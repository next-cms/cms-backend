/* =============================
        Import All
================================ */
const apiRoutes = require("../api/routes/apiRoutes");
const authRoutes = require("../api/routes/authRoutes");
const mongoose = require("../config/mongoDBConfig");
const { ApolloServer, gql } = require('apollo-server-express');

/* =============================
        Import The App
================================ */
import app from "./app";
import {typeDefs, resolvers} from './schema/schema';

/* =============================
        Setup Database
================================ */
const mongoDB = mongoose.connection;

/* =============================
        Setup Routes
================================ */

const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app });

// Default Route
app.get("/", (req, res) => {
  res.send("Hello viva cms back end.");
});

// Auth Routes
app.use("/auth", authRoutes);

// API Routes
app.use("/api", apiRoutes);


/*==============================
        Setup Server Port
================================ */
let port = process.env.PORT || 3000;

/* =============================
        Launch App To Lister
                TO
        Specified Port
================================ */
app.listen(port, () => {
  console.log(`Running backend pi cms on port ${port}. GraphQL path is ${server.graphqlPath}`);
});
