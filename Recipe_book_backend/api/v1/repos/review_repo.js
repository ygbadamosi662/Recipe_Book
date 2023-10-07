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

  async get_revs (obj) {
    if (!obj) { return }
    // defaults
    let PAGE_SIZE = this._page_size;
    let page = 1;

    // if page and size is set
    if ((obj['page'] && obj['page'] !== 1) || obj['size']) {
      if (obj['size']) { PAGE_SIZE = obj['size'] }
      if (obj['page']) { page = obj['page'] }
    }
    // remove the page and size property
    delete obj.page;
    delete obj.size;

    const revs =  await this._repo
      .find(obj)
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .sort({ stars: 1 })
      .exec();
    return recs;
  }
}

const review_repo = new ReviewRepo();

module.exports = { Review: review_repo.repo, review_repo };
