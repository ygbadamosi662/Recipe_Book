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
        user.save();
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
}


module.exports = AdminController;
