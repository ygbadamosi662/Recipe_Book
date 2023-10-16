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
    return revs;
  }

  async has_next_page(filter, page=1, page_size=this._page_size) {
    try {
      const totalCount = await this._repo
        .countDocuments(filter)
        .exec();

      const totalPages = Math.floor(totalCount / page_size);
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

      return Math.floor(totalCount / page_size);;
    } catch (error) {
      throw error;
    }
  }
}

const review_repo = new ReviewRepo();

module.exports = { Review: review_repo.repo, review_repo };
