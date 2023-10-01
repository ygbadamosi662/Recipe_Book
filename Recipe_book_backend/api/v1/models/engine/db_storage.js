const mongoose = require("mongoose");
const userSchema = require('../mongo_schemas/user');
const recipeSchema = require('../mongo_schemas/recipe');
const jwt_BlacklistSchema = require('../mongo_schemas/jwt_blacklist');
const { Recipe_str, User_str, JWT_BLACKLIST_str } = require('../../global_constants');
require('dotenv').config();

const db_name = process.env.DB;
const db_user = process.env.DB_USER;
const db_pwd = process.env.DB_PWD;
const db_host = process.env.DB_HOST;
const db_port = process.env.DB_PORT;

class DbStorage {
  constructor() {
    try {
      // initializes a new DbStorage instance
      this._conn = mongoose
        .createConnection(`mongodb://${db_user}:${db_pwd}@${db_host}:${db_port}/${db_name}`, {minPoolSize: 2});
      this._conn.once('open', () => {
        console.log('Database connection successfull');
      });

      this._mongo_db = mongoose;
      this.mongo_repos = {};
    } catch (error) {
      console.log('Database connection failed');
      throw error;
    }

  }

  get mongo_db() {
    return this._mongo_db;
  }

  set mongo_db(value) {
    this._mongo_db = value;
  }

  get_a_repo (key) {
    if (key in this.mongo_repos) {
      return this.mongo_repos[key]; 
    }
    else {
      throw mongoose.Error(`${key} collection not in db`);
    }
  }

  async close_connection () {
    try {
      await this._conn.close()
      console.log('Database connection closed', new Date().getTime());
    } catch (error) {
      console.log('Na me throw error, form close_connection');
      throw error;
    }
  }

  reload() {
    try {
      // set models
      const User = this._conn.model(User_str, userSchema);
      const Recipe = this._conn.model(Recipe_str, recipeSchema);
      const JwtBlacklist = this._conn.model(JWT_BLACKLIST_str, jwt_BlacklistSchema);

      // collect repos
      this.mongo_repos.User = User;
      this.mongo_repos.Recipe = Recipe;
      this.mongo_repos.JwtBlacklist = JwtBlacklist;

    } catch (error) {
      throw error;
    }
  }

}

const db_storage = new DbStorage();
db_storage.reload();

module.exports = { db_storage };
