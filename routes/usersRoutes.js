/**
 * @file routes/usersRoutes.js
 * @description Express router for handling user-related endpoints.
 */
const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @typedef {Object} UserDocument
 * @property {number} id - Unique numeric identifier for the user.
 * @property {string} first_name - User's first name.
 * @property {string} last_name - User's last name.
 * @property {number} total - Aggregated total value associated with the user.
 */

/**
 * @async
 * @function
 * @name getUserById
 * @route GET /users/:id
 * @description Retrieves a user by their numeric ID.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the user data or an error message.
 *
 * @example
 * // Request:
 * // GET /users/123
 *
 * @example
 * // Success response:
 * // HTTP/1.1 200 OK
 * // {
 * //   "user": {
 * //     "id": 123,
 * //     "first_name": "John",
 * //     "last_name": "Doe",
 * //     "total": 42
 * //   }
 * // }
 *
 * @example
 * // Error response (user not found):
 * // HTTP/1.1 404 Not Found
 * // { "error": "user not found" }
 */
router.get('/users/:id', async (req, res) => {
    // Parse the user ID from route parameters
    const id = Number(req.params.id);

    if (id < 0) {
        return res.status(400).json({error: 'invalid id'});
    }
    // Find the user document by ID, excluding MongoDB internal _id field
    /** @type {UserDocument | null} */
    const user = await User.findOne({id: id}, {_id: 0, first_name: 1, last_name: 1, id: 1, total: 1});

    // If no user is found, return a 404 error
    if (user === null) {
        return res.status(404).json({error: 'user not found'});
    }

    // Return the found user data
    res.status(200).json(user);
});

module.exports = router;
