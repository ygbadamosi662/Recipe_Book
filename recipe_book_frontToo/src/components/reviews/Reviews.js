import React from "react";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { logReviews } from "../../Redux/Review/reviewActions";
import { getRecipeReviews, ADMIN_getReviews } from "../../api_calls";
import { FaStar } from 'react-icons/fa';
import { toast } from "react-toastify";
import "./Reviews.css";

function Reviews({ payload, command }) {
  const [page, setPage] = useState(1);
  const [haveNextPage, setHaveNextPage] = useState(false);
  const [reviews, setReviews] = useState(null);
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    const orders = {
      recipe_reviews: getRecipeReviews,
      admin: ADMIN_getReviews,
    }

    if(!orders[command]) {
      toast.error("Invalid command", {
          position: toast.POSITION.TOP_RIGHT,
        });
    }
    const fetchReviews = async () => {
      try {
        payload.page = page;
        const res = await orders[command](JSON.stringify(payload));
        if (res.status === 200) {
          if(res.data.reviews) {
            setReviews(res.data.reviews);
          }
          if(res.data?.total_pages) {
            setTotalPages(res.data?.total_pages);
          }
          if (res.data.have_next_page) {
            setHaveNextPage(true);
          }
        }
      } catch (error) {
        console.log(error)
        if (error.response) {
          toast.error(error.response.data.msg, {
            position: toast.POSITION.TOP_RIGHT,
          });
        } else {
          toast.error("Network error. Please try again later.", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
      }
    };
    fetchReviews();
  }, [payload, command, page, setReviews]);

  const handleNextClick = () => {
    setPage(page + 1);
  };

  const handlePrevClick = () => {
    setPage(page - 1);
  };


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
                        {review.user.name.fname+" "+review.user.name.lname}
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
      {haveNextPage && (
        <div className="page-btns-container">
          {page > 1 && (
            <button type="button" className="prev-btm" onClick={handlePrevClick}>
              prev
            </button>
          )}
          <span>{`${page}/${totalPages}`}</span>
          {page < totalPages && (
            <button type="button" className="next-btm" onClick={handleNextClick}>
                next
            </button>
          )}
          
        </div>
      )}
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
