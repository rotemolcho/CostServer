/**
 * @file tests/id.test.js
 * @description Unit tests for the GET /api/users/:id endpoint.
 * Tests for retrieving a user's data and handling invalid or missing IDs.
 */

const User = require('../models/User');
const Cost = require('../models/Cost');

// Seed a user + cost before tests
async function seedUserAndCost() {
    await User.create({id: 12341234, first_name: 'mosh', last_name: 'israeli'});
    await Cost.create({
        userid: 12341234, description: 'pizza', category: 'food', sum: 40, date: new Date(Date.UTC(2025, 2, 10)),
    });
    // update user total
    const [{totalSum}] = await Cost.aggregate([{$match: {userid: 12341234}}, {
        $group: {
            _id: null, totalSum: {$sum: '$sum'}
        }
    },]);
    await User.updateOne({id: 12341234}, {$set: {total: totalSum}});
}

// Test suite for GET /api/users/:id
describe('GET /api/users/:id (unit test)', () => {
    beforeAll(async () => {
        await seedUserAndCost();
    });
    afterAll(async () => {
        await User.deleteMany();
        await Cost.deleteMany();
    });

    // existing user returns 200 + correct data
    it('returns 200 and the correct user data', async () => {
        const res = await request.get('/api/users/12341234');
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            id: 12341234, first_name: 'mosh', last_name: 'israeli', total: 40,
        });
    });

    // missing user returns 404
    it('returns 404 when the user does not exist', async () => {
        const res = await request.get('/api/users/999999');
        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/user not found/i);
    });

    //negative id returns 400
    it('returns 400 when the id is negative', async () => {
        const res = await request.get('/api/users/-1');
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/invalid id/i);
    });
});
