import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { logRecipe } from "../../Redux/Recipe/recipeActions";
import { getMyRecipes, getRecipes, ADMIN_getRecipes } from "../../api_calls";
import { useNavigate } from "react-router-dom";
import { FaHeart } from 'react-icons/fa';
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { resetStore } from "../../Redux/reset/reset_action";
import "./Recipes.css";

function Recipes({ payload, command, reduxLogRecipe }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [haveNextPage, setHaveNextPage] = useState(false);
  const [recipes, setRecipes] = useState(null);
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    const orders = {
        user_recipes: getRecipes,
        user_myRecipes: getMyRecipes,
        Admin_recipes: ADMIN_getRecipes,
    };

    if(!orders[command]) {
      toast.error("Invalid command", {
          position: toast.POSITION.TOP_RIGHT,
        });
    }
    const fetchRecipes = async () => {
      try {
        payload.page = page;
        const res = await orders[command](JSON.stringify(payload));
        if (res.status === 200) {
          if(res.data.recipes) {
            setRecipes(res.data.recipes);
          }
          if(res.data?.total_pages) {
            setTotalPages(res.data?.total_pages);
          }
          if (res.data.have_next_page) {
            setHaveNextPage(true);
          }
        }
      } catch (error) {
        // handles token expiration, token blacklisted, token invalid, and token absent
        if(error.response?.data?.jwt) {
          toast.warning(error.response.data.jwt, {
            position: toast.POSITION.TOP_RIGHT,
          });
          localStorage.removeItem("Jwt");
          dispatch(resetStore);
          navigate('/');
        }
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
    fetchRecipes();
  }, [payload, command, page, setRecipes, navigate, dispatch]);


  const handleRecipeClick = (e, id) => {
    e.preventDefault();
    reduxLogRecipe({
      _id: id
    });
    navigate('/user/recipe');
  };

  const handleNextClick = () => {
    setPage(page + 1);
  };

  const handlePrevClick = () => {
    setPage(page - 1);
  };

  return (
    <div className="mains-recipes">
      <div className="recipes">
        {recipes ? (
          recipes.map((recipe, index) => (
            <div key={index} className="recipe" onClick={(e) => handleRecipeClick(e, recipe._id)}>
              <span className="recipe-name"><h2>{recipe.name}</h2></span>
              <div className="recipe-type"><h4>{recipe.type}</h4></div>
              <div className="recipe-likes">
                <FaHeart /> {recipe.fave_count}
              </div>
            </div>
          ))
        ) : (
          <h2>No Recipe found....</h2>
        )}
      </div>
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

const mapStateToProps = (state) => {
  return {
    reduxUser: state.user.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    reduxLogRecipe: (recipe) => dispatch(logRecipe(recipe)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Recipes);
