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
          .json({ error: 'Bad request, id is required'});
      }

      const query = User.findById(req.params.id);

      // if not user or admin
      if((req.user.id !== req.params.id) || (![Role.admin, Role.super_admin].includes(req.user.role))) {
        query.select(
          [
            'name',
            'id',
            'followers',
            'following',
            'recipes',
            'faves'
          ].join(' ')
          );
      }
      const user = await query.exec();
      if(!user) {
        return res
          .status(400)
          .json({ message: 'User does not exist'})
      }

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
            message: `Invalid request, you already created a ${value.name} Recipe, update it if you want`,
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
        .status(200)
        .json({
          message: `Recipe ${recipe.name} successfully created`,
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
          .json({ message: 'No data provided for update'});
      }

      const rec = await Recipe.findById(value.id);
      // validate recipe
      if (!rec) {
        return res
          .status(400)
          .json({
            message: `Invalid request, There is no recipe with id: ${value.id}`,
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
        .status(200)
        .json({
          message: `Recipe ${rec.id} successfully updated`,
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
          .integer(),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      if (error) {
        throw error;
      }

      if (!value) {
        return res
          .status(400)
          .json({ message: 'Bad request, no data provided'});
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
      if(value.name) { filter.name = new RegExp(`${value['name']}`); }
      if(value.ingredients) { 
        filter.ingredients = { $in: value['ingredients']};
      }
      if(value.type) { filter.type = value.type; }
      if(value.guide) {
        filter.guide = { $in: value.guide};
      }

      const gather_data_task = Promise.all([
        recipe_repo.get_recs(value), //get recipes
        recipe_repo.has_next_page(filter, value.page, value.size), //if there is a next page
        recipe_repo.total_pages(filter, value.size), //get total pages
      ]);

      // const recs = await recipe_repo.get_recs(value);
      const user = await user_promise;
      const done = await gather_data_task;
      return res
        .status(200)
        .json({
          recipes: done[0]
            .filter( async (recipe) => {
              // user not a follower
              if ((recipe.permit === Permit.private)) {
                const recipe_owner = await User.findById(recipe.user);
                if(recipe_owner.followers.includes(user.id)) {
                  return true
                }
                // filters out pivate recipes if user !== recipe.user 
                return user === recipe.user;
              }
              return true;
            }),
          have_next_page: done[1],
          total_pages: done[2]
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

  static async get_my_recipes(req, res) {
    try {
      const schema = Joi.object({
        count: Joi
          .boolean()
          .required(),
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

      // checks if any other field aside 
      if (!just_checking()) {
        return res
          .status(400)
          .json({ message: 'No data provided'});
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

        if (filters.name) {
          filters.name = new RegExp(filters.name);
        }
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
      if(value.name) { filter.name = new RegExp(`${value['name']}`); }
      if(value.ingredients) { 
        filter.ingredients = { $in: value['ingredients']};
      }
      if(value.type) { filter.type = value.type; }
      if(value.guide) {
        filter.guide = { $in: value.guide};
      }
      
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

      return res
        .status(200)
        .json({ 
          Message: 'User succesfully updated',
          user: user.id,
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
        .status(200)
        .json({
          message: `user faved ${rec.name} recipe`,
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

      rev.user = value['user'].id;
      rev.recipe = value['recipe'].id;

      return res
        .status(201)
        .json({
          message: 'Review created successfully',
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
        recipe_id: Joi
          .string()
          .required(),
        count: Joi
          .boolean()
          .required(),
        stars: Joi
          .array()
          .items(Joi.string()),
        comment: Joi
          .string(),
        page: Joi
          .number()
          .integer(),
        size: Joi
          .number()
          .integer(),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      if (error) {
        throw error;
      }

      const fields = [
        'stars',
        'comment',
        'page',
        'size',
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

      // checks if any other field aside 
      if (!just_checking()) {
        return res
          .status(400)
          .json({ message: 'No data provided'});
      }

      // validates recipe
      const rec = await Recipe.findById(value.recipe_id);
      if(!rec) {
        return res
          .status(401)
          .json({
            error: 'Invalid Request, recipe does not exist',
          });
      }

      // if count is true, consumer just wants a count of the filtered documents
      if (value.count) {
        let filters = value;
        delete filters.page;
        delete filters.size;
        if (filters.comment) {
          filters.comment = new RegExp(`${filters['comment']}`);
        }
        filters.recipe = rec;
        const count = await Review.countDocuments(filters);

        return res
            .status(200)
            .json({
              count: count,
            });
      }

      let filters_and_pageStuff = value;
      delete filters_and_pageStuff.recipe_id;
      filters_and_pageStuff.recipe = rec;
      
      if (filters_and_pageStuff['comment']) {
        filters_and_pageStuff.comment = new RegExp(`${filters_and_pageStuff['comment']}`);
      }

      let filter = {};
      // fill up filter
      if(value.comment) { filter.comment = filters_and_pageStuff.comment; }
      if(value.stars) { filter.starts = value.stars; }
      filter.recipe = rec

      const gather_data_task = Promise.all([
        review_repo.get_recs(filters_and_pageStuff), //get reviewa
        review_repo.has_next_page(filter, value.page, value.size), //if there is a next page
        review_repo.total_pages(filter, value.size), //get total pages
      ]);

      const done = await gather_data_task;

      return res
        .status(200)
        .json({
          reviews: done[0].map((rev) => {
            rev.user = rev.user.id;
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
        comment: Joi
          .string(),
        status: Joi
          .string()
          .valid(...Object.values(Status))
          .default(Status.sent),
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

      const fields = [
        'comment',
        'status',
        'page',
        'size',
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

      // checks if any other field aside 
      if (!just_checking()) {
        return res
          .status(400)
          .json({ message: 'No data provided'});
      }

      const user_pr = user_repo.findByEmail(req.user.email, ['id']);

      // if count is true, consumer just wants a count of the filtered documents
      if (value.count) {
        const count = await Notification
          .countDocuments({ 
            status: value.status,
            to: await user_pr,
          });

        return res
            .status(200)
            .json({
              status: value.status,
              count: count,
            });
      }

      // get notifications
      // const notes = 

      // fill up filter
      let filter = {};
      if(value.comment) { filter.comment = new RegExp(`${value['comment']}`); }
      if(value.status) { filter.status = value.status; }
      const user = await user_pr;
      filter.user = user;

      const gather_data_task = Promise.all([
        await Notification
        .find(filter)
        .skip((value.page - 1) * value.size)
        .limit(value.size)
        .sort({ createdAt: -1 })
        .exec(), //get notifications
        notification_repo.has_next_page(filter, value.page, value.size), //if there is a next page
        notification_repo.total_pages(filter, value.size), //get total pages
      ]);

      const done = await gather_data_task;

      if (done[0]) {
        // update notification status
        await Connection
          .transaction(async () => {
            done[0].map((note) => {
              note.status = Status.received;
              note.save();
            });
          });
      }


      return res
        .status(200)
        .json({
          notes: done[0] ? done[0].map((note) => {
            return {
              id: note.id,
              comment: note.comment,
            };
          }) : [],
          have_next_page: done[1],
          total_pages: done[2]
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

      const following = await User
        .findById(value.id);

      if (!following) {
        return res
          .status(400)
          .json({ error: 'Invalid request, user does not exist'});
      }

      const follower = await user_repo.findByEmail(req.user.email);

      // if user wants to follow
      if(value.follow) {
        // this checks if user is following already
        if(following.followers.includes(follower.id)) {
          return res
            .status(200)
            .json({ message: `You are already following ${following.name.fname + ' ' + following.name.lname}` })
        }

        following.followers.push(follower);
        follower.following.push(following);
        await Connection
          .transaction(async () => {
              const result = await Promise.all([following.save(), follower.save()]);
              // notifies 
              await notification_service.notify({
                to: following,
                comment: `${result[0].name.fname + ' ' + result[1].name.lname} now follows you`,
                subject: result[1],
              });
          });

        return res
          .status(200)
          .json({ 
            message: `You are now following ${result[0].name.fname + ' ' + result[0].name.lname}`
          });
      }

      return res
        .status(200)
        .json({ 
          message: `You unfollwed ${following.name.fname + ' ' + following.name.lname}`
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
          .required(),
        which: Joi
          .string()
          .valid(...Object.values(Which))
          .required(),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      const user_pr = user_repo.findByEmail(req.user.email);

       // if count is true, consumer just wants a count of the filtered document
      if (value.count) {
        const user = await user_pr;
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
      const user = await user_pr;
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
