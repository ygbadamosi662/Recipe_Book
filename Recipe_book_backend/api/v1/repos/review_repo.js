const { db_storage } = require('../models/engine/db_storage');
const { Review_str } = require('../global_constants');
/**
 * defines the ReviewRepo class
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */

class ReviewRepo {
  constructor () {
    try {
      this._repo = db_storage.get_a_repo(Review_str);
      this._page_size = 20;
    } catch (error) {
      throw error;
    }
     
  }

  get repo() {
    return this._repo;
  }

  get page_size() {
    return this._page_size;
  }

}

const review_repo = new ReviewRepo();

module.exports = { Review: review_repo.repo, review_repo };
