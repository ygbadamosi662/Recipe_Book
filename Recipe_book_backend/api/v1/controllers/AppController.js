/**
 * Contains the AppController class 
 * which defines route handlers.
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */
const { user_repo } = require('../repos/user_repo');
const { db_storage } = require('../models/engine/db_storage')
const util = require('../util');
const { jwt_service } = require('../services/jwt_service');
const Joi = require('joi');
const { Role } = require('../enum_ish')
const mongoose = require('mongoose');
const MongooseError = mongoose.Error;

class AppController {
  static async home(req, res) {
    res.status(200).json({ message: 'Welcome To Recipe Book Api!' });
  }

  static async register_user(req, response) {
    try {
      const schema = Joi.object({
        fname: Joi
          .string()
          .required(),
        lname: Joi
          .string()
          .required(),
        phone: Joi
          .string()
          .required()
          .pattern(/^[8792][01]\d{8}$/),
        email: Joi
          .string()
          .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
          .required(),
        password: Joi
          .string()
          .required()
          .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/),
      });

    // validate body
    const { value, error } = schema.validate(req.body);
    
    if (error) {
      throw error;
    }

    // check email and phone integrity
    const integrity_task = Promise.all([
      user_repo.existsByEmail(value.email),
      user_repo.existsByPhone(value.phone)
    ]);
    const resolves = await integrity_task;

    // handle integrity
    if (resolves[0] || resolves[1]) {
      if (resolves[0]) { response.status(400).json({ Error: 'Email exists'}); }
      if (resolves[1]) { response.status(400).json({ Error: 'Phone exists'}); }
    }
    
   
    // persist user to the db
    const user = {
      name: {
        fname: value.fname,
        lname: value.lname
      },
      email: value.email,
      phone: value.phone,
      role: Role.user,
    };

    // encrypt pwd
    user.password = await util.encrypt_pwd(value.password);

    const resoled_u = await user_repo.create_user(user);
    return response
      .status(201)
      .json({user: resoled_u});
    } catch (error) {

      if (error instanceof MongooseError) {
        console.log('We have a mongoose problem', error.message);
        return response.status(500).json({error: error.message});
      }
      if (error instanceof Joi.ValidationError) {
        return response.status(400).json({
          error: 'Invalid request body',
          errors: error.details,
        });
      }
      console.log(error);
      return res.status(500).json({error: error.message});
    }
  }

  static async login(req, response) {
    try {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      });
    
      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      const user = await user_repo.findByEmail(value.email, ['name', 'password']);

      const is_pwd = await util.validate_pwd(value.password, user.password);

      // validate user
      if (!user || ( is_pwd === false)) {
        return response.status(400).json({
          error: 'email or password incorrect',
        });
      }

      const token = await jwt_service.generate_token({email: value.email, role: user.role});

      return response
        .status(200)
        .json({
          message: 'Login succesful',
          user: user.id,
          token: token,
        });
      
    } catch (error) {
      if (error instanceof MongooseError) {
        console.log('We have a mongoose problem', error.message);
        return res.status(500).json({error: error.message});
      }
      if (error instanceof Joi.ValidationError) {
        return res
          .status(400)
          .json({
            error: 'Invalid request body',
            errors: error.details,
          });
      }
      console.log(error);
      return res.status(500).json({error: error.message});
    }
  }

  static async logout(req, response) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1]; // Extract the token part
      const user_promise = user_repo.findByEmail(req.user.email, ['id']);
      const timestamp = new Date().toISOString();
      const user = await user_promise;
      const jwt = {
        token: token,
        user: user.id,
        created_on: timestamp,
      }

      await db_storage.blacklist_jwt(jwt);
    
      return response
        .status(200)
        .json({
          message: 'Logged out succesfully',
          token: token,
        });
      
    } catch (error) {
      if (error instanceof MongooseError) {
        console.log('We have a mongoose problem', error.message);
        return res.status(500).json({error: error.message});
      }
      console.log(error);
      return response.status(500).json({error: error.message});
    }
  }
}

module.exports = AppController;
