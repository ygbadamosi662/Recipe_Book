process.traceProcessWarnings = true;
const generalRoutes = require('./routes/general_routes.js');
const express = require('express');
const cors = require('cors');
const gracefulShutdown = require('express-graceful-shutdown');
const morgan = require('morgan');
require('dotenv').config();

// const db_storage = require('./models/engine/db_storage.js');


const app = express();
const PORT = 1245;
const PATH_PREFIX = '/api/v1';


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
// generalRoutes(app);

app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});

app.use(gracefulShutdown(app));

module.exports = app;
