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
      this._conn = db_storage.conn;
      this._page_size = 20;
    } catch (error) {
      throw error;
    }
     
  }

  get repo() {
    return this._repo;
  }

  get conn() {
    return this._conn;
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

  async findByPhone(phone, select=[]) {
    if (!phone) { return };
    try {
      let query = this._repo.findOne({ phone: phone});
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
      return await this._repo.exists({ phone: phone});
    } catch (error) {
      throw error;
    }
  }

  async existsByEmail(email) {
    if (!email) { return };
    try {
      return await this._repo.exists({ email: email});
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

  async has_next_page(filter, page, page_size) {
    try {
      const totalCount = await this._repo
        .countDocuments(filter)
        .exec();

      let totalPages = Math.floor(totalCount / page_size);
      if((totalCount % page_size) > 0) {
        totalPages = totalPages + 1;
      }
      const hasNextPage = page < totalPages;

      return hasNextPage;
    } catch (error) {
      throw error;
    }
  }

  async total_pages(filter, page_size=this._page_size) {
    try {
      const totalCount = await this._repo
        .countDocuments(filter)
        .exec();

      let totalPages = Math.floor(totalCount / page_size);
      
      if((totalCount % page_size) > 0) {
        totalPages = totalPages + 1;
      }

      return totalPages;
    } catch (error) {
      throw error;
    }
  }
}

const user_repo = new UserRepo();

module.exports = {User: user_repo.repo, user_repo};
