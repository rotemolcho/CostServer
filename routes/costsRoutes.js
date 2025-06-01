/**
 * @file routes/costsRoutes.js
 * @description Express router for cost management: adding costs and generating reports.
 */
const express = require('express');
const router = express.Router();
const Cost = require('../models/Cost');
const User = require('../models/User');
const Report = require('../models/Report');

/**
 * @typedef {Object} CostDocument
 * @property {number} userid - Numeric ID of the user.
 * @property {string} description - Description of the cost.
 * @property {string} category - Category of the cost (e.g., 'food', 'health').
 * @property {number} sum - Amount spent.
 * @property {Date} [date] - Date of the cost.
 */

/**
 * @route POST /add
 * @description Adds a new cost record for a user and invalidates the cached report if needed.
 * @access Public
 * @param {import('express').Request} req - Express request object.
 * @param {Object} req.body - Request body.
 * @param {number|string} req.body.userid - User's ID.
 * @param {string} req.body.description - Description of the cost.
 * @param {string} req.body.category - Cost category ('food', 'health', etc.).
 * @param {number} req.body.sum - Amount spent.
 * @param {string|Date} [req.body.date] - Date of the cost (optional).
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<CostDocument>} Created cost object.
 *
 * @example
 * // POST /add
 * // Body: { userid: 1, description: 'Coffee', category: 'food', sum: 3.5 }
 */
router.post('/add', async (req, res) => {
    try {
        const {userid, description, category, sum, date} = req.body;

        if (!userid || !description || !category || !sum) {
            return res.status(400).json({error: 'missing fields'});
        }
        const finalId = Number(userid);
        if (!Number.isInteger(finalId) || finalId < 0) {
            return res.status(400).json({error: 'invalid userid'});
        }

        if (!Number.isFinite(sum)) {
            return res.status(400).json({error: 'invalid sum'});
        }

        let finalDate = new Date();
        if (date !== undefined) {
            let parsed = new Date(date);
            if (isNaN(parsed.getTime())) {
                return res.status(400).json({error: 'invalid date'});
            }
            finalDate = parsed;
        }
        const categories = ['food', 'health', 'housing', 'sport', 'education'];
        if (!categories.includes(category)) {
            return res.status(400).json({error: 'invalid category'});
        }

        const user = await User.findOne({id: finalId});
        if (!user) {
            return res.status(404).json({error: 'user not found'});
        }

        const cost = await Cost.create({
            userid: finalId, description, category, sum, date,
        });
        const costDate = date ? new Date(finalDate) : new Date();
        const reportYear = costDate.getFullYear();
        const reportMonth = costDate.getMonth() + 1;
        await Report.deleteOne({
            userid: finalId, year: reportYear, month: reportMonth,
        });

        const totalAgg = await Cost.aggregate([{$match: {userid: finalId}}, {
            $group: {
                _id: null, totalSum: {$sum: '$sum'}
            }
        },]);

        const newTotal = totalAgg[0]?.totalSum || 0;
        await User.updateOne({id: finalId}, {$set: {total: newTotal}});
        res.status(201).json(cost);
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

/**
 * @route GET /report
 * @description Returns a user's monthly cost report. If a cached report exists in the database,
 * it is returned immediately. Otherwise, a new report is generated using aggregation,
 * stored in the Report collection, and then returned. * @access Public
 * @param {import('express').Request} req - Express request object.
 * @param {Object} req.query - Request query parameters.
 * @param {number|string} req.query.userid - User's ID.
 * @param {number|string} req.query.year - Year of the report.
 * @param {number|string} req.query.month - Month of the report (1–12).
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<Object>} JSON report with grouped cost data.
 *
 * @example
 * // GET /report?userid=1&year=2025&month=5
 */
router.get('/report', async (req, res) => {
    const {userid, year, month} = req.query;
    if (!userid || !year || !month) {
        return res.status(400).json({error: 'userid, year, month are required'});
    }

    const finalID = Number(userid);
    const finalYear = Number(year);
    const finalMonth = Number(month);
    const currentYear = new Date().getFullYear();

    if (!Number.isInteger(finalID) || finalID < 0 || !Number.isInteger(finalYear) || finalYear < 0 || finalYear > currentYear || !Number.isInteger(finalMonth) || finalMonth < 1 || finalMonth > 12) {
        return res.status(400).json({error: 'invalid parameters'});
    }
    const userExists = await User.exists({id: finalID});
    if (!userExists) {
        return res.status(404).json({error: 'user not found'});
    }

    const cachedReport = await Report.findOne({userid: finalID, year: finalYear, month: finalMonth});
    if (cachedReport) {
        return res.json(cachedReport);
    }
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    const pipeline = [{
        $match: {
            userid: finalID, date: {$gte: startDate, $lt: endDate},
        },
    }, {
        $project: {
            _id: 0, category: 1, sum: 1, description: 1, day: {$dayOfMonth: '$date'},
        },
    }, {
        $group: {
            _id: '$category', items: {$push: {sum: '$sum', description: '$description', day: '$day'}},
        },
    },];

    const categoryBuckets = await Cost.aggregate(pipeline);
    const categories = ['food', 'education', 'health', 'housing', 'sport'];

    const grouped = categories.map((cat) => {
        const found = categoryBuckets.find((b) => b._id === cat);
        return {[cat]: found ? found.items : []};
    });

    await Report.create({
        userid: finalID, year: Number(year), month: Number(month), costs: grouped,
    });

    res.json({
        userid: finalID, year: Number(year), month: Number(month), costs: grouped,
    });
});

module.exports = router;