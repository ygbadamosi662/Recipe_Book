import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { logRecipe } from "../../Redux/Recipe/recipeActions";
import { logReview } from "../../Redux/Review/reviewActions";
import { getRecipe, faveRecipe, reviewRecipe, getRecipeReviews } from "../../api_calls";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikControl from "../../FormikControl";
import StarRating from "./StarRating";
import Reviews from "../../components/reviews/Reviews";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaHeart } from 'react-icons/fa';
import "./Recipe.css";

function Recipe({ reduxRecipe, reduxLogRecipe, reduxUserStar, reduxLogReview, reduxUser }) {
 
  const [showReviews, setShowReviews] = useState({
    showReviews: false,
    payload: {
      filter: reduxRecipe._id
    }
  });
  // const [payload, setPayload] = useState({});
  const [reviewCount, setReviewCount] = useState(0);
  const [recipe, setRecipe] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const gatherData = async () => {
      try {
        if(!reduxRecipe._id) {
          toast.error("id is required", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
      
        if(reduxRecipe._id) {
          const gather_task = Promise.all([
            getRecipe(reduxRecipe._id), 
            getRecipeReviews({
              count: true,
              filter: {
                recipe: reduxRecipe._id
              }
            })
          ]);
          const res = await gather_task;
          if (res[0].status === 200) {
            if(res[0].data.recipe) {
              setRecipe(res[0].data.recipe)
            }
          }

          if (res[1].status === 200) {
            if(res[1].data.count) {
              setReviewCount(res[1].data.count);
            }
          }
        }
      } catch (error) {
        console.log(error)
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
    gatherData();
  }, [reduxRecipe._id, reduxLogRecipe]);

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

  const handleReviewsClick = (e) => {
    e.preventDefault();
    if(reviewCount === 0) {
      toast.warning("Recipe has no review at this time", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }
    
    setShowReviews({
      showReviews: true,
      payload: {
        filter: {
          recipe: reduxRecipe._id
        }
      }
    });
  }

  const handleBackFromReviewsClick = (e) => {
    e.preventDefault();
    setShowReviews({
      showReviews: false
    });
  }

  return (recipe.name) ? (
    <div className="recipe">
        {!showReviews.showReviews && (
          <div className="not-reviews">
            <h3>{recipe?.name}</h3>
            <button type="button" className="like-btn" onClick={(e) => handleLike(e)}>
              <FaHeart />
            </button>
            <div className="recipe-owner">
              {`${recipe.user.name.fname}  ${recipe.user.name.lname}`}
              <button type="button" className="owner-btn" onClick={(e) => handleViewOwner(e, recipe.user._id)}>
                View User
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
                    <button type="button" onClick={(e) => handleReviewsClick(e)} className="reviews-btn">
                      {`Reviews(${reviewCount})`}
                    </button>
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
          </div>)
        }
        { (showReviews.showReviews === true) && (
            <div className="reviews">
              <button type="button" className="reviews-bk-btn" onClick={(e) => handleBackFromReviewsClick(e)}>Go back to Recipe</button>
              <Reviews payload={showReviews.payload} command="recipe_reviews"/>
            </div>
          )
        }
    </div>
  ) : 'Hello'
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
