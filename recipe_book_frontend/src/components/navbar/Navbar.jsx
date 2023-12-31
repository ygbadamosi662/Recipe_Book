import React from "react";
import { useEffect, useState } from "react";
import { FaBell } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import HamburgerMenu from "./HamburgerMenu";
import { getMyNotifications } from "../../api_calls";
import { useDispatch } from "react-redux";
import { resetStore } from "../../Redux/reset/reset_action";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import "./Navbar.css";

//Navbar Component
function Navbar({ reduxUserNotAuth }) {
  const dispatch = useDispatch();

  const auth = localStorage.getItem("Jwt") ? true : false;
  
  const navigate = useNavigate();

  const [noteCount, setNoteCount] = useState(0);

  useEffect(() => {
    if(reduxUserNotAuth === false) {
      const filter = {
        count: true,
        status: "not read",
      };
      getMyNotifications(JSON.stringify(filter))
        .then((response) => {
          if (response.status === 200) {
            setNoteCount(response.data.count);
          }
        })
        .catch((error) => {
          // handles token expiration, token blacklisted, token invalid, and token absent
          if(error.response?.data?.jwt) {
            toast.warning(error.response.data.jwt, {
              position: toast.POSITION.TOP_RIGHT,
            });
            localStorage.removeItem("Jwt");
            dispatch(resetStore);
            navigate('/');
          }
          if (error.response && error.response.status >= 500) {
            toast.error('Server Error', {
              position: toast.POSITION.TOP_RIGHT,
            });
          }
      });
    }
    if(reduxUserNotAuth) {
      // navigate bk to come_with_us page
      navigate('/');
    }
  }, [auth, reduxUserNotAuth, navigate, dispatch]);

  const take_home_page = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    navigate('/user/dash');
  }

  const to_create_recipe_page = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    navigate('/user/create/recipe');
  }

  const handleNotesClick = (e) => {
    e.preventDefault(); // Prevent the default form submission
    navigate('/user/notes');
  }

  return (
    <header className="nav">
      {(auth && (reduxUserNotAuth === false)) ? (
          <div className="auth">
            <div className="home">
              <button className="home-btn" onClick={take_home_page} type="button">
                HOME
              </button>
            </div>
            <div className="create-note-ham">
              <button className="create-recipe-btn" onClick={to_create_recipe_page} type="button">
                CREATE RECIPE
              </button>
              <div className="note-div">
                <button type="button" className="notification-btn" onClick={handleNotesClick}>
                  <FaBell className="notification-badge"></FaBell>
                  <span>{noteCount}</span>
                </button>
              </div>
              <HamburgerMenu />
            </div>
          </div>
          
        ) : (
          <div className="no-auth">
            <h1>Recipe Book</h1>
          </div>
      )}
    </header>
  );
}

const mapStateToProps = state => {
  return {
    reduxUserNotAuth: state.user.not_auth
  }
}

export default connect(mapStateToProps, null)(Navbar);
