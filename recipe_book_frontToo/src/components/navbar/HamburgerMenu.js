import React, { useState } from 'react';
import './HamburgerMenu.css';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { signout } from "../../api_calls";
import { toast } from "react-toastify";

function HamburgerMenu() {
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
      const sign_out_pr = signout();
      localStorage.removeItem("Jwt");
      const res = await sign_out_pr; 
      if(res.data.status === 200) {
        toast.success(`${res.data.msg} and ${res.data.token} blacklisted`, {
            position: toast.POSITION.TOP_RIGHT,
        });
      }

      navigate('/');

    } catch (error) {
      if(error.response.status === 500) {
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

export default HamburgerMenu;
