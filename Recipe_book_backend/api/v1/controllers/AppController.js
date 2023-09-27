const db_storage = require('../models/engine/db_storage');
/**
 * Contains the AppController class 
 * which defines route handlers.
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */
class AppController {
  static home(request, response) {
    response.status(200).json({ message: 'Welcome To Recipe Book Api!' });
  }

  static play(request, response) {
    db_storage.get_a_repo('Recipe')
      .then((recipe) => {
        recipe = new recipe({name: 'Youyou', ingredients: ['ponmo', 'rice']});
        recipe.save()
          .then((resolved) => {
            response.status(200).json({ recipe: resolved });
          })
          .catch((err) => {
            response.status(400).json({ message: 'Bad Request' });
          })
      });
    
  }
}

module.exports = AppController;
