process.traceProcessWarnings = true;
const { generalRoutes } = require('./routes/general_routes.js');
const { authRoutes } = require('./routes/auth_routes.js');
const { authenticate_token } = require('./services/jwt_service.js');
const express = require('express');
const cors = require('cors');
const gracefulShutdown = require('express-graceful-shutdown');
const morgan = require('morgan');
const { Role } = require('./enum_ish.js');
const { user_repo } = require('./repos/user_repo.js');
const util = require('./util.js');
require('dotenv').config();



const app = express();
const PORT = 1245;
const PATH_PREFIX = '/api/v1';

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
  } catch (error) {
    console.log('Error creating or checking for God user', error);
  }
})();

// Enable cors
app
  .use(
    cors({
      origin: 'https://127.0.0.1:3000',
      methods: 'GET,POST',
      credentials: true, // Include cookies in CORS requests
      optionsSuccessStatus: 204, // Respond with a 204 status for preflight requests
    })
  );

// to parse request json
app.use(express.json());

// for logging requests details
app.use(morgan('dev'));

// maps all routes to our express app
app.use(PATH_PREFIX+'/general', generalRoutes);
app.use(PATH_PREFIX+'/auth', authenticate_token, authRoutes);

// handles God.
God
  .then((resolved) => {
    if(resolved) {
      console.log(`${process.env.APP_EMAIL}: We are open for business`);
    }
  })
  .catch((err) => {
    console.log('Something is wrong....', err);
  });

app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});

app.use(gracefulShutdown(app));

module.exports = app;
