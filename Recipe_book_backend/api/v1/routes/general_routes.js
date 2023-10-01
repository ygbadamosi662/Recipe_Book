const AppController = require("../controllers/AppController.js");
const UserController = require('../controllers/UserController.js');
const { auth_token } = require('../jwt_service.js');
const express = require('express');

const generalRoutes = express.Router();

/**
 * Binds the routes to the appropriate handler in the
 * given Express application.
 * @param {Express} app The Express application.
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */

generalRoutes.get('/', AppController.home);
generalRoutes.get('/play', AppController.play);
generalRoutes.post('/register', AppController.register_user);
generalRoutes.post('/login', AppController.login);
generalRoutes.get('/get_user', auth_token, UserController.get_user);
generalRoutes.get('/logout', auth_token, AppController.logout);



module.exports = generalRoutes;
