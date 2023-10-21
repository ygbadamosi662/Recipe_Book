import React, { useState } from "react";
import "./Recipe.css";
import { recipes } from "../../data.js";
import { useNavigate } from "react-router-dom";

const Recipe = () => {
  const navigate = useNavigate();
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  
  const toggleFavorite = (recipeId) => {
    if (favoriteRecipes.includes(recipeId)) {
      setFavoriteRecipes(favoriteRecipes.filter(id => id !== recipeId));
    } else {
      setFavoriteRecipes([...favoriteRecipes, recipeId]);
    }
  };

  const recipeElements = recipes.map((item) => {
    const isFavorite = favoriteRecipes.includes(item.id);

    return (
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
            <button  className="fav-btn" onClick={() => toggleFavorite(item.id)}>
              {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </button>
          </div>
        </a>
      </div>
    );
  });

  const goToFavoritePage = () => {
    navigate("/favorite");
  };

  return (
    <div className="container recipe-main-container">
      <div>
        <h1>Latest Recipes</h1>
        <button onClick={goToFavoritePage}>View Favorites</button>
      </div>
      <div className="recipe-container">{recipeElements}</div>
    </div>
  );
};

export default Recipe;