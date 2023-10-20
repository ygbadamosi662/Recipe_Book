const mongoose = require("mongoose");
const userSchema = require('../mongo_schemas/user');
const recipeSchema = require('../mongo_schemas/recipe');
const notificationSchema = require('../mongo_schemas/notification');
const reviewSchema = require('../mongo_schemas/review');
const { Recipe_str, User_str, Review_str, Notification_str } = require('../../global_constants');
const fs = require('fs').promises;
const path = require('path');
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
      this._json_file = path.join(__dirname, 'blacklist.json');
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

  get conn() {
    return this._conn;
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
      const Review = this._conn.model(Review_str, reviewSchema);
      const Notification = this._conn.model(Notification_str, notificationSchema);

      // collect repos
      this.mongo_repos.User = User;
      this.mongo_repos.Recipe = Recipe;
      this.mongo_repos.Review = Review;
      this.mongo_repos.Notification = Notification;

    } catch (error) {
      throw error;
    }
  }

  async blacklist_jwt(jwtObj) {
    try {
      // Read data from blacklist.json
      const data = await fs.readFile(this._json_file, 'utf8');
      let jsonData;
      if (!data) {
        jsonData = {
          jwts: [],
        };
      } else {
        jsonData = JSON.parse(data);
      }
  
      jsonData.jwts.push(jwtObj);
  
      const updatedData = JSON.stringify(jsonData, null, 2);
  
      await fs.writeFile(this._json_file, updatedData, 'utf8');
  
      console.log('jwt blacklisted');
      
    } catch (error) {
      throw error;
    }
  }

  async get_jwt(token) {
    try {
      const jsonData = await fs.readFile(this._json_file, 'utf8');
      if (!jsonData) {
        return null;
      }
      const jwt = JSON.parse(jsonData).jwts.find((j) => j.token === token);
      return jwt;
    } catch (error) {
      throw error;
    }
  }

  async blacklist_reset_token(tokenObj) {
    try {
      // Read data from blacklist.json
      const data = await fs.readFile(this._json_file, 'utf8');
      let jsonData;
      if (!data) {
        jsonData = {
          reset_tokens: [],
        };
      } else {
        jsonData = JSON.parse(data);
      }
  
      jsonData.jwts.push(tokenObj);
  
      const updatedData = JSON.stringify(jsonData, null, 2);
  
      await fs.writeFile(this._json_file, updatedData, 'utf8');
  
      console.log('token blacklisted');
      
    } catch (error) {
      throw error;
    }
  }

  async get_reset_token(token) {
    try {
      const jsonData = await fs.readFile(this._json_file, 'utf8');
      if (!jsonData) {
        return null;
      }
      const blacklisted_token = JSON.parse(jsonData).reset_tokens.find((black) => black.token === token);
      return blacklisted_token;
    } catch (error) {
      throw error;
    }
  }

}

const db_storage = new DbStorage();
db_storage.reload();

module.exports = { db_storage, Connection: db_storage.conn };
