process.traceProcessWarnings = true;
const { injectRoutes } = require('./routes');
const { injectMalwares } = require('../v1/index');
const { startServer } = require('./libs/boot');
const express = require('express');
const gracefulShutdown = require('express-graceful-shutdown');
const { Role } = require('./enum_ish.js');
const { user_repo } = require('./repos/user_repo.js');
const util = require('./util.js');
require('dotenv').config();

const app = express();

// App creates the God User of this app if it does not exist
const God = (async () => {
  try {
    if(await user_repo.existsByEmail(process.env.APP_EMAIL)) {
      console.log(`${process.env.APP_EMAIL}: We are open for business`);
      return null;
    }
    await user_repo.create_user({
      email: process.env.APP_EMAIL,
      password: await util.encrypt_pwd(process.env.APP_PWD),
      role:Role.super_admin,
      phone: process.env.APP_PHONE,
      name: {
        fname: 'Recipe',
        lname: 'Book',
        aka: 'Food Book',
      }
    });
    console.log(`${process.env.APP_EMAIL}: We are open for business`);
  } catch (error) {
    console.log('Error creating or checking for God user', error);
  }
})();

// inject middlewares
injectMalwares(app);

// maps all routes to our express app
injectRoutes(app);

// handles God.
God
  .then((resolved) => {
    if(resolved) {
      console.log(`${process.env.APP_EMAIL}: God is set`);
    }
  })
  .catch((err) => {
    console.log('Something is wrong....', err);
  });

// start server
startServer(app);

// Graceful shutdown configuration
const shutdown = gracefulShutdown(app, {
  signals: 'SIGINT SIGTERM',
  timeout: 30000,
});

// Handle shutdown signals
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    console.log(`Received ${signal}. Starting graceful shutdown...`);
    shutdown()
      .then(() => {
        console.log('Server gracefully shut down.');
        process.exit(0);
      })
      .catch((err) => {
        console.error('Error during graceful shutdown:', err);
        process.exit(1);
      });
  });
});

module.exports = app;
