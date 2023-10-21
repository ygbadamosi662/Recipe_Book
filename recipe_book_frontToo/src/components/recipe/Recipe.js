import React from "react";
import { useEffect } from "react";
import { useMutation } from "react-query";
// import { useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { logRecipe } from "../../Redux/Recipe/recipeActions";
import { getRecipe } from "../../api_calls";

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
    fetchRecipe(id);
  },[id, fetchRecipe]);

  if(!id) {
    return <div>
             id is required
           </div>
  }
  
  if(isLoading)
  {
    return <h2>Loading...</h2>
  }

  if (data?.status === 200) {
    reduxLogRecipe(data?.data.recipe);
  }

  const recipe = data?.data.recipe;

  if(isError)
  {
    if ((error?.response.status === 400) || (error?.response.status === 401)) {
      return <div className="four-hundred-error">
                <h4>{`Bad Request: ${error?.response.data.msg}`}</h4>
             </div> 
    }
    console.log(error)
  }

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
                <span>{recipe?.fave_count}</span>
            </div>
            <div className="info">
                <button type="button">Reveiws</button>
            </div>
        </div>
        <div className="recipe-ingredients">
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
            { recipe?.guide ?
              recipe.guide.map((guide, index) => {
                return <p key={index} className="recipe-guide">
                          {guide}
                       </p>
              })
              : <h2>No guide available for this recipe....</h2>
            }
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
