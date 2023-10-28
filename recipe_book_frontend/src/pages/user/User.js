import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getUser, follow_unfollow } from "../../api_calls";
import Holder from "../come_with_us/Holder";
import { connect } from "react-redux";
import { FaHeart } from "react-icons/fa";
import { useParams } from 'react-router-dom';
import { logRecipe } from "../../Redux/Recipe/recipeActions";
import FullHouse from "../../components/followers_following/FullHouse";
import { useDispatch } from "react-redux";
import { resetStore } from "../../Redux/reset/reset_action";
import "./User.css";


const stylez = (clas) => {
  return {
    borderBottom: clas === 'active' ? "0.5rem solid green" : "",
    // backgroundColor: 'black',
    height: clas === 'active'? '3rem' : '2.5rem',
    width: '50%',
    // color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: '0.5s'
    // alignText: 'center'
  };
};


function User({ reduxLogRecipe, reduxUser }) {
  const dispatch = useDispatch();

  const { id } = useParams();

  const handleChoice = (e) => {
    e.preventDefault();
    const what = e.currentTarget.name;
    switch (what) {
      case "faves":
        setChoice(true);
        break;
      case "recipes":
        setChoice(false);
        break;
      default:
        setChoice(true);
        break;
    }
  };

  // to manage toggle state between faves and recipes
  const [choice, setChoice] = useState(true);
  const [user, setUser] = useState(null);
  const [showFullHouse, setShowFullHouse] = useState(false);

  const navigate = useNavigate();  

  useEffect(() => {
    if(!id) {
      toast.error("id is required", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await getUser(id);
        if (res.status === 200) {
          if(res.data.user) {
            setUser(res.data.user);
          }
        }
      } catch (error) {
        if (error.response) {
          // handles token expiration, token blacklisted, token invalid, and token absent
          if(error.response?.data?.jwt) {
            toast.warning(error.response.data.jwt, {
              position: toast.POSITION.TOP_RIGHT,
            });
            localStorage.removeItem("Jwt");
            dispatch(resetStore);
            navigate('/');
          }
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
      fetchUser();
  },[id, navigate, dispatch]);


  // Decides what to display in follow-unfollow-btn
  const if_follow_or_unfollow = () => {
    return user.followers?.includes(reduxUser._id) ? "Unfollow" : "Follow";
  };

  const handleFollowUnfollow = async (e, id) => {
    e.preventDefault();

    // build query
    let query = {};
    query.id = id;
    if(e.target.innerText === "Unfollow") {
      query.follow = false;
    }
    if(e.target.innerText === "Follow") {
      query.follow = true;
    }

    try {
      const res = await follow_unfollow(query);
      console.log(res)
      if(res.status === 201) {
        toast.success(res.data.msg, {
            position: toast.POSITION.TOP_RIGHT,
        });
      }
      if(res.status === 200) {
        toast.success(res.data.data.msg, {
            position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      if(error.response.status === 500) {
        toast.success("Server Error", {
            position: toast.POSITION.TOP_RIGHT,
        });
      }
      if(error.response.status === 401) {
        // handles token expiration, token blacklisted, token invalid, and token absent
        if(error.response?.data?.jwt) {
          toast.warning(error.response.data.jwt, {
            position: toast.POSITION.TOP_RIGHT,
          });
          localStorage.removeItem("Jwt");
          dispatch(resetStore);
          navigate('/');
        }
      }
      if(error.response.status === 400) {
        toast.success(error.response.data.msg, {
            position: toast.POSITION.TOP_RIGHT,
        });
        console.log(error);
      }
    }
  };

  const handleRecipeClick = (e, id) => {
    e.preventDefault();
    reduxLogRecipe({
      _id: id
    });
    navigate('/user/recipe');
  };

  const handleFollowers_following_btn = (e) => {
    e.preventDefault();
    setShowFullHouse(true);
  };

  const handleBackToUserClick = (e) => {
    e.preventDefault()
    setShowFullHouse(false);
  };
  
  return user ? (
    <div className="user">
       <div className="user-meta">
          <div className="name">
            <h2>{`${user.name.fname} ${user.name.lname}`}</h2>
          </div>
          <button type="button" className="followers-following-btn" onClick={(e) => handleFollowers_following_btn(e)}>
            <span>{`Followers(${user.followers?.length})`}</span>/
            <span>{`Following(${user.following?.length})`}</span>
          </button>
          
          { (user._id !== reduxUser._id) && (
              <button type="button" className="follow-unfollow-btn" onClick={(e) => handleFollowUnfollow(e, user._id)}>
                {if_follow_or_unfollow()}
              </button>
            )
          }
       </div>
       {!showFullHouse && 
        (
          <div className="user-recipes-holder">
            <div className="toggle">
             <Holder
               name='faves'
               clas={choice ? "active" : ""}
               handleClick={handleChoice}
               stylez={stylez}
               display='My Faves'
             />
             <Holder
               name='recipes'
               clas={!choice ? "active" : ""}
               handleClick={handleChoice}
               stylez={stylez}
               display='My Recipes'
             />
            </div>
            <div className="user-recipes">
              {!choice &&  user.recipes?.map((recipe, index) => {
                  return <div key={index} className="user-recipe" onClick={(e) => handleRecipeClick(e, recipe._id)} >
                    <span className="recipe-name"><h2>{recipe.name}</h2></span>
                    <span className="recipe-type"><h4>{recipe.type}</h4></span>
                    <div className="recipe-likes">
                      <FaHeart color="red"/> {recipe.fave_count}
                    </div>
                            
                  </div>
                })
              }
              {choice &&  user.faves?.map((recipe, index) => {
                  return <div key={index} className="user-recipe" onClick={(e) => handleRecipeClick(e, recipe._id)} >
                            <span className="recipe-name"><h2>{recipe.name}</h2></span>
                            <span className="recipe-type"><h4>{recipe.type}</h4></span>
                            <div className="recipe-likes">
                              <FaHeart color="red"/> {recipe.fave_count}
                            </div>
                         </div>
                })
              }
            </div>
            
          </div>
        )
       }
       { showFullHouse && (
            <div className="fullhouse">
              <button type="button" className="user-bk-btn" onClick={(e) => handleBackToUserClick(e)}>Go back to Recipes</button>
              <FullHouse id={user._id}/>
            </div>
          )
       }
       
    </div>
  ) : ''
}

const mapStateToProps = state => {
  return {
    reduxUser: state.user.user,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    reduxLogRecipe: (recipe) => dispatch(logRecipe(recipe)),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(User);
