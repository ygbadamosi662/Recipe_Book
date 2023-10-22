import React from "react";
import { useEffect } from "react";
import { useMutation } from "react-query";
// import { useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { logReviews } from "../../Redux/Review/reviewActions";
import { getRecipeReviews, ADMIN_getReviews } from "../../api_calls";
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

//   const onClick = () => {
//     navigate('/reviews', { id: id});
//   }

  return (
    <div className="reviews">
      { reviews ?
        reviews.map((review, index) => {
          return <div key={index} className="review">
                    <div className="review-writer">
                        Place holder
                    </div>
                    <h3 className="review-comment">
                        {review.comment}
                    </h3>
                    <div className="review-stars">
                        {review.stars}
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
    // gets user email if set
    reduxUser: state.user.user
  }
}

const mapDispatchToProps = dispatch => {
  return {
    reduxLogReviews: (reviews) => dispatch(logReviews(reviews))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Reviews);
