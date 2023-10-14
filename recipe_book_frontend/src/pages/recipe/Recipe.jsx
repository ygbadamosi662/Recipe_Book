import React from "react";
import "./Recipe.css";
import { recipe } from "../../data.js";

const Recipe = () => {
  const recipeElements = recipe.map((item) => {
    return (
      <div key={item.id} className="recipe-cards">
        <a href={item.url}>
          <div className="recipe-img-container">
            <img src={item.image} alt="logo.png" className="recipe-img" />
          </div>
          <div className="">
            <p>{item.name}</p>
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
