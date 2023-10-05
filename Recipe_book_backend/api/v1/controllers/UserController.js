const util = require('../util');
const { user_repo, User } = require('../repos/user_repo');
const { Recipe, recipe_repo } = require('../repos/recipe_repo');
const { review_repo, Review } = require('../repos/review_repo');
const MongooseError = require('mongoose').Error;
const JsonWebTokenErro = require('jsonwebtoken').JsonWebTokenError;
const Joi = require('joi');
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
        description: Joi
          .string(),
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
      const user = await user_repo.findByEmail(req.user.email);
      const rec_exists = await Recipe.exists({name: value.name, user: user});
      
      // if recipe already created by user
      if (rec_exists) {
        return res
          .status(400)
          .json({
            message: `Invalid request, you already created a ${value.name} Recipe, update it if you want`,
          })
      }
      value.user = user;
      
      const recipe = await Recipe
        .create(value);
      
      user.recipes.push(recipe);
      user.save();
      recipe.user = recipe.user.id;
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
        description: Joi
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
          message: `Recipe ${result.id} successfully updated`,
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

      if (!recipe) {
        return res
          .status(401)
          .json({
            msg: 'Invalid Request, recipe does not exist',
          });
      }

      if (recipe.permit === Permit.private) {
        const user = await user_repo.findByEmail(req.user.email, ['id']);
        if (user.id !== recipe.user) {
          return res
            .status(401)
            .json({
              msg: 'Invalid Request, Recipe is private',
            });
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

  // static async update_user() {
  //   try {
  //     const schema = Joi.object({
  //       fname: Joi
  //         .string(),
  //       lname: Joi
  //         .string(),
  //       phone: Joi
  //         .string()
  //         .pattern(/^[8792][01]\d{8}$/),
  //       email: Joi
  //         .string()
  //         .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
  //       password: Joi
  //         .string()
  //         .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/),
  //     });

  //   // validate body
  //   const { value, error } = schema.validate(req.body);
    
  //   if (error) {
  //     throw error;
  //   }
  //   } catch (error) {
      
  //     if (error instanceof MongooseError) {
  //       console.log('We have a mongoose problem', error.message);
  //       res.status(500).json({error: error.message});
  //     }
  //     if (error instanceof JsonWebTokenErro) {
  //       console.log('We have a jwt problem', error.message);
  //       res.status(500).json({error: error.message});
  //     }
  //     console.log(error);
  //     res.status(500).json({error: error.message});
  //   }
  // }

  static async fave_recipe(req, res) {
    try {
      if (!req.params.id) {
        return res
          .status(400)
          .json({
            message: 'Invalid Request recipe id is required',
          })
      }

      const rec_pr = Recipe.findById(req.params.id);
      const user_pr = user_repo.findByEmail(req.user.email);

      // faved
      const rec = await rec_pr;
      const user = await user_pr;

      // checks if user has faved the recipe b$
      if(user.faves.includes(rec.id)) {
        return res
          .status(200)
          .json({
            message: `Recipe with ${rec.id} is already a fave for the user`
          });
      }
      rec.fave_count = rec.fave_count + 1;
      rec.save();
      
      user.faves.push(rec);
      user.save();

      return res
        .status(200)
        .json({
          message: `user faved ${rec.name} recipe`,
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

  static async review_recipe(req, res) {
    try {
      const schema = Joi.object({
        id: Joi
          .string()
          .required(),
        comment: Joi
          .string(),
        stars: Joi
          .number()
          .integer()
          .required(),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      // check if recipe exists
      const rec = await Recipe.findById(value.id);
      if(!rec) {
        return res
          .status(201)
          .json({
            message: 'Invalid Request, recipe does not exist',
          });
      }

      const user_pr = user_repo.findByEmail(req.user.email);
      delete value.id;

      // updates review
      value['recipe'] = rec;
      value['user'] = await user_pr;

      const rev = await Review.create(value);
      rev.user = rev.user.id;
      rev.recipe = rev.recipe.id;

      return res
        .status(201)
        .json({
          message: 'Review created successfully',
          review: rev
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

  static async get_recipe_reviews(req, res) {
    try {
      if (!req.params.id) {
        return res
          .status(401)
          .json({
            error: 'Invalid Request, id is required',
          });
      }

      const rec = await Recipe.findById(req.params.id);
      if(!rec) {
        return res
          .status(401)
          .json({
            error: 'Invalid Request, recipe does not exist',
          });
      }

      const revs = await Review
        .find({
          recipe: rec,
        })
        .sort({ stars: 1 })
        .exec();

      return res
        .status(200)
        .json({
          reviews: revs.map((rev) => {
            rev.user = rev.user.id;
            rev.recipe = rev.recipe.id;
            return rev;
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

  static async get_review(req, res) {
    try {
      if (!req.params.id) {
        return res
          .status(401)
          .json({
            error: 'Invalid Request, id is required',
          });
      }
      const rev = await Review
        .findById(req.params.id);
      if(!rev) {
        return res
          .status(401)
          .json({
            error: 'Invalid Request, review does not exist',
          });
      }

      rev.user = rev.user.id;
      rev.recipe = rev.recipe.id;
      return res
        .status(200)
        .json({
          review: await rev,
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
