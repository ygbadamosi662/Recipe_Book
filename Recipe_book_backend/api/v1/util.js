const bcrypt = require('bcrypt');
const { db_storage } = require('./models/engine/db_storage');

/**
 * Defines Utility class.
 * 
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */

class Utility {
  constructor () {
    this._bcrypt = bcrypt;
  }

  async validate_pwd(entered_pwd, encrypted_pwd) {
    try {
      const result = await bcrypt.compare(entered_pwd, encrypted_pwd);
      return result;
    } catch (error) {
      // Handle error
      throw error;
    }
  }

  async encrypt_pwd(pwd) {
    try {
      const salt = await this._bcrypt.genSalt(10);
      const hashedPassword = await this._bcrypt.hash(pwd, salt);
      return hashedPassword;
    } catch (error) {
      throw error;
    }
  }

  get_what_is_set(obj, except_these) {
    try {
      if (!obj) { return }
      if (!except_these) {
        return Object.entries(obj)
          .filter(([key, value]) => value !== undefined && value !== null)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      }
      return Object.entries(obj)
        .filter(([key, value]) => value !== undefined && value !== null && !except_these.includes(key))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    } catch (error) {
      throw error;
    }
  }
  
}

const util = new Utility();

module.exports = util;
