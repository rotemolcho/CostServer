/**
 * @file tests/setup.js
 * @description Initializes an in-memory MongoDB server for testing and injects a global request agent.
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

global.request = supertest(app);

let mongo;

// Start the in-memory server before all tests
beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
});

// Clear collections after each test for isolation
afterEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (const c of collections) {
        await c.deleteMany({});
    }
});

// Close DB and stop server when done
afterAll(async () => {
    await mongoose.connection.close();
    await mongo.stop();
});
