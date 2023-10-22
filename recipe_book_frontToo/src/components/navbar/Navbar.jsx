import React from "react";
import { useEffect, useState } from "react";
import { FaBell } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import HamburgerMenu from "./HamburgerMenu";
import { getMyNotifications } from "../../api_calls";
import { toast } from "react-toastify";
import "./Navbar.css";


//Navbar Component
function Navbar() {
//   const navRef = useRef();
  //checks user authentication
  const auth = localStorage.getItem("Jwt") ? true : false;
  const navigate = useNavigate();

  const [noteCount, setNoteCount] = useState(0);

  useEffect(() => {
    if(auth) {
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
          if (error.response && error.response.status >= 500) {
            toast.error('Server Error', {
              position: toast.POSITION.TOP_RIGHT,
            });
          }
      });
    }
  }, [auth]);

  const take_home_page = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    navigate('/user/dash');
  }

  const to_create_recipe_page = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    navigate('/user/create/recipe');
  }

  return (
    <header className="nav">
      {auth ? (
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
                <FaBell className="notification-badge"></FaBell>
                <span>{noteCount}</span>
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

export default Navbar;
