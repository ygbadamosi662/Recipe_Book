import { LOG_REVIEWS, LOG_REVIEW } from "./reviewTypes";

export const logUser = (payLoad={}) => {
    return {
        type: LOG_REVIEW,
        review: payLoad,
    }
}

export const logUsers = (payLoad=[]) => {
    return {
        type: LOG_REVIEWS,
        reviews: payLoad,
    }
}
