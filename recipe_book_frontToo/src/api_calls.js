import { appAx, setAuthHeader } from "./appAxios"
/**
 * All functions in this module return a promise
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */

export const getHome = () => {;
  return appAx.get('http://127.0.0.1:1245/api/v1/general/');
}

// General routes
export const login = (payload) => {
/**
* payload : {
	email: <string> <required>,
	password: <string> <required>,
  }

  returns{
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


// auth routes: Headers: Authorization = 'Bearer <jwt_token>', Content-Type = 'application/json'.
export const signout = () => {
/**
* returns: {
*   message: 'Logged out succesfully',
*   token: jwt_token
* }
*/
  setAuthHeader();
  return appAx.get(`http://127.0.0.1:1245/api/v1/auth/logout`);
};
// auth routes: user specific routes
export const getUser = (id) => {
/**
* id: <string> <required>
*
* returns: {
*   user: <user_obj>
* }
*/
  setAuthHeader();
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
  setAuthHeader();
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
  setAuthHeader();
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
  setAuthHeader();
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
  setAuthHeader();
  return appAx.post('http://127.0.0.1:1245/api/v1/auth/users/recipe/get/recipes', payload);
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
  setAuthHeader();
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
  setAuthHeader();
  return appAx.get(`http://127.0.0.1:1245/api/v1/auth/users/recipe/get/${id}`);
};

export const faveRecipe = (id) => {
/**
 * id: <string> <required>
 * 
 * returns: {
 *   message: 'user faved <recipe.name> recipe',
 * }
 */
  setAuthHeader();
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
  setAuthHeader();
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
  setAuthHeader();
  return appAx.post("http://127.0.0.1:1245/api/v1/auth/users/recipe/get/reviews", payload);
};

export const getReview = (id) => {
/**
* id: <string: review.id>
*
* returns: {
*   review: <[review_obj>,
* }
*/
  setAuthHeader();
  return appAx.get(`http://127.0.0.1:1245/api/v1/auth/users/review/${id}`);
};

export const deleteReview = (id) => {
/**
* id: <string: review.id>
*
* returns: {
*   message: "Review with id: <review.id> successfully deleted"
* }
*/
  setAuthHeader();
  return appAx.get(`http://127.0.0.1:1245/api/v1/auth/users/review/delete/${id}`);
};

export const deleteRecipe = (id) => {
/**
* id: <string: recipe.id>
*
* returns: {
*   message: "Recipe with id: <recipe.id> successfully deleted"
* }
*/
  setAuthHeader();
  return appAx.get(`http://127.0.0.1:1245/api/v1/auth/users/recipe/delete/${id}`);
};

export const getMyNotifications = (payload) => {
  /**
  * payload: {
  *    count: <boolean> <default: false>,
  *    comment: <string>,
  *    status: <enum: ["SENT", "RECEIVED", "READ"]> <default: "SENT">,
  *    page: <integer> <default: 1>,
  *    size: <integer> <default: 20>
  * }
  *
  * returns: {
  *   notes: <[{ id: <string>, comment: <string>, status: <string>}]>,
  *   have_next_page: <boolean>,
  *   total_pages: <integer>
  * }
  */
  setAuthHeader();
  return appAx.post('http://127.0.0.1:1245/api/v1/auth/users/notification/notifications', payload);
};

export const getNotification = (id) => {
  /**
  * id: <string: notofication.id>
  *
  * returns: {
  *   note: <notification_obj>
  * }
  */
  setAuthHeader();
  return appAx.get(`http://127.0.0.1:1245/api/v1/auth/users/notification/${id}`);
};

export const follow_unfollow = (payload) => {
  /**
  * payload: {
  *    id: <string: user.id> <required>,
  *    follow: <boolean> <required> //if true user will be followed, if false user will be unfollowed
  * }
  *
  * returns: {
  *   message: "You are now following <user.name.fname + user.name.lname>"
  * }
  */
  setAuthHeader();
  return appAx.post('http://127.0.0.1:1245/api/v1/auth/users/FollowUnfollow', payload);
};

export const getFollowersOrFollowing = async (payload) => {
  /**
  * payload: {
  *    count: <boolean> <default: false>,
  *    which: <enum: ["following", "followers"]> <default: "followers">
  * }
  *
  * returns: {
  *   users: <[user_obj]>
  * }
  */
  setAuthHeader();
  return appAx.post('http://127.0.0.1:1245/api/v1/auth/users/FollowUnfollow', payload);
};
// auth routes: admin specific routes
export const SUPER_ADMIN_manage_user_role = (payload) => {
  /**
   * Only 'SUPER ADMIN' is permitted
  * payload: {
  *    email: <string> <required>,
  *    role: <enum: ["USER", "ADMIN", "SUPER ADMIN"] <required>
  * }
  *
  * returns: {
  *   message: 'Role succesfully updated',
  *   user: <user_obj>
  * }
  */
  setAuthHeader();
  return appAx.post('http://127.0.0.1:1245/api/v1/auth/admin/role/switcheroo', payload);
};

export const ADMIN_findUser = (payload) => {
  /**
  * payload: {
  *    email: <string>,
  *    phone: <string> <pattern: /^[8792][01]\d{8}$/>
  * }
  *
  * returns: {
  *   user: <user_obj>
  * }
  */
  setAuthHeader();
  return appAx.post('http://127.0.0.1:1245/api/v1/auth/admin/find/user', payload);
};

export const ADMIN_getUsers = (payload) => {
  /**
  * payload: {
  *    count: <boolean> <default: false>,
  *    filter: {
  *      name: {
  *        fname: <string>,
  *        lname: <string>,
  *        aka: <string>
  *      },
  *      dob: <Date>,
  *      role: <enum: ["USER", "ADMIN", "SUPER ADMIN"]>
  *    },
  *    page: <integer> <default: 1>,
  *    size: <integer> <default: 20>
  * }
  *
  * returns: {
  *   users: <[user_obj]>,
  *   have_next_page: <boolean>,
  *   total_pages: <integer>
  * }
  */
    setAuthHeader();
    return appAx.post("http://127.0.0.1:1245/api/v1/auth/admin/get/users", payload);
};

export const ADMIN_getRecipes = (payload) => {
/**
* payload: {
*    count: <boolean> <default: false>,
*    filter: {
*      name: <string>,
*      fave_count: <[integer]>, // an array for range like [from, to], [fave_count] will mean >= fave_count
          //[0, fave_count] will mean <= fave_count and [fave_count, fave_count] will mean == fave_count
*      type: <string>,
*      ingredients: <[string]>,
*      permit: <enum: ["PUBLIC", "PRIVATE"]> <default: "PUBLIC">,
*      user: <string: user.id>,
*      createdAt: <integer || float(one decimal place)> //in hours ago
*    },
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
  setAuthHeader();
  return appAx.post("http://127.0.0.1:1245/api/v1/auth/admin/get/recipes", payload);
};

export const ADMIN_getReviews = (payload) => {
/**
* payload: {
*    count: <boolean> <default: false>,
*    filter: {
*      comment: <string>,
*      stars: <[integer]>, // an array for range like [from, to], [stars] will mean >= stars
          //[0, stars] will mean <= stars and [stars, stars] will mean == stars
*      type: <string>,
*      ingredients: <[string]>,
*      permit: <enum: ["PUBLIC", "PRIVATE"]> <default: "PUBLIC">,
*      user: <string: user.id>,
*      recipe: <string: review.id>,
*      createdAt: <integer || float(one decimal place)> //in hours ago
*    },
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
  setAuthHeader();
  return appAx.post("http://127.0.0.1:1245/api/v1/auth/admin/get/reviews", payload);
};

export const ADMIN_getNotifications = (payload) => {
/**
* payload: {
*    count: <boolean> <default: false>,
*    filter: {
*      comment: <string>,
*      status: <enum: ["SENT", "RECEIVED", "READ"]> <default: "RECEIVED">,
*      to: <string: user.id>,
*      createdAt: <integer || float(one decimal place)> //in hours ago
*    },
*    page: <integer> <default: 1>,
*    size: <integer> <default: 20>
* }
*
* returns: {
*   notifications: <[notification_obj]>,
*   have_next_page: <boolean>,
*   total_pages: <integer>
* }
*/
  setAuthHeader();
  return appAx.post("http://127.0.0.1:1245/api/v1/auth/admin/get/notifications", payload);
};

export const ADMIN_getRecipe = (id) => {
/**
* id: <string: recipe.id>
*
* returns: {
*   recipe: <recipe_obj>
* }
*/
  setAuthHeader();
  return appAx.get(`http://127.0.0.1:1245/api/v1/auth/admin/get/recipe/${id}`);
};

export const ADMIN_getReview = (id) => {
/**
* id: <string: review.id>
*
* returns: {
*   review: <review_obj>
* }
*/
  setAuthHeader();
  return appAx.get(`http://127.0.0.1:1245/api/v1/auth/admin/get/review/${id}`);
};

export const ADMIN_getNotification = (id) => {
/**
* id: <string: notification.id>
*
* returns: {
*   notification: <notification_obj>
* }
*/
  setAuthHeader();
  return appAx.get(`http://127.0.0.1:1245/api/v1/auth/admin/get/notification/${id}`);
};

export const ADMIN_deleteReview = (id) => {
/**
* id: <string: review.id>
*
* returns: {
*   message: "Review with id: <review.id> successfully deleted"
* }
*/
  setAuthHeader();
  return appAx.get(`http://127.0.0.1:1245/api/v1/auth/admin/review/delete/${id}`);
};

export const ADMIN_deleteRecipe = (id) => {
/**
* id: <string: recipe.id>
*
* returns: {
*   message: "Recipe with id: <recipe.id> successfully deleted"
* }
*/
  setAuthHeader();
  return appAx.get(`http://127.0.0.1:1245/api/v1/auth/admin/recipe/delete/${id}`);
};
