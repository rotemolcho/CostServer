/**
 * @file models/User.js
 * @description Mongoose model definition for a user document in the database.
 */
const { model, Schema } = require('mongoose');

/**
 * @typedef {Object} UserDocument
 * @property {number} id - Unique numeric identifier for the user.
 * @property {string} first_name - User's first name.
 * @property {string} last_name - User's last name.
 * @property {Date} [birthday] - User's date of birth.
 * @property {string} [marital_status] - User's marital status (e.g., 'single', 'married').
 * @property {number} total - Aggregated total cost associated with the user (default 0).
 */
const userSchema = new Schema(
    /** @type {import('mongoose').SchemaDefinition<UserDocument>} */
    {
        id: { type: Number, required: true, unique: true },
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        birthday: { type: Date },
        marital_status: { type: String },
        total: { type: Number, default: 0 },
    },
    { versionKey: false }
);

module.exports = model('users', userSchema);
