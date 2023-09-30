/**
 * Contains the UserController class 
 * which defines route handlers.
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */
const util = require('../util');
const user_repo = require('../repos/user_repo');
const MongooseError = require('mongoose').Error;
const JsonWebTokenErro = require('jsonwebtoken').JsonWebTokenError;

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
    }
  }
}
  
module.exports = UserController;
