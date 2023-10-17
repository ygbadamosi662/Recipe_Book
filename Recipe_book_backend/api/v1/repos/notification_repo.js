const { db_storage } = require('../models/engine/db_storage');
const { Notification_str } = require('../global_constants');
/**
 * defines the NotificationRepo class
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */

class NotificationRepo {
  constructor () {
    try {
      this._repo = db_storage.get_a_repo(Notification_str);
      this._conn = db_storage._conn
      this._page_size = 20;
    } catch (error) {
      throw error;
    }
     
  }

  get repo() {
    return this._repo;
  }

  get conn() {
    return this._conn;
  }

  get page_size() {
    return this._page_size;
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

const notification_repo = new NotificationRepo();

module.exports = { Notification: notification_repo.repo, notification_repo };
