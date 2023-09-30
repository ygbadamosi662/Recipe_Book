const bcrypt = require('bcrypt');

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
  
}

const util = new Utility();

module.exports = util;
