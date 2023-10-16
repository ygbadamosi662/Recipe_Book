const UserController = require('../controllers/UserController.js');
const express = require('express');
const userRoutes = express.Router();
/**
 * Binds the routes to the appropriate handler in the
 * given Express application.
 * @param {Express} app The Express application.
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */

userRoutes.get('/get/:id', UserController.get_user);
userRoutes.post('/update', UserController.update_user);
userRoutes.post('/recipe/create', UserController.create_recipe);
userRoutes.post('/recipe/update', UserController.update_recipe);
userRoutes.post('/recipe/get/recipes', UserController.get_recipes);
userRoutes.get('/recipe/delete/:id', UserController.delete_recipe);
userRoutes.post('/recipe/get/recipes/mine', UserController.get_my_recipes);
userRoutes.get('/recipe/get/:id', UserController.get_recipe);
userRoutes.post('/recipe/get/reviews', UserController.get_recipe_reviews);
userRoutes.get('/recipe/fave/:id', UserController.fave_recipe);
userRoutes.post('/recipe/review', UserController.review_recipe);
userRoutes.get('/review/:id', UserController.get_review);
userRoutes.get('/review/delete/:id', UserController.delete_review);
userRoutes.post('/notification/notifications', UserController.get_notifications);
userRoutes.get('/notification/:id', UserController.get_notification);
userRoutes.post('/FollowUnfollow', UserController.follow_unfollow);
userRoutes.post('/FollowUnfollow/get', UserController.get_followers_and_following);




module.exports = { userRoutes };
