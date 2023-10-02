const { db_storage } = require('../models/engine/db_storage');
const { User_str } = require('../global_constants');
/**
 * defines the UserRepo class
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */

class UserRepo {
  constructor () {
    try {
      this._repo = db_storage.get_a_repo(User_str);
    } catch (error) {
      throw error;
    }
     
  }

  get repo() {
    return this._repo;
  }

  async findByEmail(email, select=[]) {
    if (!email) { return };
    try {
      let query = this._repo.findOne({ email: email});
      if (select) {
        query.select(select.join(' '));
      }
      const user = await query.exec();
      return user;
    } catch (error) {
      throw error;
    }
  }

  async existsByPhone(phone) {
    if (!phone) { return };
    try {
      let query = this._repo.exists({ phone: phone});
      return await query.exec();
    } catch (error) {
      throw error;
    }
  }

  async existsByEmail(email) {
    if (!email) { return };
    try {
      let query = this._repo.exists({ email: email});
      return await query.exec();
    } catch (error) {
      throw error;
    }
  }

  async create_user(user) {
    if (!user) { return };
    try {
      const User = this._repo
      return await User.create(user);
    } catch (error) {
      throw error;
    }
  }

  // async create_user_too(user) {
  //   if (!user) { return };
  //   try {
      
  //     const User = db_storage.get_a_repo(User_str)
  //     console.log('Here', User, this._repo);
  //     const user_u = await this._repo.create(user);
      
  //     console.log(user_u, 'user')
  //     return user_u;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}

const user_repo = new UserRepo();

module.exports = {User: user_repo.repo, user_repo};
