/**
 * @file db.js
 * @description Database connection utilities for MongoDB using Mongoose.
 */
const mongoose = require('mongoose');
require('dotenv').config();

/**
 * @async
 * @function connectDB
 * @description Establishes a connection to MongoDB using the URI specified in environment variables.
 * @returns {Promise<typeof mongoose>} Resolves with the mongoose instance upon successful connection.
 * @throws {Error} If the connection fails.
 *
 * @example
 * await connectDB();
 */
async function connectDB() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error('MONGO_URI is not defined in environment');
    }
    return mongoose.connect(uri);
}

/**
 * @async
 * @function disconnectDB
 * @description Closes the Mongoose connection to MongoDB.
 * @returns {Promise<void>} Resolves once the connection is closed.
 *
 * @example
 * await disconnectDB();
 */
async function disconnectDB() {
    return mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB };