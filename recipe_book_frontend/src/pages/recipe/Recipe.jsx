import React from "react";
import "./Recipe.css";
import { recipes } from "../../data.js";
import { useNavigate } from "react-router-dom";

const Recipe = () => {
  const navigate = useNavigate();
  const recipeElements = recipes.map((item) => {
    return (
      <div key={item.id} className="recipe-cards">
        <a href={item.url}>
          <div className="recipe-img-container">
            <img src={item.image} alt="logo.png" className="recipe-img" />
          </div>
          <div className="">
            <p className="recipe-name">{item.name}</p>
            <p>{item.recipe}</p>
            <p className="recipe-link">{item.link}</p>
            <p className="recipe-time">{item.time}</p>
            {/* <span>{item.icon}</span> */}
          </div>
        </a>
      </div>
    );
  });

  return (
    <div className="container recipe-main-container">
      <div>
        <h1>Latest Recipies</h1>
      </div>
      <div className="recipe-container">{recipeElements}</div>
    </div>
  );
};

export default Recipe;
