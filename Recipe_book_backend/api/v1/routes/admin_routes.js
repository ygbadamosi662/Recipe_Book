const UserController = require('../controllers/UserController.js');
const AdminController = require('../controllers/AdminController.js');
const { authenticate_super_admin } = require('../mws.js')
const express = require('express');
const adminRoutes = express.Router();
/**
 * Defines the routes particular to admins only
 * given Express application.
 * @param {Express} app The Express application.
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */

adminRoutes.post('/role/switcheroo', authenticate_super_admin, AdminController.role_switcheroo);
adminRoutes.post('/find/user', AdminController.find_user);
adminRoutes.post('/get/users', AdminController.get_users);
adminRoutes.post('/get/recipes', AdminController.get_recipes);
adminRoutes.post('/get/reviews', AdminController.get_reviews);
adminRoutes.post('/get/notifications', AdminController.get_notifications);


module.exports = { adminRoutes };
