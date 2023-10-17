import { combineReducers } from "redux";
import { userReducer } from './User/userReducer'
import { recipeReducer } from "./Recipe/recipeReducer";
import { notificationReducer } from "./Notification/notificationReducer";
import { reviewReducer } from "./Review/reviewReducer";
/**
* Initializes rootReducer
* @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
*/

export const rootReducer = combineReducers({
    user: userReducer,
    recipe: recipeReducer,
    notification: notificationReducer,
    review: reviewReducer
});
