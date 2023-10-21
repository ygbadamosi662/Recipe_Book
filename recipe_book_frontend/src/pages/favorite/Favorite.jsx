import React from "react";
import { recipes } from "../../data.js";

const Favorite = ({ favoriteRecipes }) => {
  const favoriteRecipeElements = recipes
    .filter((item) => favoriteRecipes.includes(item.id))
    .map((item) => (
      <div key={item.id} className="recipe-cards">
        <a href={item.url}>
          <div className="recipe-img-container">
            <img src={item.image} alt="logo.png" className="recipe-img" />
          </div>
          <div>
            <p className="recipe-name">{item.name}</p>
            <p>{item.recipe}</p>
            <p className="recipe-link">{item.link}</p>
            <p className="recipe-time">{item.time}</p>
          </div>
        </a>
      </div>
    ));
console.log("Favorite Recipes:", favoriteRecipes);
console.log("Recipes Data:", recipes);
  return (
    <div className="container recipe-main-container">
      <div>
        <h1>Favorite Recipes</h1>
      </div>
      <div className="recipe-container">{favoriteRecipeElements}</div>
    </div>
  );
};

export default Favorite;




