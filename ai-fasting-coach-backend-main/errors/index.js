const NotFound = require('./not-found');
const BadRequest = require('./bad-request');
const CustomApiError = require('./custom-api');
const Unauthenticated = require('./unauthenticated');

module.exports = { NotFound, BadRequest, CustomApiError, Unauthenticated };
