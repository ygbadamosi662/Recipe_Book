import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useMutation } from "react-query";
import { getUser, follow_unfollow } from "../../api_calls";
import Holder from "../come_with_us/Holder";
import { connect } from "react-redux";
import { FaHeart } from "react-icons/fa";
import { useParams } from 'react-router-dom';
import { logRecipe } from "../../Redux/Recipe/recipeActions";
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

  const {
    mutate: fetchUser,
    isLoading,
    isError,
    error,
    data,
  } = useMutation(getUser);  

  const navigate = useNavigate();  

  useEffect(() => {
    if(!id) {
      toast.error("id is required", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  
    if(id) {
      fetchUser(id);
    }
    
  },[id, fetchUser]);

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

  // Decides what to display in follow-unfollow-btn
  const if_follow_or_unfollow = () => {
    return data?.data?.user.followers?.includes(reduxUser._id) ? "Unfollow" : "Follow";
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
        console.log(error);
      }
      console.log(error)
      if(error.response.status === 400) {
        toast.success(error.response.data.msg, {
            position: toast.POSITION.TOP_RIGHT,
        });
        console.log(error);
      }
    }
  }

  const handleRecipeClick = (e, id) => {
    e.preventDefault();
    reduxLogRecipe({
      _id: id
    });
    navigate('/user/recipe');
  };
  
  return data?.data?.user ? (
    <div className="user">
       <div className="user-meta">
          <div className="name">
            {`${data?.data?.user.name.fname} ${data?.data?.user.name.lname}`}
          </div>
          <span>{`${data?.data?.user.followers?.length} Followers`}</span>
          <span>{`${data?.data?.user.following?.length} Following`}</span>
          <button type="button" className="follow-unfollow-btn" onClick={(e) => handleFollowUnfollow(e, data?.data?.user._id)}>
             {if_follow_or_unfollow()}
          </button>
       </div>
       <div className="recipes">
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
          {choice &&  data?.data?.user.recipes?.map((recipe, index) => {
              return <div key={index} className="recipe" onClick={(e) => handleRecipeClick(e, recipe._id)} >
                        <h3 className="recipe-name">
                            {`Name: ${recipe.name}`}
                        </h3>
                        <div className="recipe-type">
                            {`Type: ${recipe.type}`}
                        </div>
                        <div className="recipe-permit">
                            {`Permit: ${recipe.permit}`}
                        </div>
                        <div className="recipe-likes">
                            <FaHeart /> {recipe.fave_count}
                        </div>
                     </div>
            })
          }
          {!choice &&  data?.data?.user.faves?.map((recipe, index) => {
              return <div key={index} className="recipe" onClick={(e) => handleRecipeClick(e, recipe._id)} >
                        <h3 className="recipe-name">
                            {`Name: ${recipe.name}`}
                        </h3>
                        <div className="recipe-type">
                            {`Type: ${recipe.type}`}
                        </div>
                        <div className="recipe-permit">
                            {`Permit: ${recipe.permit}`}
                        </div>
                        <div className="recipe-likes">
                            <FaHeart /> {recipe.fave_count}
                        </div>
                     </div>
            })
          }
      </div>
    </div>
  ) : ''
}

const mapStateToProps = state => {
  return {
    reduxUser: state.user.user,
  };
}

const mapDispatchToProps = dispatch => {
  return {
    reduxLogRecipe: (recipe) => dispatch(logRecipe(recipe)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(User);
