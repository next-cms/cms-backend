/* ===========================
        Import All
============================== */
import mongoose from 'mongoose';
import User from "../model/User";

/* ===========================
        Setup Config
============================== */
const mongoClient = (function connectWithMongoDB() {
    const mongoDB = 'mongodb://user:password123@localhost:27017/pi_cms';
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
        useFindAndModify: false,
        useCreateIndex: true
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
