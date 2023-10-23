import { LOG_USERS, LOG_USER, LOG_EMAIL, LOG_PHONE, LOG_NOT_AUTH } from "./userTypes";

const initState = {
    user: {},
    users: [],
    not_auth: true
}

export const userReducer = (state = initState, action) => {
  switch (action.type) {
    case LOG_USER: return {
        ...state,
        user: action.user
    }  
    case LOG_USERS: return {
        ...state,
        users: action.users
    }  
    case LOG_EMAIL: return {
        ...state,
        user: {
          email: action.email,
        }
    }  
    case LOG_PHONE: return {
        ...state,
        user: {
          phone: action.phone,
        }
    }  
    case LOG_NOT_AUTH: return {
        ...state,
        not_auth: false
    }  
    default: return state
  }
}
