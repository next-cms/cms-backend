/* ===========================
        Import All
============================== */
import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();
/* ===========================
        Setup Config
============================== */
const mongoClient = (function connectWithMongoDB() {
    const mongoDB = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}`;
    // const mongoDB = 'mongodb://localhost/pi_cms';

    /* const options = {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        autoIndex: false, // Don't build indexes
        reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
        reconnectInterval: 500, // Reconnect every 500ms
        poolSize: 10, // Maintain up to 10 socket connections
        // If not connected, return errors immediately rather than waiting for reconnect
        bufferMaxEntries: 0,
        connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4 // Use IPv4, skip trying IPv6
      }; */

    const options = {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: true,
        autoIndex: false, // Don't build indexes
        reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
        reconnectInterval: 500, // Reconnect every 500ms
        poolSize: 10, // Maintain up to 10 socket connections
        // If not connected, return errors immediately rather than waiting for reconnect
        bufferMaxEntries: 0,
        connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    mongoose.connect(mongoDB, options).then(
        () => {
            console.log("MongoDB Connected! Ready to use MongoDB.")
            // User.collection.drop();
        },
        err => {
            console.log("Failed to connect with MongoDB!");
            console.log(err);
        });

    return mongoose;
})();

export default mongoClient;
