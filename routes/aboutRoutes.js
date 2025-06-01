/**
 * @file routes/aboutRoutes.js
 * @description Express router for the about endpoint, returning developer info.
 */
const express = require('express');
const router = express.Router();

/**
 * @typedef {Object} Developer
 * @property {string} first_name - First name of the developer.
 * @property {string} last_name - Last name of the developer.
 */

/**
 * @route GET /about
 * @description Returns a JSON array of developers' first and last names.
 * @access Public
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Developer[]} Array of developer objects.
 *
 * @example
 * // GET /about
 * // HTTP/1.1 200 OK
 * // [
 * //   { "first_name": "Gil", "last_name": "Yona" },
 * //   { "first_name": "Rotem", "last_name": "Molcho" }
 * // ]
 */
router.get('/about', (_, res) => {
    res.json([{first_name: 'Gil', last_name: 'Yona'}, {first_name: 'Rotem', last_name: 'Molcho'}]);
});

module.exports = router;
