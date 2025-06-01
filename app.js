/**
 * @file app.js
 * @description Main Express application setup for the Cost Manager API, including middleware and routing.
 */
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();

const usersRouter = require('./routes/usersRoutes');
const costsRouter = require('./routes/costsRoutes');
const aboutRouter = require('./routes/aboutRoutes');

const app = express();
app.get('/', (req, res) => {
    res.send('👋 CostServer is live and routing!');
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('json spaces', 2);

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Mount routers for API endpoints under /api
 */
app.use('/api', usersRouter);
app.use('/api', costsRouter);
app.use('/api', aboutRouter);

/**
 * Catch 404 and forward to error handler
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
app.use(function (req, res, next) {
    next(createError(404));
});

/**
 * Error handler middleware
 * @param {Error} err - Error object
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
app.use(function (err, req, res, next) {
    // Set locals, only providing error details in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // Render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
