const { Redis } = require('ioredis');
require('dotenv').config();
const { Collections } = require('./enum_ish');

/**
* sets up redis client
*/
class RedisClient {
  constructor() {
    this._client = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    });

    this._client.on('connect', () => {
      console.log('Redis server successfully connected');
    });

    this._client.on('error', (err) => {
      console.log('Redis server connection error: ', err);
    });
  }

  get client() {
    return this._client;
  }

  async isAlive() {
    try {
      const pong = await this._client.ping();
      return pong ? true : false;
    } catch (error) {
      console.log('Failed to PING redis server', error);
    }
  }

  make_key(collection, filter, count=false) {
    if(!collection || !filter) {
      return null;
    }
    return `${count ? collection+'Count' : collection}: ${JSON.stringify(filter)}`;
  }

  /**
   * it sets value to key : <collection>: <stringified filter>
   * @param {String} collection 
   * @param {Object} filter 
   * @param {Object | Array | Number} value 
   * @param {Number} duration
   * @param {Boolean} count
   * @returns {Promise<Boolean|null>}
   */
  async set_cache (collection, filter, value, duration, count=false) {
    try {
      if ((collection && filter && value) && (Object.values(Collections).includes(collection))) {
        const key = this.make_key(collection, filter, count);
        await this._client.set(key, JSON.stringify(value));
        if(duration) { await this._client.expire(key, duration); }
        console.log(`Redis sets ${key} ${duration ? `to expire in ${duration}s` : '' }`);
        // await this._client.quit();
        return true;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 
   * @param {String} collection 
   * @param {Object} filter 
   * @param {Boolean} count
   * @returns {Promise<Object|Array|Number>}
   */
  async get_cache (collection, filter, count=false) {
    try {
      if ((collection && filter) && (Object.values(Collections).includes(collection))) {
        const key = this.make_key(collection, filter, count);
        const data = await this._client.get(key);
        return JSON.parse(data);
      }
    } catch (error) {
      throw error;
    }
  }

}
const redisClient = new RedisClient();

module.exports = { Client: redisClient.client, redisClient };
