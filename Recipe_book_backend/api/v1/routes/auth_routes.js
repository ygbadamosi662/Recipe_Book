const AppController = require("../controllers/AppController.js");
// const UserController = require('../controllers/UserController.js');
const { userRoutes } = require('./user_routes.js');
const express = require('express');

const authRoutes = express.Router();

/**
 * Binds the routes to the appropriate handler in the
 * given Express application.
 * @param {Express} app The Express application.
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */
authRoutes.get('/logout', AppController.logout);

// mapped Routes
authRoutes.use('/users', userRoutes);



module.exports = { authRoutes };
