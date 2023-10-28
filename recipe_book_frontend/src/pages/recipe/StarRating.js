import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { connect } from "react-redux";
import { logStars  } from '../../Redux/User/userActions';
const StarRating = ({ totalStars, reduxLogStars }) => {
  const [rating, setRating] = useState(0);

  useEffect(() => {
    reduxLogStars(rating);
  }, [rating, reduxLogStars])

  const handleStarClick = (selectedRating) => {
    setRating(selectedRating);
  };


  return (
    <div>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <FaStar
            key={index}
            className={starValue <= rating ? 'selected' : ''}
            onClick={() => handleStarClick(starValue)}
          />
        );
      })}
      <p>{rating} out of {totalStars} stars</p>
    </div>
  );
};


const mapDispatchToProps = dispatch => {
  return {
    reduxLogStars: (stars) => dispatch(logStars(stars))
  }
}

export default connect(null, mapDispatchToProps)(StarRating);
