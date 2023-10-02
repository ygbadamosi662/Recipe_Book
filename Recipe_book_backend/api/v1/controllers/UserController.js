/**
 * Contains the UserController class 
 * which defines route handlers.
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */
const util = require('../util');
const { user_repo } = require('../repos/user_repo');
const { Recipe } = require('../repos/recipe_repo');
const MongooseError = require('mongoose').Error;
const JsonWebTokenErro = require('jsonwebtoken').JsonWebTokenError;
const Joi = require('joi');
const { db_storage } = require('../models/engine/db_storage');

class UserController {
  static async get_user(req, res) {
    try {
      const user = await user_repo.findByEmail(req.user.email);
      return res.status(200).json(user);
    } catch (error) {
      if (error instanceof MongooseError) {
        console.log('We have a mongoose problem', error.message);
        res.status(500).json({error: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        console.log('We have a jwt problem', error.message);
        res.status(500).json({error: error.message});
      }
      console.log(error);
      res.status(500).json({error: error.message});
    }
  }

  static async create_recipe(req, res) {
    try {
      const schema = Joi.object({
        name: Joi
          .string()
          .required(),
        ingredients: Joi
          .array()
          .items(Joi.string())
          .required(),
        guide: Joi
          .array()
          .items(Joi.string()),
        inspiration: Joi.string(),
        type: Joi
          .string()
          .required(),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      const some_task = Promise.all([
        Recipe.exists({name: value.name}),
        user_repo.findByEmail(req.user.email, ['id'])
      ]);

      const results = await some_task;
      if (results[0]) {
        return res
          .status(400)
          .json({
            message: `Invalid request, you already created a ${value.name} Recipe, update it if you want`,
          })
      }
      value.user = results[1];
      const recipe = await Recipe
        .create(value);
      return res
        .status(200)
        .json({
          message: `Recipe ${recipe.name} successfully created`,
        });
    } catch (error) {
      
      if (error instanceof MongooseError) {
        console.log('We have a mongoose problem', error.message);
        res.status(500).json({error: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        console.log('We have a jwt problem', error.message);
        res.status(500).json({error: error.message});
      }
      console.log(error);
      res.status(500).json({error: error.message});
    }
  }
}
  
module.exports = UserController;
