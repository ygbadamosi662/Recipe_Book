const mongoose = require("mongoose");
const userSchema = require('../mongo_schemas/user');
const recipeSchema = require('../mongo_schemas/recipe');
require('dotenv').config();

const db_name = process.env.DB;
const db_user = process.env.DB_USER;
const db_pwd = process.env.DB_PWD;
const db_host = process.env.DB_HOST;
const db_port = process.env.DB_PORT;

class DbStorage {
  constructor() {
    // initializes a new DbStorage instance
    mongoose.connect(`mongodb://${db_user}:${db_pwd}@${db_host}:${db_port}/${db_name}`)
      .then(() => {
        console.log('Database connection successfull');
      })
      .catch((error) => {
        console.log('Database connection failed');
      });

    this._mongo_db = mongoose;
    this.mongo_repos = {};

  }

  get mongo_db() {
    return this._mongo_db;
  }

  // get mongo_repos() {
  //   return this.mongo_repos;
  // }

  set mongo_db(value) {
    this._mongo_db = value;
  }

  async get_a_repo (key) {
    
    await this.reload();
    // console.log(key, this.mongo_repos);
    if (key in this.mongo_repos) {
      console.log("okay", this.mongo_repos[key])
      return this.mongo_repos[key]; 
    }
  }

  async reload() {
    try {
      // set models
      const User = await this._mongo_db.model('User', userSchema);
      const Recipe = await this._mongo_db.model('Recipe', recipeSchema);

      // collect repos
      this.mongo_repos.User = User;
      this.mongo_repos.Recipe = Recipe;
      // console.log(this.mongo_repos)
    } catch (error) {
      throw error;
    }
  }

}

db_storage = new DbStorage();

module.exports = db_storage;
