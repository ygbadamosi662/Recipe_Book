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

  async get_recs (obj) {
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

    // if recipe.ingredients is set
    if (obj['ingredients']) {
      obj.ingredients = { $in: obj['ingredients']};
    }
    // if recipe.guide is set
    if (obj['guide']) {
      obj.guide = { $in: obj['guide']};
    }

    const recs =  await this._repo
      .find(obj)
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .exec();
    console.log(recs)
    return recs;
  }

}

const recipe_repo = new RecipeRepo();

module.exports = { Recipe: recipe_repo.repo, recipe_repo };