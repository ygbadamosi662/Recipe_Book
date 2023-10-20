const { Redis } = require('ioredis');
require('dotenv').config();
const { Collections, Power } = require('./enum_ish');

/**
* sets up redis client
*/
class RedisClient {
  constructor() {
    try {
      this._first_key = [...Object.values(Collections)];
      this._second_key = ['single', 'lists'];
      this._third_key = ['list', 'count'];
      this._cache_structure = {
        User: {
          singles: {
            place_holder: 'user',
          },
          lists: {
            lists: {
              place_holder: 'users',
            },
            count: {
              place_holder: 'users count',
            },
          },
        },
        Recipe: {
          singles: {
            place_holder: 'recipe',
          },
          lists: {
            lists: {
              place_holder: 'recipes',
            },
            count: {
              place_holder: 'recipes count',
            },
          },
        },
        Review: {
          singles: {
            place_holder: 'review',
          },
          lists: {
            lists: {
              place_holder: 'reviews',
            },
            count: {
              place_holder: 'reviews count',
            },
          },
        },
        Notification: {
          singles: {
            place_holder: 'notification',
          },
          lists: {
            lists: {
              place_holder: 'notifications',
            },
            count: {
              place_holder: 'notifications count',
            },
          },
        },
      };
      this._cache_expiry = {};
      this._pwer_error_msg = 'CACHING IS OFF: to use caching set REDIS_POWER=ON in recipe_backend/api/v1/.env';
      this._power_error = new Error(this._pwer_error_msg);
      // redis on
      if(process.env.REDIS_POWER === Power.on) {
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
      // redis off
      if(process.env.REDIS_POWER !== Power.on) {
        console.log(this._pwer_error_msg);
        this._client = null;
      }
    } catch (error) {
      console.log('Redis Error: ', error);
      throw error;
    }
    
  }

  get client() {
    return this._client;
  }

  set_cache_expiry() {
    try {
      const our_time = {
        minute: 60 * 1000,
        hour: 60 * 60 * 1000,
      }
  
      Object.values(Collections)
        .map((key) => {
          this._cache_expiry[key] = {
            single: new Date(Date.now() + (2 * our_time.hour)),
            list: {
              list: new Date(Date.now() + (30 * our_time.minute)),
              count: new Date(Date.now() + (15 * our_time.minute)),
            },
          };
        });
    } catch (error) {
      throw error;
    }
  }

  async checks_expiration(where_to, filter) {
    if(!(where_to instanceof Array) && (!where_to)) { return null }
    try {
      if(!this._cache_expiry) { return null}
      let check_expire = {};
      if(where_to[0]) {
        if(Object.values().includes(where_to[0])) {
          check_expire = this._cache_expiry[where_to[0]];
          for(const level in where_to) {
            if(level !== where_to[0]) {
              check_expire = check_expire[level];
            }
          }
          if(check_expire) {
            if(check_expire > Date.now()) {
              const query_key = [...where_to, JSON.stringify(filter)].join(':');
              if(query_key) {
                await this._client.hdel(process.env.REDIS_KEY, query_key);
                console.log(`Redis deleted ${query_key} in ${process.env.REDIS_KEY}`);
                this._cache_expiry[]
                return true;
              }
            }
          }
        }
        
      }
    } catch (error) {
      throw error;
    }
  }

  async set_up_cache() {
    // await this._client.del(process.env.REDIS_KEY);
    // if cache is off
    if(!this.check_power()) { throw this._power_error;}
    try {
      // if cache is setup already
      if(await this._client.exists(process.env.REDIS_KEY) === 1) {
        return;
      }
      // set up duration
      this.set_cache_expiry();

      // sets cache
      await this._client.hmset(process.env.REDIS_KEY, {
        place_holder: process.env.APP_NAME,
        })
        .then();
      console.log('Cache setup complete', `Expiry plan: ${this._cache_expiry}`);
    } catch (error) {
      throw error;
    }
  }

  async isAlive() {
    try {
      if(this.check_power()) {
        const pong = await this._client.ping();
        return pong ? true : false;
      }
      throw this._power_error;
    } catch (error) {
      console.log('Redis Error: ', error);
    }
  }

  /**
   * returns true if cache power is on and false otherwise
   * @returns {boolean}
   */
  check_power() {
    if(!this._client) {
      console.log(this._pwer_error_msg);
      return false;
    }
    return true
  }

  /**
   * if on_off is true it turn caching on and if false turns it off
   * @param {Boolean} on_off 
   */
  async caching_on_or_off(on_off=false) {
    //caching on
    if(on_off === true) {
      try {
        if(!this._client) {
          // redis on
          this._client = new Redis({
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT
          });
        
          this._client.on('connect', async () => {
            console.log('Redis server successfully connected');
            // ping redis server
            await this.isAlive();
          });
        
          this._client.on('error', (err) => {
            console.log('Redis server connection error: ', err);
          });
        }
        console.log('CACHING ON');
      } catch (error) {
        console.log('Redis Error: ', error);
        throw error;
      }
    }
    //caching off
    if(on_off === false) {
      if(this._client) {
        // redis off
        this._client = null;
      }
      console.log('CACHING OFF');
    }

  }

  // generates key
  make_key(arr=[]) {
    try {
      if(this.check_power()) {
        if((arr instanceof Array) && arr) {
          return arr.join(':');
        }
        return;
      }
      throw this._power_error;
    } catch (error) {
      
    }
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
  async set_cache (arr, filter, value) {
    try {
      if(this.check_power()) {
        if((arr instanceof Array) && (arr && value && filter)) {
          const query_key = [...arr, JSON.stringify(filter)].join(':');
          if(query_key) {
            const fieldMap = new Map([
              [query_key, JSON.stringify(value)]
            ])
            await this._client.hmset(process.env.REDIS_KEY, fieldMap);
            console.log(`Redis sets ${query_key} in ${process.env.REDIS_KEY}`);
            return true;
          }
        }
      }
      throw this._power_error;
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
      if(this.check_power()) {
        if ((collection && filter) && (Object.values(Collections).includes(collection))) {
          const key = this.make_key(collection, filter, count);
          if(key) {
            const data = await this._client.get(key);
            if (data) { return JSON.parse(data); }
            return null;
          }
        }
      }
      throw this._power_error;
    } catch (error) {
      throw error;
    }
  }
}
const redisClient = new RedisClient();
// redisClient.client.del(process.env.REDIS_KEY).then(() => { console.log('deleted')});
redisClient.set_up_cache()
  .catch((err) => {
    console.log('Error Setting up Cache structure ', err);
  });

module.exports = { Client: redisClient.client, redisClient };
