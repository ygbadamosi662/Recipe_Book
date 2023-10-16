import { appAx } from "./AppAxios"

// General routes
export const login = (payload) => {
/**
* payload: {
	email: <string> <required>,
	password: <string> <required>,
  }

  returns: {
    message: "Login succesful",
    user: <string: user's id>,
    token: <string: jwt token>
  }
*/
  return appAx.post('http://127.0.0.1:1245/api/v1/general/login', payload);
};

export const register = (payload) => {
/**
* payload: {
	  fname: <string> <required>,
	  lname: <string> <required>,
	  email: <string> <required>,
	  password: <string> <required> <pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/>,
	  phone: <string> <required>
  }

  returns: {
    user: <user_obj>
  }
*/
  return appAx.post('http://127.0.0.1:1245/api/v1/general/register', payload);
};

// auth routes
// auth routes: user routes
export const getUser = (id) => {
/**
* id: <string> <required>
*
* returns: {
*   user: <user_obj>
* }
*/
  return appAx.get(`http://127.0.0.1:1245/api/v1/auth/users/get/${id}`);
};

export const updateUser = (payload) => {
/**
 * payload: {
 *  fname: <string>,
 *  lname: <string>,
 *  aka: <string>,
 *  dob: <Date>,
 *	phone: {
 *	  new_phone: <string> <required>,
 *	  password: <string> <required> <pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*    ()]{8,}$/>
 *	},
 *	email: {
 *	  new_email: <string> <required>,
 *	  password: <string> <required> <pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*    ()]{8,}$/>
 *	}
 *	password: {
 *	  new_password: <string> <required> <pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/>
 *	  old_password: <string> <required> <pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*    ()]{8,}$/>
 *	}
 * }
 * 
 * returns: {
 *  message: 'User succesfully updated',
 *  user: <string: user id>
 * }
*/
  return appAx.post('http://127.0.0.1:1245/api/v1/auth/users/update', payload);
};

export const createRecipe = (payload) => {
/**
* payload: {
*   name: <string> <required>,
*   type: <string(all CAPS)> <required>,
*   ingredients: <[string]> <required>,
*   inspiration: <string>,
*   description: <string>,
*   guide: <[string]> <required>,
*   permit: <string> <enum: ["PUBLIC", "PRIVATE"]> <default: "PUBLIC"> <required>
* }
*
* returns: {
*   message: `Recipe <recipe.name> successfully created`,
*   recipe: <recipe_obj>,
* }
*/
  return appAx.post('http://127.0.0.1:1245/api/v1/auth/users/recipe/create', payload);
};

export const updateRecipe = (payload) => {
/**
* payload: {
*   id: <string> <required>,
*   name: <string>,
*   type: <string(all CAPS)>,
*   ingredients: <[string]>,
*   inspiration: <string>,
*   description: <string>,
*   guide: <[string]>,
*   permit: <string> <enum: ["PUBLIC", "PRIVATE"]>
* }
*
* returns: {
*   message: 'User succesfully updated',
*   recipe: <string: recipes id>
* }
*/
  return appAx.post("http://127.0.0.1:1245/api/v1/auth/users/recipe/update", payload);
};

export const getRecipes = (payload) => {
/**
* payload: {
*    name: <string>,
*    type: <string(all CAPS)>,
*    ingredients: <[string]>,
*    guide: <[string]>,
*    page: <integer> <default: 1>,
*    size: <integer> <default: 20>
* }
*
* returns: {
*   recipes: <[recipe_obj]>,
*   have_next_page: <boolean>,
*   total_pages: <integer>
* }
*/
  return appAx.get('http://127.0.0.1:1245/api/v1/auth/users/recipe/get/recipes', payload);
};

export const getMyRecipes = (payload) => {
/**
* payload: {
*    count: <boolean> <default: false>,
*    name: <string>,
*    type: <string(all CAPS)>,
*    ingredients: <[string]>,
*    guide: <[string]>,
*    permit: <string> <enum: ["PRIVATE", "PUBLIC"]> <default: "PUBLIC">,
*    page: <integer> <default: 1>,
*    size: <integer> <default: 20>
* }
*
* returns: {
*   recipes: <[recipe_obj]>,
*   have_next_page: <boolean>,
*   total_pages: <integer>
* }
*/
  return appAx.post('http://127.0.0.1:1245/api/v1/auth/users/recipe/get/recipes/mine', payload);
}

export const getRecipe = (id) => {
/**
 * id: <string> <required>
 * 
 * returns: {
 *   recipe: <recipe_obj>
 * }
 */
  return appAx.get(`http://127.0.0.1:1245/api/v1/auth/users/recipe/get/651c765e22b4542f4aaf8096/${id}`);
};

export const faveRecipe = (id) => {
/**
 * id: <string> <required>
 * 
 * returns: {
 *   message: 'user faved <recipe.name> recipe',
 * }
 */
  return appAx.get(`http://127.0.0.1:1245/api/v1/auth/users/recipe/fave/${id}`);
};

export const reviewRecipe = (payload) => {
/**
* payload: {
*    id: <string> <required>,
*    comment: <string>,
*    stars: <integer> <required>
* }
*
* returns: {
*   message: 'Review created successfully',
*   review: <review_obj>
* }
*/
  return appAx.post("http://127.0.0.1:1245/api/v1/auth/users/recipe/review", payload);
};

export const getRecipeReviews = (payload) => {
/**
* payload: {
*    count: <boolean> <default: false>,
*    filter: {
*      recipe: <string: recipe_id> <required>,
*      stars: <[number]>, // an array for range like [from, to], [stars] will mean >= stars
*                       // [0, stars] will mean <= stars and [stars, stars] will mean == stars
*      comment: <string> // it checks this comment against its respective field in the doc if it matches any *                        // string, so it can be used to search for comments providing only parts of string.
*    } <required>,
*    page: <integer> <default: 1>,
*    size: <integer> <default: 20>
* }
*
* returns: {
*   reviews: <[review_obj]>,
*   have_next_page: <boolean>,
*   total_pages: <integer>
* }
*/
  return appAx.post("http://127.0.0.1:1245/api/v1/auth/users/recipe/review", payload);
};
