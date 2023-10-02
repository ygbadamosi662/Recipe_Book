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
    } catch (error) {
      throw error;
    }
     
  }

  get repo() {
    return this._repo;
  }

}

const recipe_repo = new RecipeRepo();

module.exports = { Recipe: recipe_repo.repo, recipe_repo };
