/**

 @file models/Report.js

 @description Mongoose model definition for a monthly cached report of user costs.
  This schema is used to store pre-computed monthly reports for each user.
  Each report groups the user's costs by category and stores them as an array of objects,
  where each object maps a category to its list of items.
  Reports are created automatically via GET /report if not cached,
  and are deleted automatically when new cost data is added for that month via POST /add.
 */
const { model, Schema } = require('mongoose');

/**
 * @typedef {Object} ReportDocument
 * @property {number} userid - Numeric ID of the user who incurred the cost.
 * @property {number} year - Year of the report.
 * @property {Object[]} costs - Array of category-to-items maps.
 * @property {number} month - Month of the report.
 * @property {Date} lastUpdated - Date when the report was recorded; defaults to now.
 */
const reportSchema = new Schema(
    /** @type {import('mongoose').SchemaDefinition<ReportDocument>} */({
        userid: { type: Number, required: true },
        year: { type: Number, required: true },
        month:{type:Number,required:true},
        costs: {
            type: [
                {
                    type: Map,
                    of: [
                        {
                            sum: Number,
                            description: String,
                            day: Number
                        }
                    ]
                }
            ],
            required: true
        },
    }),
    { versionKey: false ,
    toJSON:   { transform: (_, ret) => { delete ret._id;} },
    toObject: { transform: (_, ret) => { delete ret._id;} },
    }
);

module.exports = model('Report', reportSchema);
