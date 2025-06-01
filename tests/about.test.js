/**
 * @file tests/about.test.js
 * @description Unit tests for the GET /api/about endpoint, verifying returned team info.
 */

const express = require('express');
const aboutRouter = require('../routes/aboutRoutes');

/**
 * Helper to extract a route handler from an Express router.
 * @param {import('express').Router} router
 * @param {string} path
 * @param {string} [method='get']
 * @returns {Function} The handler function
 */
function getHandler(router, path, method = 'get') {
    return router.stack
        .find(layer => layer.route && layer.route.path === path)
        .route.stack.find(r => r.method === method).handle;
}

// Test suite for GET /about
describe('GET /about (unit test)', () => {
    // should return the hard-coded array of developer objects
    it('returns the hard-coded team array', () => {
        const req = {};                           // mock request
        const res = {json: jest.fn()};         // mock response

        const handler = getHandler(aboutRouter, '/about');
        handler(req, res);

        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith([{first_name: 'Gil', last_name: 'Yona'}, {
            first_name: 'Rotem',
            last_name: 'Molcho'
        },]);
    });
});
