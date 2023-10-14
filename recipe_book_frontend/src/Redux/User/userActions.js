import { LOG_USERS, LOG_USER } from "./userTypes";

export const logUser = (payLoad={}) => {
    return {
        type: LOG_USER,
        user: payLoad,
    }
}

export const logUsers = (payLoad=[]) => {
    return {
        type: LOG_USERS,
        users: payLoad,
    }
}
