import React, { useEffect } from "react";
import { useMutation } from "react-query";
import { connect } from "react-redux";
import { logRecipe } from "../../Redux/Recipe/recipeActions";
import { logReview } from "../../Redux/Review/reviewActions";
import { getRecipe, faveRecipe, reviewRecipe } from "../../api_calls";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikControl from "../../FormikControl";
import StarRating from "./StarRating";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaHeart } from 'react-icons/fa';
import "./Recipe.css";

function Recipe({ reduxRecipe, reduxLogRecipe, reduxUserStar, reduxLogReview, reduxUser }) {
  // console.log(reduxUser)
  
  const {
    mutate: fetchRecipe,
    isLoading,
    isError,
    error,
    data,
  } = useMutation(getRecipe);

  const navigate = useNavigate();

  useEffect(() => {
    if(!reduxRecipe._id) {
      toast.error("id is required", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  
    if(reduxRecipe._id) {
      fetchRecipe(reduxRecipe._id);
    }
    
  },[reduxRecipe._id, fetchRecipe]);

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

  const handleLike = async (e) => {
    e.preventDefault();
    try {
      const res = await faveRecipe(reduxRecipe._id);
      if((res.status === 201) || (res.status === 200)) {
        toast.success(res.data.msg, {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
      
    } catch (error) {
      if(error.response) {
        if(error.response.status === 400) {
          toast.error(error.response.data.msg, {
            position: toast.POSITION.TOP_RIGHT,
          });
          return;
        }
        if(error.response.status >= 500) {
          toast.error("Server Error", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
      }
      console.log(error)
    }
  }

  const form_init_value = {
    comment: "",
  };

  const validationSchema = Yup.object({
    comment: Yup
      .string()
      .required("Required"),
  });

  const handleReviewSubmit = async (values) => {
    try {
      const res = await reviewRecipe(JSON.stringify({
        id: reduxRecipe._id,
        comment: values.comment,
        stars: reduxUserStar
      }));
      if((res.status === 201) || (res.status === 200)) {
        reduxLogReview(res.data.review);
        toast.success(res.data.msg, {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      if(error.response) {
        if(error.response.status === 400) {
          toast.error(error.response.data.msg, {
            position: toast.POSITION.TOP_RIGHT,
          });
          return;
        }
        if(error.response.status >= 500) {
          toast.error("Server Error", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
      }
      console.log(error)
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    navigate('/user/recipe/update');
  }

  const handleViewOwner = (e, id) => {
    e.preventDefault();
    navigate(`/user/user/${id}`);
  }

  const recipe = data?.data.recipe;

  return data?.data.recipe ? (
    <div className="recipe">
        <h3>{recipe?.name}</h3>
        <button type="button" className="like-btn" onClick={(e) => handleLike(e)}>
          <FaHeart />
        </button>
        <div className="recipe-owner">
          {`${recipe.user.name.fname}  ${recipe.user.name.lname}`}
          <button type="button" className="owner-btn" onClick={(e) => handleViewOwner(e, recipe.user._id)}>
            View
          </button>
        </div>
        
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
            <Formik
              initialValues={form_init_value}
              onSubmit={handleReviewSubmit}
              validationSchema={validationSchema}
            >
              {(formik) => (
                <Form className="review-recipe" >

                  <FormikControl
                    control="text-area"
                    label="Review"
                    name="comment"
                    className="form-text-area"
                  />
                  <StarRating totalStars={5}/>

                  <button
                    type="submit"
                    disabled={!formik.isValid || formik.isSubmitting}
                    className="submit-btn"
                  >
                    Review
                  </button>
                </Form>
              )}
            </Formik>
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
            { recipe?.guide ? recipe.guide : "Nothing to show"}
        </div>
        { (reduxUser._id === reduxRecipe._id) && (
            <div className="recipe-update">
              <button type="button" onClick={(e) => handleUpdate(e)} className="recipe-update-btn">
                UPDATE
              </button>
            </div>
          )
        }
    </div>
  ) : ''
}

const mapStateToProps = state => {
  return {
    reduxUser: state.user.user,
    reduxRecipe: state.recipe.recipe,
    reduxUserStar: state.user.stars
  };
}

const mapDispatchToProps = dispatch => {
  return {
    reduxLogRecipe: (recipe) => dispatch(logRecipe(recipe)),
    reduxLogReview: (review) => dispatch(logReview(review)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Recipe);