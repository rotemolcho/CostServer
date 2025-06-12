/**
 * @file tests/report.test.js
 * @description Unit tests for the GET /api/report endpoint, verifying grouping logic,
 * validation, and cached report behavior
 */

const User = require('../models/User');
const Cost = require('../models/Cost');
const Report = require('../models/Report');


// Seed user and costs for report tests
async function seedUserAndCosts() {
    await User.create({id: 12341234, first_name: 'mosh', last_name: 'israeli', total: 0});
    await Cost.create({
        userid: 12341234,
        description: 'math book',
        category: 'education',
        sum: 82,
        date: new Date(Date.UTC(2025, 2, 10)),
    });
    await Cost.create({
        userid: 12341234, description: 'pizza', category: 'food', sum: 30, date: new Date(Date.UTC(2025, 2, 10)),
    });
}

// Test suite for GET /api/report
describe('GET /api/report?id=&year=&month= (unit test)', () => {
    beforeEach(async () => {
        await seedUserAndCosts();
    });
    afterEach(async () => {
        await User.deleteOne({id: 12341234});
        await Cost.deleteMany();
        await Report.deleteMany();
    });

    // valid query returns grouped cost buckets
    it('returns monthly costs grouped by category', async () => {
        const res = await request
            .get('/api/report')
            .query({id: 12341234, year: 2025, month: 3});

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({userid: 12341234, year: 2025, month: 3});

        // verify education bucket
        const edu = res.body.costs.find(o => o.education);
        expect(edu.education).toHaveLength(1);
        expect(edu.education[0]).toMatchObject({sum: 82, description: 'math book', day: 10});

        // verify food bucket
        const food = res.body.costs.find(o => o.food);
        expect(food.food[0].sum).toBe(30);
    });

    // non-existent user returns 404
    it('returns 404 if the user is missing', async () => {
        const res = await request
            .get('/api/report')
            .query({id: 999999, year: 2025, month: 3});

        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/user not found/i);
    });

    // missing query params returns 400
    it('returns 400 on partial query params', async () => {
        const res = await request
            .get('/api/report')
            .query({id: 12341234, month: 3});

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/id, year, month are required/i);
    });

    // invalid year triggers 400
    it('returns 400 if year is invalid', async () => {
        const res = await request.get('/api/report').query({id: 12341234, year: -2, month: 3});
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/invalid parameters/i);
    });

    // invalid month triggers 400
    it('returns 400 if month is invalid', async () => {
        const res = await request.get('/api/report').query({id: 12341234, year: 2025, month: 13});
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/invalid parameters/i);
    });

    // an available cached report triggers 400
    it('returns cached report if available', async () => {
        await Report.create({
            userid: 12341234,
            year: 2025,
            month: 3,
            costs: [{food: [{sum: 30, description: 'pizza', day: 10}]}],
            lastUpdated: new Date()
        });

        const res = await request.get('/api/report').query({id: 12341234, year: 2025, month: 3});
        expect(res.status).toBe(200);
        expect(res.body.costs).toEqual(expect.arrayContaining([expect.objectContaining({food: expect.any(Array)})]));
    });

});
