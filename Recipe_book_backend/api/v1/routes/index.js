import AppController from "../controllers/AppController.js";

/**
 * Binds the routes to the appropriate handler in the
 * given Express application.
 * @param {Express} app The Express application.
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */

const PATH_PREFIX = '/api/v1'

const generalRoutes = (app) => {
  app.get(PATH_PREFIX, AppController.home);
};

export default generalRoutes;
