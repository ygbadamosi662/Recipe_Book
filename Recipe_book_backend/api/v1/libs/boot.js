require('dotenv').config();
const { Express } = require('express');
const { redisClient } = require('../redis');

/**
 * Starts server
 * @param {Express} app
 */
const startServer = (app) => {
  const port = process.env.APP_PORT || 5000;
  // ping redis server
  redisClient.isAlive()
    .then((res) => {
      if(res) {
        console.log(`Redis is alive`);
      }
    });
  app.listen(port, () => {
    console.log(`Server listening on PORT ${port}`);;
  });
};

module.exports = { startServer };
