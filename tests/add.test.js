/**
 * @file tests/add.test.js
 * @description Unit tests for the POST /api/add endpoint, covering validation,
 * success, and report cache invalidation behavior
 */

const User = require('../models/User');
const Cost = require('../models/Cost');
const Report = require('../models/Report');


// Seed a user before each test
async function seedUser() {
    await User.create({
        id: 12341234, first_name: 'mosh', last_name: 'israeli', total: 0,
    });
}

// Test suite for POST /api/add
describe('POST /api/add (unit test)', () => {
    // Ensure a user exists for cost creation
    beforeEach(async () => {
        await seedUser();
    });

    // Clean up after each test
    afterEach(async () => {
        await User.deleteOne({id: 12341234});
        await Cost.deleteMany();
        await Report.deleteMany();
    });

    // successful creation when date provided
    it('creates a cost and updates user total with provided date', async () => {
        const body = {
            userid: 12341234,
            description: 'hamburger',
            category: 'food',
            sum: 45,
            date: new Date(Date.UTC(2025, 2, 10)),
        };
        const res = await request.post('/api/add').send(body);

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
            userid: body.userid, description: body.description, category: body.category, sum: body.sum,
        });
        // date should match exactly
        expect(new Date(res.body.date).getTime()).toBe(body.date.getTime());

        // verify DB entries
        const dbCost = await Cost.findOne({description: body.description});
        expect(dbCost).not.toBeNull();
        expect(dbCost.sum).toBe(body.sum);

        const user = await User.findOne({id: 12341234});
        expect(user.total).toBe(body.sum);
    });

    // successful creation when date omitted
    it('creates a cost and updates user total without provided date', async () => {
        const body = {
            userid: 12341234, description: 'hamburger', category: 'food', sum: 45,
        };
        const res = await request.post('/api/add').send(body);

        expect(res.status).toBe(201);
        expect(res.body.date).toBeDefined();
        // date is “now”
        const createdTs = new Date(res.body.date).getTime();
        const now = Date.now();
        expect(Math.abs(now - createdTs)).toBeLessThan(2000);

        const dbCost = await Cost.findOne({description: body.description});
        expect(dbCost).not.toBeNull();
        expect(dbCost.sum).toBe(body.sum);

        const user = await User.findOne({id: 12341234});
        expect(user.total).toBe(body.sum);
    });

    // successfull creating a new cost and deleting the previous report
    it('deletes cached report after adding a new cost', async () => {
        const date = new Date(Date.UTC(2025, 2, 10));
        await Report.create({
            userid: 12341234,
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            costs: [{food: []}],
            lastUpdated: new Date()
        });

        await request.post('/api/add').send({
            userid: 12341234, description: 'coffee', category: 'food', sum: 15, date
        });

        const cached = await Report.findOne({userid: 12341234, year: 2025, month: 3});
        expect(cached).toBeNull();
    });

    // missing `sum` triggers 400
    it('returns 400 for missing fields', async () => {
        const body = {
            userid: 12341234, description: 'hamburger', category: 'food', // sum missing
        };
        const res = await request.post('/api/add').send(body);
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/missing fields/i);
    });

    //negative id triggers 400
    it('returns 400 for negative userid', async () => {
        const res = await request.post('/api/add').send({
            userid: -1, description: 'milk', category: 'food', sum: 10
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/invalid userid/i);
    });

    // invalid category triggers 400
    it('returns 400 for invalid category', async () => {
        const body = {
            userid: 12341234, description: 'wine', category: 'alcohol', sum: 45,
        };
        const res = await request.post('/api/add').send(body);
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/invalid category/i);
    });

    // non-existent user triggers 404
    it('returns 404 if user is not found', async () => {
        const body = {
            userid: 999999, description: 'hamburger', category: 'food', sum: 69,
        };
        const res = await request.post('/api/add').send(body);
        expect(res.status).toBe(404);
        expect(res.body.error).toMatch(/user not found/i);
    });

    // invalid date triggers 400
    it('returns 400 for invalid date', async () => {
        const res = await request.post('/api/add').send({
            userid: 12341234, description: 'bad date', category: 'food', sum: 10, date: 'not-a-date'              // ← תאריך לא תקין
        });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/invalid date/i);
    });

    // invalid sum triggers 400
    it('returns 400 for invalid sum', async () => {
        const res = await request.post('/api/add').send({
            userid: 12341234, description: 'bad sum', category: 'food', sum: 'abc'                      // ← לא מספר
        });

        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/invalid sum/i);
    });
});
