import React from "react";
import { useEffect } from "react";
import { useMutation } from "react-query";
import { connect } from "react-redux";
import { logReviews } from "../../Redux/Review/reviewActions";
import { getRecipeReviews, ADMIN_getReviews } from "../../api_calls";
import { FaStar } from 'react-icons/fa';
import { toast } from "react-toastify";
import "./Reviews.css";

function Reviews({ payload, pack, reduxLogReviews }) {
  const orders = {
    recipe_reviews: getRecipeReviews,
    admin: ADMIN_getReviews,
  }

  const {
    mutate: getOrder,
    isError,
    error,
    data,
  } = useMutation(orders[pack]);

  useEffect(() => {
    getOrder(payload)
  },[pack, payload, getOrder]);

  if(!Object.keys(orders).includes(pack)) {
    toast.error("Incomplete request", {
      position: toast.POSITION.TOP_RIGHT,
    });
  }
  
  if (data?.status === 200) {
    reduxLogReviews(data?.data.recipes);
  }

  if(isError)
  {
    if ((error?.response.status === 400) || (error?.response.status === 401)) {
      toast.error(`Bad Request: ${error?.response.data.msg}`, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    if ((error?.response.status >= 500)) {
      toast.error("Server error", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  }

  const reviews = data?.data.reviews;

  const showStars = (stars) => {
    if (stars > 0) {
      let star_show = [];
      for (let index = 1; index <= stars; index++) {
        star_show.push(<FaStar key={index} className="selected"/>);
      }
      return (
        <div>
          {star_show}
        </div>
      );
    }
    return null; // Return null if there are no stars to display
  };

  return (
    <div className="reviews">
      { reviews ?
        reviews.map((review, index) => {
          return <div key={index} className="review">
                    <div className="review-writer">
                        {review.user.name.fname}
                    </div>
                    <h3 className="review-comment">
                        {review.comment}
                    </h3>
                    <div className="review-stars">
                        {showStars(review.stars)}
                    </div>
                 </div>
        })
        : <h2>No Review found....</h2>
      }
    </div>
  );
}

const mapStateToProps = state => {
  return {
    reduxUser: state.user.user
  }
}

const mapDispatchToProps = dispatch => {
  return {
    reduxLogReviews: (reviews) => dispatch(logReviews(reviews))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Reviews);
