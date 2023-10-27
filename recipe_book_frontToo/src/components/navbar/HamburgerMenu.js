import React, { useState } from 'react';
import './HamburgerMenu.css';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { signout } from "../../api_calls";
import { connect } from "react-redux";
import { logNot_Auth } from '../../Redux/User/userActions';
import { resetStore } from '../../Redux/reset/reset_action';
import { toast } from "react-toastify";

function HamburgerMenu({ reduxLogNotAuth, reduxResetStore }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const to_profile = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    navigate('/user/profile');
  };

  const handleLogOut = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    try {
      const res = await signout(); 
      if(res.status === 200) {
        toast.success(res.data.msg, {
            position: toast.POSITION.TOP_RIGHT,
        });
        localStorage.removeItem("Jwt");
        reduxResetStore();
        navigate('/');
      }

    } catch (error) {
      // handles token expiration, token blacklisted, token invalid, and token absent
      if(error.response?.data?.jwt) {
        toast.warning(error.response.data.jwt, {
          position: toast.POSITION.TOP_RIGHT,
        });
        localStorage.removeItem("Jwt");
        reduxResetStore();
        navigate('/');
      }

      if(error.response?.status === 500) {
        toast.success("Server Error", {
            position: toast.POSITION.TOP_RIGHT,
        });
        console.log(error);
      }
        
    }
    
    // {auth} && auth = false;
  };

  return (
    <div className="hamburger-menu" >
      <button onClick={toggleMenu} className="hamburger-icon">
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>
      {isOpen && (
        <div className="menu-items">
          <ul>
            <li>
                <button onClick={to_profile} className="profile-btn" type="button">
                    Profile
                </button>
            </li>   
            <li>
                <button onClick={handleLogOut} className="signout-btn" type="button">
                    SignOut
                </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    reduxLogNotAuth: (payload) => dispatch(logNot_Auth(payload)),
    reduxResetStore: () => dispatch(resetStore()),
  };
};

export default connect(null, mapDispatchToProps)(HamburgerMenu);
