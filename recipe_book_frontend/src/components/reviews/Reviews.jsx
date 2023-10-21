import React from "react";
import "./Reviews.css";
import reviews from "../../data";



const Reviews = () => {

  
  const reviewElements = reviews.map((item) => {
    return (
      <div key={item.id} className="cards">
        <a href={item.url}>
          <div className="review-img-container">
            <img src={item.image} alt="logo.png" className="review-img" />
          </div>
          <div className="">
            <p className="review-names">{item.name}</p>
            <p className="review-location">{item.location}</p>
            <p className="review-rating">{item.rating}</p>
            <p className="review-desc">{item.desc}</p>
            <span>{item.icon}</span>
          </div>
        </a>
      </div>
    );
  });

  return (
    <div className="container">
      <div>
        <h1 className="review-header">REVIEWS</h1>
      </div>
      <div className="reviews-container">

      {reviewElements}
      </div>
    </div>
  );
};

export default Reviews;
