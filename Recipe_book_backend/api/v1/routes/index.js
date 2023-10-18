const { Express } = require('express');
const { generalRoutes } = require('./general_routes');
const { authRoutes } = require('./auth_routes');
const { authenticate_token } = require('../services/jwt_service');

const PATH_PREFIX = '/api/v1';
/**
 * Injects routes with their handlers to the given Express application.
 * @param {Express} app
 */
const injectRoutes = (app) => {
  app.use(PATH_PREFIX+'/general', generalRoutes);
  app.use(PATH_PREFIX+'/auth', authenticate_token, authRoutes);
};

module.exports = { injectRoutes };
