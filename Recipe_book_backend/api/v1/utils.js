const bcrypt = require('bcrypt');

/**
 * Defines Utility class.
 * 
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */

class Utility {
  constructor () {
    this.bcrypt = bcrypt
  }

  validate_pwd(entered_pwd, encrypted_pwd) {
    this.bcrypt.compare(entered_pwd, encrypted_pwd, (compareErr, isMatch) => {
        if (compareErr) {
          console.error('Password comparison error:', compareErr);
          throw new Error(compareErr.message);
        } else if (isMatch) {
          return true;
        }
        return false;
    });
  }

  async encrypt_pwd(pwd) {
    try {
      const salt = await this.bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(pwd, salt);
      return hashedPassword;
    } catch (error) {
      throw error;
    }
  }
  
}

const util = new Utility();

module.exports = util;
