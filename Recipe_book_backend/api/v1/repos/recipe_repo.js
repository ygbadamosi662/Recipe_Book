const { db_storage } = require('../models/engine/db_storage');
const { Recipe_str } = require('../global_constants');
/**
 * defines the RecipeRepo class
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */

class RecipeRepo {
  constructor () {
    try {
      this._repo = db_storage.get_a_repo(Recipe_str);
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

  async get_recs (filter, page=1, size=5) {
    if (!filter) { return }
    

    const recs =  await this._repo
      .find(filter)
      .skip((page - 1) * size)
      .limit(size)
      .sort({createdAt: -1})
      .exec();
    return recs;
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

const recipe_repo = new RecipeRepo();

module.exports = { Recipe: recipe_repo.repo, recipe_repo };
