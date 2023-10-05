const util = require('../util');
const { user_repo, User } = require('../repos/user_repo');
const { Recipe, recipe_repo } = require('../repos/recipe_repo');
const MongooseError = require('mongoose').Error;
const JsonWebTokenErro = require('jsonwebtoken').JsonWebTokenError;
const Joi = require('joi');
const { db_storage } = require('../models/engine/db_storage');
const { Permit } = require('../enum_ish');
/**
 * Contains the UserController class 
 * which defines route handlers.
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */

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
        permit: Joi
          .string()
          .valid(...Object.values(Permit))
          .required()
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
          recipe: recipe,
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

  static async update_recipe(req, res) {
    try {
      const schema = Joi.object({
        id: Joi
          .string()
          .required(),
        name: Joi
          .string(),
        ingredients: Joi
          .array()
          .items(Joi.string()),
        guide: Joi
          .array()
          .items(Joi.string()),
        inspiration: Joi
          .string(),
        type: Joi
          .string(),
        permit: Joi
          .string()
          .valid(...Object.values(Permit))
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      // update recipe
      const exist_promise = Recipe.exists({ id: value.id });
      const update_data = util.get_what_is_set(value, ['id']);

      // validate recipe
      const exists = await exist_promise;

      if (exists === false) {
        return res
          .status(400)
          .json({
            message: `Invalid request, There is no recipe with id: ${value.id}`,
          })
      }

      const result = await Recipe.updateOne({ id: value.id }, update_data);

      return res
        .status(200)
        .json({
          message: `Recipe ${value.id} successfully updated`,
          result,
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
  
  static async get_recipe(req, res) {
    try {
      if (!req.params.id) { return res.status(400).json({ msg: 'id is required'}); }
      const recipe = await Recipe.findById(req.params.id).exec();

      if (recipe.permit === Permit.private) {
        const user = await user_repo.findByEmail(req.user.email, ['id']);
        if (user.id !== recipe.user) {
          return res
            .status(401)
            .json({
              msg: 'Invalid Request, Recipe is private',
            })
        }
      }

      return res
        .status(200)
        .json({
          recipe: recipe,
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

  static async get_recipes(req, res) {
    try {
      const schema = Joi.object({
        name: Joi
          .string(),
        ingredients: Joi
          .array()
          .items(Joi.string()),
        guide: Joi
          .array()
          .items(Joi.string()),
        type: Joi
          .string(),
        page: Joi
          .number()
          .integer(),
        size: Joi
          .number()
          .integer()
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      if (error) {
        throw error;
      }
      const user_promise = user_repo.findByEmail(req.user.email);

      // get the set fields
      let filters_and_pageStuff = util.get_what_is_set(value);

      if (filters_and_pageStuff['name']) {
        // passing a regex
        filters_and_pageStuff.name = new RegExp(`${filters_and_pageStuff['name']}`);
      }

      // recipe_repo.get_recs() handles the filtering and paging
      const recs = await recipe_repo.get_recs(filters_and_pageStuff);
      return res
        .status(200)
        .json({
          recipes: recs
            .filter(async (recipe) => {
              if (recipe.permit === Permit.private) {
                // filters out pivate recipes if user !== recipe.user
                return await user_promise === recipe.user;
              }
              return true;
            }),
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

  static async get_my_recipes(req, res) {
    try {
      const schema = Joi.object({
        name: Joi
          .string(),
        ingredients: Joi
          .array()
          .items(Joi.string()),
        guide: Joi
          .array()
          .items(Joi.string()),
        type: Joi
          .string(),
        faves: Joi
          .string(),
        permit: Joi
          .string()
          .valid(...Object.values(Permit)),
        page: Joi
          .number()
          .integer(),
        size: Joi
          .number()
          .integer()
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      if (value.faves === 'YES' ) {
        const user = await User
          .findOne({email: req.user.email})
          .select('faves')
          .populate('faves')
          .exec();
        
        return res
          .status(200)
          .json({
            faves: user.faves,
          });

      }
      const user_promise = User
        .findOne({email: req.user.email})
        .select('id');

      let filters_and_pageStuff = util.get_what_is_set(value);
      if (filters_and_pageStuff['name']) {
        filters_and_pageStuff.name = new RegExp(`${filters_and_pageStuff['name']}`);
      }

      filters_and_pageStuff.user = await user_promise;

      const recs = await recipe_repo.get_recs(filters_and_pageStuff);

      // const recs = await 
      return res
        .status(200)
        .json({
          recipes: recs,
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
