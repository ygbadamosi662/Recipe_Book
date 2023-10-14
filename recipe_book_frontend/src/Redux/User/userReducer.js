import { LOG_USERS,LOG_USER } from "./userTypes";

const initState = {
    user: {},
    users: []
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

        default: return state
    }
}
