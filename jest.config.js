/**
 * @file jest.config.js
 * @description Configuration for Jest test runner, defining test environment and setup files.
 * @type {import('jest').Config}
 * @property {string} testEnvironment - The environment for testing (e.g., 'node').
 * @property {string[]} setupFilesAfterEnv - Scripts to run after the test framework is set up.
 */
module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};