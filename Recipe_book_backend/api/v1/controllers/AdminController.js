const util = require('../util');
const { user_repo, User } = require('../repos/user_repo');
const { Recipe, recipe_repo } = require('../repos/recipe_repo');
const { Review, review_repo } = require('../repos/review_repo');
const { notification_service } = require('../services/notification_service');
const { Notification, notification_repo } = require('../repos/notification_repo');
const { Connection } = require('../models/engine/db_storage');
const MongooseError = require('mongoose').Error;
const JsonWebTokenErro = require('jsonwebtoken').JsonWebTokenError;
const Joi = require('joi');
const { Permit, Status, Which, Role, Type } = require('../enum_ish');
/**
 * Contains the UserController class 
 * which defines route handlers.
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */

class AdminController {
  static async role_switcheroo(req, res) {
    // only super-admins have access to this endpoint
    try {
      const schema = Joi.object({
        email: Joi
          .string()
          .required(),
        role: Joi
          .string()
          .valid(...Object.values(Role))
          .required(),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      const user = await user_repo.findByEmail(value.email, ['role', 'id', 'name']);
      if(user.role === value.role) {
        return res
          .status(200)
          .json({
            message: `${value.email} has the Role: ${value.role} already`,
          })
      }

      user.role = value.role;

      // notify owner
      await Connection.transaction(async () => {
        const comment = `${user.name?.aka ? user.name.aka : user.name.fname + ' ' + user.name.lname} you are now a ${value.role} on this platform`;
        await user.save();
        await notification_service
          .notify({
            comment: comment,
            to: user,
            subject: user,
          });
      });
      
      return res
        .status(201)
        .json({
          message: 'Role succesfully updated',
          user: user,
        });
        
    } catch (error) {
      if (error instanceof MongooseError) {
        console.log('We have a mongoose problem', error.message);
        return res.status(500).json({error: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        console.log('We have a jwt problem', error.message);
        return res.status(500).json({error: error.message});
      }
      console.log(error);
      return res.status(500).json({error: error.message});
    }
  }

  static async get_users(req, res) {
    try {
      const schema = Joi.object({
        count: Joi
          .boolean()
          .required(),
        filter: Joi
          .object({
            name: Joi
              .object({
                fname: Joi
                  .string(),
                lname: Joi
                  .string(),
                aka: Joi
                  .string(),
              }), 
            dob: Joi
              .date(),
            role: Joi
              .string()
              .valid(...Object.values(Role)),
          }),
        page: Joi
          .number()
          .integer()
          .default(1),
        size: Joi
          .number()
          .integer()
          .default(20),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      // building filter
      let { filter } = value;
      const { name } = filter;
      if(name.fname) { filter['name.fname'] = name.fname }
      if(name.lname) { filter['name.lname'] = name.lname }
      if(name.aka) { filter['name.aka'] = name.aka }
      delete filter.name;

      // if count is true, consumer just wants a count of the filtered documents
      if (value.count) {
        
        const count = await User
          .countDocuments(value.filter);

        return res
          .status(200)
          .json({
            status: value.status,
            count: count,
          });
      }
      
      const gather_data_task = Promise.all([
        User
        .find(value.filter)
        .skip((value.page - 1) * value.size)
        .limit(value.size)
        .sort({ createdAt: -1 })
        .exec(), //get users
        user_repo.has_next_page(value.filter, value.page, value.size), //if there is a next page
        user_repo.total_pages(value.filter, value.size), //get total pages
      ]);

      const done = await gather_data_task;
      return res
        .status(200)
        .json({
          users: done[0],
          have_next_page: done[1],
          total_pages: done[2],
        });
        
    } catch (error) {
      if (error instanceof MongooseError) {
        console.log('We have a mongoose problem', error.message);
        return res.status(500).json({error: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        console.log('We have a jwt problem', error.message);
        return res.status(500).json({error: error.message});
      }
      console.log(error);
      return res.status(500).json({error: error.message});
    }
  }

  static async find_user(req, res) {
    try {
      const schema = Joi.object({
        phone: Joi
          .string()
          .pattern(/^[8792][01]\d{8}$/),
        email: Joi
          .string()
          .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      if(!value) {
        return res
          .status(400)
          .json({
            message: 'Invalid request, email or phone required'
          })
      }

      let user = {};

      if(value.email) {
        user = await user_repo.findByEmail(value.email);
      }

      if((!user) && (value.phone)) {
        user = await user_repo.existsByPhone(value.phone);
      }

      if(!user) {
        return res
          .status(400)
          .json({
            message: `User ${value.email ? value.email : value.phone} does not exist`
          });
      }

      return res
        .status(200)
        .json({
          user,
        });
    } catch (error) {
      if (error instanceof MongooseError) {
        console.log('We have a mongoose problem', error.message);
        return res.status(500).json({error: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        console.log('We have a jwt problem', error.message);
        return res.status(500).json({error: error.message});
      }
      console.log(error);
      return res.status(500).json({error: error.message});
    }
  }

  static async get_recipes(req, res) {
    try {
      const schema = Joi.object({
        count: Joi
          .boolean()
          .required(),
        filter: Joi
          .object({
            name: Joi
              .string(), 
            fave_count: Joi // an array for range like [from, to], [fave_count] will mean >= fave_count
            //[0, fave_count] will mean <= fave_count and [fave_count, fave_count] will mean == fave_count
              .array()
              .items(Joi.number().integer()),
            ingredients: Joi
              .array()
              .items(Joi.string()),
            type: Joi
              .string(),
            permit: Joi
              .string()
              .valid(...Object.values(Permit)),
            user: Joi
              .string(),
            createdAt: Joi
              .number()
              .precision(1)
          }),
        page: Joi
          .number()
          .integer()
          .default(1),
        size: Joi
          .number()
          .integer()
          .default(20),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      let filter = {};
      // if filter is set
      if(value.filter) {
        // building filter
        filter = value.filter;
        // if user is set, get user
        if(value.filter.user) {
          const user = await User.findById(value.filter.user);
          if(!user) {
            return res
              .status(400)
              .json({
                message: 'Bad Request, user does not exist',
              });
          }
          filter.user = user;
        }
        const { ingredients, name, fave_count, type, createdAt } = filter;
        if(ingredients) {
          filter.ingredients = { $in: ingredients};
        }

        if(createdAt) {
          const now = new Date();
          const x_ago = new Date(now.getTime() - (createdAt * 60 * 60 * 1000));
          filter.createdAt = { $gte: x_ago};
        }

        if(name) {
          filter.name = new RegExp(name);
        }

        if(fave_count) {
          if(fave_count[0] === fave_count[1]) {
            filter.fave_count = fave_count[0];
          }
          if(fave_count.length === 1) {
            filter.fave_count = { $gte: fave_count[0] };
          }
          if(fave_count[0] === 0) {
            filter.fave_count = { $lte: fave_count[1] };
          }
          if((fave_count.length === 2) && (fave_count[0] !== 0)) {
            filter.fave_count = { $gte: fave_count[0], $lte: fave_count[1] };
          }
        }

        if(type) {
          filter.name = new RegExp(type);
        }
      }

      // if count is true, consumer just wants a count of the filtered documents
      if (value.count) {
        const count = await Recipe
          .countDocuments(filter);

        return res
          .status(200)
          .json({
            count: count,
          });
      }
      
      const gather_data_task = Promise.all([
        Recipe
        .find(filter)
        .skip((value.page - 1) * value.size)
        .limit(value.size)
        .sort({ createdAt: -1 })
        .exec(), //get recipes
        recipe_repo.has_next_page(filter, value.page, value.size), //if there is a next page
        recipe_repo.total_pages(filter, value.size), //get total pages
      ]);

      const done = await gather_data_task;
      return res
        .status(200)
        .json({
          recipes: done[0],
          have_next_page: done[1],
          total_pages: done[2],
        });
        
    } catch (error) {
      if (error instanceof MongooseError) {
        console.log('We have a mongoose problem', error.message);
        return res.status(500).json({error: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        console.log('We have a jwt problem', error.message);
        return res.status(500).json({error: error.message});
      }
      console.log(error);
      return res.status(500).json({error: error.message});
    }
  }

  static async get_reviews(req, res) {
    try {
      const schema = Joi.object({
        count: Joi
          .boolean()
          .required(),
        filter: Joi
          .object({
            comment: Joi
              .string(), 
            stars: Joi // an array for range like [from, to], [stars] will mean >= stars
            //[0, stars] will mean <= stars and [stars, stars] will mean == stars
              .array()
              .items(Joi.number().integer()),
            createdAt: Joi // in hours
              .number()
              .precision(1),
            recipe: Joi
              .string(),
            user: Joi
              .string()
          }),
        page: Joi
          .number()
          .integer()
          .default(1),
        size: Joi
          .number()
          .integer()
          .default(20),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      let filter = {};
      // if value.filter is set
      if(value.filter) {
        // building filter
        filter = value.filter;
        // if user or recipe is set
        if(value.filter.user || value.filter.recipe) {
          // if both value.filter.user and value.filter.recipe is set
          if (value.filter.user && value.filter.recipe) {
            let donezo = [];
            await Connection.transaction(async () => {
              let gather_task = [
                User.findById(value.filter.user),
                Recipe.findById(value.filter.recipe)
              ];
              donezo = await Promise.all(gather_task);
            });

            // recipe or user does not exist
            if(!donezo[0] || !donezo[1]) {
              let who = [];
              if(!donezo[0]) {
                who.push('User');
              }
              if(!donezo[1]) {
                who.push('Recipe');
              }

              return res
                .status(400)
                .json({
                  message: `Bad Request, ${who.length == 2 ? who.join(',') : who[0]} does not exist`,
                });
            }

            filter.user = donezo[0];
            filter.recipe = donezo[1];
          }

          if(value.filter.user) {
            const user = await User.findById(value.filter.user);
            if(!user) {
              return res
                .status(400)
                .json({
                  message: 'Bad request, User does not exist',
                });
            }
            filter.user = user;
          }

          if(value.filter.recipe) {
            const rec = await Recipe.findById(value.filter.recipe);
            if(!rec) {
              return res
                .status(400)
                .json({
                  message: 'Bad request, Recipe does not exist',
                });
            }
            filter.recipe = rec;
          }
        }

        const { comment, stars, createdAt } = filter;
        if(createdAt) {
          const now = new Date();
          const x_ago = new Date(now.getTime() - (createdAt * 60 * 60 * 1000));
          filter.createdAt = { $gte: x_ago};
        }

        if(comment) {
          filter.comment = new RegExp(comment);
        }

        if(stars) {
          if(stars[0] === stars[1]) {
            filter.stars = stars[0];
          }
          if(stars.length === 1) {
            filter.stars = { $gte: stars[0] };
          }
          if(stars[0] === 0) {
            filter.stars = { $lte: stars[1] };
          }
          if((stars.length === 2) && (stars[0] !== 0)) {
            filter.stars = { $gte: stars[0], $lte: stars[1] };
          }
        }
      }

      // if count is true, consumer just wants a count of the filtered documents
      if (value.count) {
        const count = await Review
          .countDocuments(filter);

        return res
          .status(200)
          .json({
            count: count,
          });
      }
      
      const gather_data_task = Promise.all([
        Review
          .find(filter)
          .skip((value.page - 1) * value.size)
          .limit(value.size)
          .sort({ createdAt: -1 })
          .exec(), //get recipes
        review_repo.has_next_page(filter, value.page, value.size), //if there is a next page
        review_repo.total_pages(filter, value.size), //get total pages
      ]);

      const done = await gather_data_task;
      return res
        .status(200)
        .json({
          reviews: done[0],
          have_next_page: done[1],
          total_pages: done[2],
        });
        
    } catch (error) {
      if (error instanceof MongooseError) {
        console.log('We have a mongoose problem', error.message);
        return res.status(500).json({error: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        console.log('We have a jwt problem', error.message);
        return res.status(500).json({error: error.message});
      }
      console.log(error);
      return res.status(500).json({error: error.message});
    }
  }

  static async get_notifications(req, res) {
    try {
      const schema = Joi.object({
        count: Joi
          .boolean()
          .required(),
        filter: Joi
          .object({
            comment: Joi
              .string(),
            createdAt: Joi // in hours
              .number()
              .precision(1),
            to: Joi
              .string(),
            status: Joi
              .string()
              .valid(...Object.values(Status))
          }),
        page: Joi
          .number()
          .integer()
          .default(1),
        size: Joi
          .number()
          .integer()
          .default(20),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      let filter = {};
      // if value.filter is set
      if(value.filter) {
        // building filter
        filter = value.filter;
        // if user or recipe is set
        if(value.filter.to) {
          const user = await User.findById(value.filter.to);
          if(!user) {
            return res
              .status(400)
              .json({
                message: 'Bad request, User does not exist',
              });
          }
          filter.to = user;
        }

        const { createdAt } = filter;
        if(createdAt) {
          const now = new Date();
          const x_ago = new Date(now.getTime() - (createdAt * 60 * 60 * 1000));
          filter.createdAt = { $gte: x_ago};
        }
      }

      // if count is true, consumer just wants a count of the filtered documents
      if (value.count) {
        const count = await Notification
          .countDocuments(filter);

        return res
          .status(200)
          .json({
            count: count,
          });
      }
      
      const gather_data_task = Promise.all([
        Notification
          .find(filter)
          .skip((value.page - 1) * value.size)
          .limit(value.size)
          .sort({ createdAt: -1 })
          .exec(), //get recipes
        notification_repo.has_next_page(filter, value.page, value.size), //if there is a next page
        notification_repo.total_pages(filter, value.size), //get total pages
      ]);

      const done = await gather_data_task;
      return res
        .status(200)
        .json({
          notifications: done[0],
          have_next_page: done[1],
          total_pages: done[2],
        });
        
    } catch (error) {
      if (error instanceof MongooseError) {
        console.log('We have a mongoose problem', error.message);
        return res.status(500).json({error: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        console.log('We have a jwt problem', error.message);
        return res.status(500).json({error: error.message});
      }
      console.log(error);
      return res.status(500).json({error: error.message});
    }
  }

  static async get_recipe(req, res) {
    try {
      if (!req.params.id) { 
        return res
        .status(400)
        .json({ msg: 'Invalid request, id is required'}); 
      }
      const recipe = await Recipe.findById(req.params.id);

      if (!recipe) {
        return res
          .status(401)
          .json({
            msg: 'Bad request, recipe does not exist',
          });
      }

      return res
        .status(200)
        .json({
          recipe: recipe,
        });
    } catch (error) {
      
      if (error instanceof MongooseError) {
        console.log('We have a mongoose problem', error.message);
        return res.status(500).json({error: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        console.log('We have a jwt problem', error.message);
        return res.status(500).json({error: error.message});
      }
      console.log(error);
      return res.status(500).json({error: error.message});
    }
  }

  static async get_review(req, res) {
    try {
      if (!req.params.id) { 
        return res
        .status(400)
        .json({ msg: 'Invalid request, id is required'}); 
      }
      const rev = await Review.findById(req.params.id);

      if (!rev) {
        return res
          .status(401)
          .json({
            msg: 'Bad request, recipe does not exist',
          });
      }

      return res
        .status(200)
        .json({
          review: rev,
        });
    } catch (error) {
      
      if (error instanceof MongooseError) {
        console.log('We have a mongoose problem', error.message);
        return res.status(500).json({error: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        console.log('We have a jwt problem', error.message);
        return res.status(500).json({error: error.message});
      }
      console.log(error);
      return res.status(500).json({error: error.message});
    }
  }

  static async get_notification(req, res) {
    try {
      if (!req.params.id) { 
        return res
        .status(400)
        .json({ msg: 'Invalid request, id is required'}); 
      }
      const notification = await Notification.findById(req.params.id);

      if (!notification) {
        return res
          .status(401)
          .json({
            msg: 'Bad request, recipe does not exist',
          });
      }

      return res
        .status(200)
        .json({
          notification,
        });
    } catch (error) {
      
      if (error instanceof MongooseError) {
        console.log('We have a mongoose problem', error.message);
        return res.status(500).json({error: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        console.log('We have a jwt problem', error.message);
        return res.status(500).json({error: error.message});
      }
      console.log(error);
      return res.status(500).json({error: error.message});
    }
  }
}


module.exports = AdminController;
