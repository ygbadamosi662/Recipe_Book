import React, { useEffect } from "react";
import { useMutation } from "react-query";
import { connect } from "react-redux";
import { logRecipe } from "../../Redux/Recipe/recipeActions";
import { getRecipe } from "../../api_calls";
import { toast } from "react-toastify";
import { FaHeart } from 'react-icons/fa';
import "./Recipe.css";

function Recipe({ id, reduxLogRecipe}) {
  
  const {
    mutate: fetchRecipe,
    isLoading,
    isError,
    error,
    data,
  } = useMutation(getRecipe);

  useEffect(() => {
    if(!id) {
      toast.error("id is required", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    if(id) {
      fetchRecipe(id);
    }
  },[id, fetchRecipe]);

  if(isLoading)
  {
    return <h2>Loading...</h2>
  }

  if(isError)
  {
    if(error?.response.status === 400) {
      toast.error(`Bad Request: ${error?.response.data.msg}`, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    if(error?.response.status >= 500) {
      toast.error("Server Error ", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    
  }

  if (data?.status === 200) {
    reduxLogRecipe(data?.data.recipe);
  }

  const recipe = data?.data.recipe;

  

//   const onClick = () => {
//     navigate('/reviews', { id: id});
//   }

  return (
    <div className="recipe">
        <div className="recipe-owner">Place holder</div>
        <h3>{recipe?.name}</h3>
        <div className="recipe-meta">
            <div className="info">
                <label>Type</label>
                <span>{recipe?.type}</span>
            </div>
            <div className="info">
                <label>Access</label>
                <span>{recipe?.permit}</span>
            </div>
            <div className="info">
                <label>Likes</label>
                <span><FaHeart/>{recipe?.fave_count}</span>
            </div>
            <div className="info">
                <button type="button">Reveiws</button>
            </div>
        </div>
        <div className="recipe-ingredients">
            <h3>Ingredients</h3>
            { recipe?.ingredients ?
              recipe.ingredients.map((ing, index) => {
                return <h4 key={index} className="recipe-ingredient">
                          {ing}
                       </h4>
              })
              : <h2>Nothing to see here....</h2>
            }
        </div>
        <div className="recipe-guides">
            <h3>Preparation</h3>
            { recipe?.guide ? recipe : "Nothing to show"}
        </div>
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
    reduxLogRecipe: (recipe) => dispatch(logRecipe(recipe))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Recipe);
