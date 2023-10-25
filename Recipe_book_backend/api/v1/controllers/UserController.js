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
const { Permit, Status, Which, Role } = require('../enum_ish');
/**
 * Contains the UserController class 
 * which defines route handlers.
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */

class UserController {
  static async get_user(req, res) {
    // serves both user and admin
    try {
      if(!req.params.id) {
        return res
          .status(400)
          .json({ msg: 'Bad request, id is required'});
      }

      const query = User.findById(req.params.id);

      // if not user or admin
      if((req.user.id !== req.params.id) || (![Role.admin, Role.super_admin].includes(req.user.role))) {
        query
          .select(
            [
              'name',
              '_id',
              'followers',
              'following',
              'recipes',
              'faves'
            ].join(' ')
            );
      }
      const user = await query
        .populate(['recipes', 'faves'])
        .exec();
      if(!user) {
        return res
          .status(400)
          .json({ msg: 'User does not exist'})
      }
      user.password = "";
      // filters recipes
      user.recipes?.filter((recipe) => {
        // if not user or admin
       if((req.user.id !== req.params.id) || (![Role.admin, Role.super_admin].includes(req.user.role))) {
          let fills = user.followers?.map((fill) => {
            return fill._id.toString();
          });
          if((recipe.permit === Permit.private) && !fills.includes(req.user.id)) {
            return false;
          }
          return true;
        }
      });

      // filter faves
      user.faves?.filter((recipe) => {
        // if not user or admin
        if((req.user.id !== req.params.id) || (![Role.admin, Role.super_admin].includes(req.user.role))) {
          if((recipe.permit === Permit.private) && (req.user.id !== recipe.user.toString())) {
            return false;
          }
          return true;
        }
      });
      return res
        .status(200)
        .json({ user: user});
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
          .string()
          .required(),
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

      const user = await User
        .findOne({ email: req.user.email })
        .populate('followers')
        .exec();
      const rec_exists = await Recipe.exists({name: value.name, user: user});
      
      // if recipe already created by user
      if (rec_exists) {
        return res
          .status(400)
          .json({
            msg: `Invalid request, you already created a ${value.name} Recipe, update it if you want`,
          })
      }

      value.user = user;
      
      const recipe = await Recipe
        .create(value);
      
      user.recipes.push(recipe);
      
      await Connection.transaction(async () => {
          user.save();
          if (user.followers) {
            // notify followers
            const comment = `${user.name.aka ? user.name.aka : [user.name.fname, user.name.lname].join(' ')} just created a recipe`;
            await notification_service.notify_all(user.followers, comment, recipe);
          }
        });
      recipe.user = recipe.user.id;

      return res
        .status(201)
        .json({
          msg: `Recipe ${recipe.name} successfully created`,
          recipe: recipe,
        });
    } catch (error) {
      
      if (error instanceof MongooseError) {
        console.log('We have a mongoose problem', error.message);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        console.log('We have a jwt problem', error.message);
        return res.status(500).json({msg: error.message});
      }
      console.log(error);
      return res.status(500).json({msg: error.message});
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
          .string(),
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

      const fields = [
        'name',
        'ingredients',
        'guide',
        'inspiration',
        'description',
        'type',
        'permit',
      ];
      
      const just_checking = () => {
        const objectEntries = Object.entries(value);

        for (const [key, value] of objectEntries) {
          if (fields.includes(key)) {
            return true;
          }
        }
        return false;
      }

      // checks if any other field aside id is set
      if (!just_checking()) {
        return res
          .status(400)
          .json({ msg: 'No data provided for update'});
      }

      const rec = await Recipe.findById(value.id);
      // validate recipe
      if (!rec) {
        return res
          .status(400)
          .json({
            msg: `Invalid request, There is no recipe with id: ${value.id}`,
          })
      }

      const user_pr = User.findOne({email: req.user.email})
        .populate('followers')
        .exec();

      // delete id 
      delete value.id;
      
      const user = await user_pr;

      await Connection.transaction(async () => {
          if (user.followers) {
            // notify followers
            const comment = `${user.name.aka ? user.name.aka : [user.name.fname, user.name.lname].join(' ')} just updated a recipe`;
            await Recipe.updateOne({ id: value.id }, value);
            await notification_service.notify_all(user.followers, comment, rec.id);
          }
        })

      return res
        .status(201)
        .json({
          msg: `Recipe successfully updated`,
          recipe: rec
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
      const recipe = await Recipe
      .findById(req.params.id)
      .populate('user')
      .exec();

      if (!recipe) {
        return res
          .status(400)
          .json({
            msg: 'Invalid Request, recipe does not exist',
          });
      }

      if (recipe.permit === Permit.private) {
        const user = await user_repo.findByEmail(req.user.email, ['id']);
        if (user.id !== recipe.user) {
          return res
            .status(400)
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
        name: Joi
          .string(),
        ingredients: Joi
          .array()
          .items(Joi.string()),
        type: Joi
          .string(),
        page: Joi
          .number()
          .integer()
          .default(1),
        size: Joi
          .number()
          .integer()
          .default(5),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      if (error) {
        throw error;
      }

      const user_promise = User
        .findOne({ email: req.user.email})
        .exec();

      if (value['name']) {
        // passing a regex
        value.name = new RegExp(`${value['name']}`);
      }
      let filter = {};
      // fill up filter
      if(value.name) { filter.name = value.name }
      if(value.ingredients) { 
        filter.ingredients = { $in: value['ingredients']};
      }
      if(value.type) { filter.type = value.type; }
      
      
      const gather_data_task = Promise.all([
        recipe_repo.get_recs(filter, value.page, value.size), //get recipes
        recipe_repo.has_next_page(filter, value.page, value.size), //if there is a next page
        recipe_repo.total_pages(filter, value.size), //get total pages
      ]);
      // const recs = await recipe_repo.get_recs(value);
      const user = await user_promise;
      const donezo = await gather_data_task;
    
      return res
        .status(200)
        .json({
          recipes: donezo[0]
            .filter( async (recipe) => {
              // user not a follower
              if ((recipe.permit === Permit.private)) {
                const recipe_owner = await User.findById(recipe.user);
                if(recipe_owner.followers.includes(user._id)) {
                  return true
                }
                // filters out pivate recipes if user !== recipe.user 
                return user === recipe.user;
              }
              return true;
            })
            .map((recipe) => {
              return {
                _id: recipe._id,
                name: recipe.name,
                type: recipe.type,
                permit: recipe.permit,
                fave_count: recipe.fave_count,
              };
            }),
          have_next_page: donezo[1],
          total_pages: donezo[2]
        });
    } catch (error) {
      console.log(error, "err");
      if (error instanceof MongooseError) {
        console.log('We have a mongoose problem', error.message);
        return res.status(500).json({error: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        console.log('We have a jwt problem', error.message);
        console.log(error)
        return res.status(500).json({error: error.message});
      }
      console.log(error);
      return res.status(500).json({error: error.message});
    }
  }

  static async get_my_recipes(req, res) {
    try {
      const schema = Joi.object({
        count: Joi
          .boolean()
          .default(false),
        name: Joi
          .string(),
        ingredients: Joi
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
          .integer()
          .default(1),
        size: Joi
          .number()
          .integer()
          .default(5)
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

      // if count is true, consumer just wants a count of the filtered documents
      if (value.count) {
        let filters = value;
        delete filters.count;
        delete filters.page;
        delete filters.size;

        filters.user = await user_promise;
        const count = await Recipe.countDocuments(filters);

        return res
            .status(200)
            .json({
              count: count,
            });
      }
      

      let filter = {};
      // fill up filter
      if(value.name) { filter.name = filter.name }
      if(value.ingredients) { 
        filter.ingredients = { $in: value['ingredients']};
      }
      if(value.type) { filter.type = value.type; }
      
      const user = await user_promise;
      filter.user = user;
      const gather_data_task = Promise.all([
        recipe_repo.get_recs({ ...filter, page: value.page, size: value.size }), //get recipes
        recipe_repo.has_next_page(filter, value.page, value.size), //if there is a next page
        recipe_repo.total_pages(filter, value.size), //get total pages
      ]);

      const done = await gather_data_task;

      return res
        .status(200)
        .json({
          recipes: done[0]?.map((recipe) => {
            return {
                _id: recipe._id,
                name: recipe.name,
                type: recipe.type,
                permit: recipe.permit,
                fave_count: recipe.fave_count,
                user: {
                  _id: recipe._id
                }
              };
          }),
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

  static async update_user(req, res) {
    try {
      const schema = Joi.object({
        fname: Joi
          .string(),
        lname: Joi
          .string(),
        aka: Joi
          .string(),
        dob: Joi
          .date(),
        phone: Joi.object({
            new_phone: Joi
              .string()
              .pattern(/^[8792][01]\d{8}$/)
              .required(),
            password: Joi
              .string()
              .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/)
              .required(),
          }),
        email: Joi.object({
            new_email: Joi
              .string()
              .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
              .required(),
            password: Joi
              .string()
              .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/)
              .required(),
          }),
        password: Joi.object({
            new_password: Joi
              .string()
              .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/)
              .required(),
            old_password: Joi
              .string()
              .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/)
              .required(),
          }),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      if (error) {
        throw error;
      }

      // if no value is set
      if(!value) {
        return res
          .status(400)
          .json({ message: 'No data provided'});
      }

      const user = await user_repo.findByEmail(req.user.email);

      // validates password for updating sensitive data
      if (value.email || value.phone || value.password) {
        if (value.email) {
          if(await util.validate_pwd(value.email.password, user.password)) {
            user.email = value.email.new_email;
          } else {
            return res
              .status(400)
              .json({ Message: 'Invalid Credentials'})
          }
        }
        if (value.phone) {
          if(await util.validate_pwd(value.phone.password, user.password)) {
            user.phone = value.phone.new_phone;
          } else {
            return res
              .status(400)
              .json({ Message: 'Invalid Credentials'})
          }
        }
        if (value.password) {
          if(await util.validate_pwd(value.password.old_password, user.password)) {
            user.password = await util.encrypt_pwd(value.password.new_password);
          } else {
            return res
              .status(400)
              .json({ Message: 'Invalid Credentials'})
          }
        }
      }

      if(value.fname) { user.name.fname = value.fname; }
      if(value.lname) { user.name.lname = value.lname; }
      if(value.dob) { user.dob = value.dob; }
      if(value.aka) { user.name.aka = value.aka; }

      await user.save();
      user.password = "";
      return res
        .status(201)
        .json({ 
          msg: 'User succesfully updated',
          user: user,
        });

    } catch (error) {
      
      if (error instanceof MongooseError) {
        console.log('We have a mongoose problem', error.message);
        return res.status(500).json({error: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        console.log('We have a jwt problem', error.message);
        res.status(500).json({error: error.message});
      }
      console.log(error);
      return res.status(500).json({error: error.message});
    }
  }

  static async fave_recipe(req, res) {
    try {
      if (!req.params.id) {
        return res
          .status(400)
          .json({
            msg: 'Invalid Request recipe id is required',
          })
      }

      const rec_pr = Recipe.findById(req.params.id);
      const user_pr = user_repo.findByEmail(req.user.email);

      // faved
      const rec = await rec_pr;
      const user = await user_pr;

      // checks if user has faved the recipe b$
      if(user.faves.includes(rec._id)) {
        return res
          .status(200)
          .json({
            msg: `Recipe with ${rec.id} is already liked by the user`
          });
      }
      rec.fave_count = rec.fave_count + 1;
      await rec.save();
      
      user.faves.push(rec);
    
      // notify owner
      const comment = `${user.name.aka ? user.name.aka : user.name.fname + ' ' + user.name.lname} just fave your recipe`;
      await Connection.transaction(async () => {
        await user.save();
        await notification_service
          .notify({
            comment: comment,
            to: user,
            subject: rec,
          });
      });
      return res
        .status(201)
        .json({
          msg: `user liked ${rec.name} recipe`,
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
      const rec = await Recipe
                    .findById(value.id)
                    .populate('user')
                    .exec();
      if(!rec) {
        return res
          .status(400)
          .json({
            msg: 'Invalid Request, recipe does not exist',
          });
      }

      const user_pr = user_repo.findByEmail(req.user.email);
      delete value.id;

      // updates review
      value['recipe'] = rec;
      value['user'] = await user_pr;

      
      
      let rev = {};
      await Connection.transaction(async () => {
          // notify owner
          rev = await Review.create(value);
          const comment = `${value['user'].name.aka ? value['user'].name.aka : value['user'].name.fname + ' ' + value['user'].name.lname} wrote a review for your recipe`;
          await notification_service
            .notify({
              comment: comment,
              to: rec.user,
              subject: rec,
            });
        })

      return res
        .status(201)
        .json({
          msg: 'Review created successfully',
          review: rev
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

  static async get_recipe_reviews(req, res) {
    try {
      const schema = Joi.object({
        count: Joi
          .boolean()
          .default(false),
        filter: Joi.object({
          recipe: Joi
            .string()
            .required(),
          stars: Joi // an array for range like [from, to], [stars] will mean >= stars
            //[0, stars] will mean <= stars and [stars, stars] will mean == stars
            .array()
            .items(Joi.number().integer()),
          comment: Joi
            .string(),
          })
          .required(),
        page: Joi
          .number()
          .integer()
          .default(1),
        size: Joi
          .number()
          .integer()
          .default(5),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      if (error) {
        throw error;
      }

      // validates recipe
      const rec = await Recipe.findById(value.filter.recipe);
      if(!rec) {
        return res
          .status(401)
          .json({
            error: 'Invalid Request, recipe does not exist',
          });
      }

      // build query
      let filter = {};
      filter = value.filter;
      filter.recipe = rec;
      if(filter.comment) {
        filter.comment = new RegExp(filter.comment);
      }

      if(filter.stars) {
        if(filter.stars[0] === filter.stars[1]) {
          filter.stars = filter.stars[0];
        }
        if(filter.stars.length === 1) {
          filter.stars = { $gte: filter.stars[0] };
        }
        if(filter.stars[0] === 0) {
          filter.stars = { $lte: filter.stars[1] };
        }
        if((filter.stars.length === 2) && (filter.stars[0] !== 0)) {
          filter.stars = { $gte: filter.stars[0], $lte: filter.stars[1] };
        }
      }

      // if count is true, consumer just wants a count of the filtered documents
      if (value.count) {
        const count = await Review.countDocuments(filter);

        return res
            .status(200)
            .json({
              count: count,
            });
      }

      const gather_data_task = Promise.all([
        review_repo.get_revs(filter, value.page, value.size), //get reviewa
        review_repo.has_next_page(filter, value.page, value.size), //if there is a next page
        review_repo.total_pages(filter, value.size), //get total pages
      ]);

      const done = await gather_data_task;

      return res
        .status(200)
        .json({
          reviews: done[0].map((rev) => {
            rev.recipe = rev.recipe.id;
            return rev;
          }),
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
        .findById(req.params.id)
        .populate('user');
      if(!rev) {
        return res
          .status(40)
          .json({
            error: 'Invalid Request, review does not exist',
          });
      }

      rev.recipe = rev.recipe.id;
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

  static async get_notifications(req, res) {
    try {
      const schema = Joi.object({
        count: Joi
          .boolean()
          .default(false),
        comment: Joi
          .string(),
        status: Joi
          .string()
          .valid(...Object.values(Status)),
        page: Joi
          .number()
          .integer()
          .default(1),
        size: Joi
          .number()
          .integer()
          .default(5),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }
      
      const user_pr = user_repo.findByEmail(req.user.email, ['id']);

      // fill up filter
      let filter = {};
      if(value.comment) { filter.comment = new RegExp(`${value['comment']}`); }
      if(value.status) { 
        if(value.status === Status.not_read) {
          filter.$or = [{ status: Status.received }, {status: Status.sent }];
        } else {
          filter.status = value.status;
        }
      }
      const user = await user_pr;

      if(!user) {
        return res
          .status(500)
          .json({
            msg: "Cant find jwt user"
          });
      }
      filter.user = user;

      // if count is true, consumer just wants a count of the filtered documents
      if (value.count) {
        const count = await Notification
          .countDocuments(filter);
        return res
          .status(200)
          .json({
            status: value.status,
            count: count,
          });
      }
  
      const gather_data_task = Promise.all([
        Notification
          .find(filter)
          .skip((value.page - 1) * value.size)
          .limit(value.size)
          .sort({ createdAt: -1 })
          .exec(), //get notifications
        notification_repo.has_next_page(filter, value.page, value.size), //if there is a next page
        notification_repo.total_pages(filter, value.size), //get total pages
      ]);
      const donezo = await gather_data_task;

      let result = [];
      if (donezo[0]) {
        // update notification status
        await Connection
          .transaction(async () => {
            let gather_task = [];
            donezo[0]?.map((note) => {
              if(note.status === Status.sent) {
                note.status = Status.received;
                gather_task.push(note.save());
              }
            });
            donezo[0].filter((note) => {
              return note.status === Status.sent
            });

            result = await Promise.all(gather_task);
            if(result) {
              result = [...donezo[0], ...result];
            }
            if(!result) {
              result = donezo[0];
            }
          });
      }
      return res
        .status(200)
        .json({
          notes: result ? result?.map((note) => {
            return {
              id: note.id,
              comment: note.comment,
              status: note.status,
            };
          }) : [],
          have_next_page: donezo[1],
          total_pages: donezo[2]
        });
    } catch (error) {
      
      if (error instanceof MongooseError) {
        console.log('We have a mongoose problem', error.message);
        console.log(error)
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

  static async read_notifications(req, res) {
    try {
      const schema = Joi.object({
        ids: Joi
          .array()
          .items(Joi.string())
          .required()
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      await Connection
        .transaction(async () => {
          let gather_task = [];
          value.ids.map((id) => {
           gather_task.push(Notification.findByIdAndUpdate(id, { status: Status.read }));
          });
          await Promise.all(gather_task);
        });

      return res
        .status(200)
        .json({ msg: "Update successful"});

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
          .json({ error: 'Invalid request, id is required'});
      }

      const note = await Notification
        .findById(req.params.id)
        .populate('to')
        .exec();

      if(!note) {
        return res
          .status(400)
          .json({ error: 'Invalid request, id does not exist'});
      }

      const user = await user_repo.findByEmail(req.user.email, ['id']);

      // validates user 
      if(note.to.id !== user.id) {
        return res
          .status(400)
          .json({ error: 'Invalid Credentials'});
      }

      if (note.status !== Status.read) {
         note.status =  Status.read;
      }
      await note.save();
      return res
        .status(200)
        .json({ note: note});
      
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

  static async follow_unfollow(req, res) {
    try {
      const schema = Joi.object({
        id: Joi
          .string()
          .required(),
        follow: Joi
          .boolean()
          .required(),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      if (error) {
        throw error;
      }

      if(value.id === req.user.id) {
        return res
          .status(400)
          .json({ msg: 'You cannot follow or unfollow yoursef'});
      }

      const following = await User
        .findById(value.id);

      if (!following) {
        return res
          .status(400)
          .json({ msg: 'Invalid request, user does not exist'});
      }

      const follower = await user_repo.findByEmail(req.user.email);
      

      // if user wants to follow
      if(value.follow === true) {
        // this checks if user is following already
        if(following.followers.includes(follower._id)) {
          return res
            .status(200)
            .json({ msg: `You are already following ${following.name.fname + ' ' + following.name.lname}` })
        }

        following.followers.push(follower);
        follower.following.push(following);
        let result = {}
        await Connection
          .transaction(async () => {
              result = await Promise.all([following.save(), follower.save()]);
              // notifies 
              await notification_service.notify({
                to: following,
                comment: `${result[0].name.fname + ' ' + result[1].name.lname} now follows you`,
                subject: result[1],
              });
          });

        return res
          .status(201)
          .json({ 
            msg: `You are now following ${result[0].name.fname + ' ' + result[0].name.lname}`
          });
      }

      // this checks if user is following
      if(!(following.followers.includes(follower._id))) {
        return res
          .status(200)
          .json({ msg: `You are not following ${following.name.fname + ' ' + following.name.lname}` })
      }[].filter

      following.followers = following.followers.filter((fool) => {
        return fool !== follower;
      });
      await following.save();
      return res
        .status(201)
        .json({ 
          msg: `You unfollwed ${following.name.fname + ' ' + following.name.lname}`
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

  static async get_followers_and_following(req, res) {
    try {
      const schema = Joi.object({
        count: Joi
          .boolean()
          .default(false),
        id: Joi
          .string()
          .required(),
        which: Joi
          .string()
          .valid(...Object.values(Which))
          .default(Which.followers),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      const user_pr = User.findById(value.id)
        .select('followers following _id');
      

       // if count is true, consumer just wants a count of the filtered document
      if (value.count) {
        const user = await user_pr.exec();
        const give_count = () => {
          if(value.which === Which.followers) {
            return { count: user.followers ? user.followers.length : 0 }
          }
          if(value.which === Which.following) {
            return { count: user.following ? user.following.length : 0 }
          }
        }
        return res
            .status(200)
            .json(give_count());
      }

      let users = []
      const user = await user_pr
        .populate(['followers', 'following'], 'name _id')
        .exec();
      if (value.which === Which.followers) {
        users = user.followers;
      }
      if (value.which === Which.following) {
        users = user.following;
      }
      
      return res
        .status(200)
        .json({ users: users ? users : [] })
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

  static async delete_recipe(req, res) {
    try {
      if (!req.params.id) { 
        return res
        .status(400)
        .json({ msg: 'Invalid request, id is required'}); 
      }
      const recipe = await Recipe.findById(req.params.id);
      if(![Role.admin, Role.super_admin].includes(req.user.role)) {
        if(req.user.id !== recipe.user.toString()) {
          return res
            .status(400)
            .json({
              message: 'Bad request, Invalid credentials'
            })
        }
      }

      if (!recipe) {
        return res
          .status(401)
          .json({
            msg: 'Bad request, recipe does not exist',
          });
      }

      await Connection
        .transaction(async () => {
          const user = await User.findById(recipe.user.toString());
          // update user.recipes
          user.recipes = user.recipes.filter((rec) => { return rec !== recipe._id});
          user.save();

          await Recipe.deleteOne({ _id: recipe._id});
          let favers = await User.find({
            faves: { $in: [recipe._id] }
          });
          if(favers) {
            let update_favers_tasks = [];
            favers
              .map((fave) => {
                fave.faves = fave.faves.filter((rec) => { return rec !== recipe._id});
                update_favers_tasks.push(fave.save());
                return fave;
            });
            const result = await Promise.all(update_favers_tasks);
            const comment = `Recipe with id: ${req.params.id} have been deleted by the ${req.user.role}`;
            // notify favers
            await notification_service.notify_all(result, comment, recipe);
          }

          if(req.user.role !== Role.user) {
            await notification_service.notify({
              to: user,
              comment: `Your Recipe ${recipe.name} have been deleted by Admin, check you email for further details`,
              subject: recipe,
            });
          }
        });


      return res
        .status(200)
        .json({
          message: `Recipe with id: ${req.params.id} successfully deleted`,
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

  static async delete_review(req, res) {
    try {
      if (!req.params.id) { 
        return res
        .status(400)
        .json({ msg: 'Invalid request, id is required'}); 
      }
      const review = await Review.findById(req.params.id);
      if(![Role.admin, Role.super_admin].includes(req.user.role)) {
        if(req.user.id !== review.user.toString()) {
          return res
            .status(400)
            .json({
              message: 'Bad request, Invalid credentials'
            })
        }
      }

      if (!review) {
        return res
          .status(401)
          .json({
            msg: 'Bad request, review does not exist',
          });
      }

      // if deleted by user
      if(req.user.role === Role.user) {
        await Review.deleteOne({ _id: review._id});
      }

      // if deleted by admin
      if([Role.admin, Role.super_admin].includes(req.user.role)) {
        await Connection
          .transaction(async () => {
            await Review.deleteOne({ _id: review._id});
            // notifies user
            console.log(review.user)
            await notification_service.notify({
              to: review.user,
              comment: `Your Review: ${review.comment} on recipe: ${review.recipe.toString()} have been deleted, check youe email for further details`,
              subject: review,
            });
          });
      }
      

      return res
        .status(200)
        .json({
          message: `Review with id: ${req.params.id} successfully deleted`,
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
  
module.exports = UserController;
