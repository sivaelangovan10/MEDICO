const mongoose = require("mongoose");

let connectionPromise = null;

async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not configured.");
    }

    // Share only an in-flight connection attempt between warm invocations.
    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        }).finally(() => {
            connectionPromise = null;
        });
    }

    await connectionPromise;
    return mongoose.connection;
}

module.exports = connectDB;
