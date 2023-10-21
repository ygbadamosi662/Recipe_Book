import React, { useState } from "react";
import "./Favourite.css";
const Favorites = () => {
  //state variable to store favorite recipes
  const [favoriteRecipes, setFavoriteRecipes] = useState([
    {
      id: 1,
      title: "Spaghetti Carbonara",
      description: "A classic Italian pasta dish.",
      image: "spaghetti-carbonara.jpg",
    },
    {
      id: 2,
      title: "Chicken Alfredo",
      description: "Creamy chicken and pasta goodness.",
      image: "chicken-alfredo.jpg",
    },
    // Add more favorite recipes as needed
  ]);

  return (
    <div className="favorites-page">
      <h2>My Favorite Recipes</h2>
      <div className="recipe-list">
        {favoriteRecipes.map((recipe) => (
          <div key={recipe.id} className="recipe-card">
            <img src={recipe.image} alt={recipe.title} />
            <h3>{recipe.title}</h3>
            <p>{recipe.description}</p>
            <button className="remove-favorite">Remove from Favorites</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;
