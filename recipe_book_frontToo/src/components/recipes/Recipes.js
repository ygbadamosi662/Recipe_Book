import React from "react";
import { useEffect } from "react";
import { useMutation } from "react-query";
import { connect } from "react-redux";
import { logRecipes } from "../../Redux/Recipe/recipeActions";
import { getMyRecipes, getRecipes, ADMIN_getRecipes } from "../../api_calls";
import { toast } from "react-toastify";
import "./Recipes.css";

function Recipes({ payload, pack, reduxLogRecipes}) {
  
  const orders = {
    user_recipes: getRecipes,
    user_myRecipes: getMyRecipes,
    Admin_recipes: ADMIN_getRecipes,
  };

  const {
    mutate: getOrder,
    isError,
    error,
    data,
  } = useMutation(orders[pack]);

  
  useEffect(() => {
    getOrder(payload)
  },[pack, payload, getOrder]);

  if(!Object.keys(orders).includes(pack)) {
    toast.error("Incomplete request", {
      position: toast.POSITION.TOP_RIGHT,
    });
  }

  if (data?.status === 200) {
    reduxLogRecipes(data?.data.recipes);
  }

  const recipes = data?.data.recipes;

  if(isError)
  {
    if ((error?.response.status === 400) || (error?.response.status === 401)) {
      toast.error(`Bad Request: ${error?.response.data.msg}`, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    if ((error?.response.status >= 500)) {
      toast.error('Server Error', {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  }

//   const onClick = () => {
//     navigate('/reviews', { id: id});
//   }

  return (
    <div className="recipes">
      { recipes ?
        recipes.map((recipe, index) => {
          return <div key={index} className="recipe">
                    <div className="recipe-owner">
                        Place holder
                    </div>
                    <h3 className="recipe-name">
                        {recipe.name}
                    </h3>
                    <div className="recipe-type">
                        {recipe.type}
                    </div>
                    <div className="recipe-likes">
                        {recipe.fave_count}
                    </div>
                 </div>
        })
        : <h2>No Recipe found....</h2>
      }
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
    reduxLogRecipes: (recipes) => dispatch(logRecipes(recipes))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Recipes);
