/**
 * @file models/Cost.js
 * @description Mongoose model definition for a cost entry in the database.
 */
const { model, Schema } = require('mongoose');

/**
 * @typedef {Object} CostDocument
 * @property {number} userid - Numeric ID of the user who incurred the cost.
 * @property {string} description - Description of the cost entry.
 * @property {'food'|'health'|'housing'|'sport'|'education'} category - Category of the cost.
 * @property {number} sum - Amount spent.
 * @property {Date} [date] - Date when the cost was recorded; defaults to now.
 */
const costSchema = new Schema(
    /** @type {import('mongoose').SchemaDefinition<CostDocument>} */({
        userid: { type: Number, required: true },
        description: { type: String, required: true },
        category: {
            type: String,
            enum: ['food', 'health', 'housing', 'sport', 'education'],
            required: true,
        },
        sum: { type: Number, required: true },
        date: { type: Date, default: Date.now },
    }),
    { versionKey: false }
);

module.exports = model('Cost', costSchema);
