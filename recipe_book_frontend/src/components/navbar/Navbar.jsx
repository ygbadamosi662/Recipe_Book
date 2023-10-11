import { useRef } from "react";

import { FaBars, FaTimes } from "react-icons/fa"; // imported icons from react-icons
import "./Navbar.css";
// import { div } from "react-router-dom"; // import the 'div' component from the React Router library.

//Navbar Component
function Navbar() {
  const navRef = useRef();

  //checks user authentication
  const auth = localStorage.getItem("Auth") ? true : false;

  // ShowNavbar toggles the visibility of the navbar
  const showNavbar = () => {
    navRef.current.classList.toggle("responsive_nav");
  };

  const handleClick = () => {
    showNavbar(false);
  };
  // removes the 'Auth' when user id logged out
  const handleLogOut = () => {
    localStorage.removeItem("Auth");
    // {auth} && auth = false;
  };

  //used to display greetings on the navbar when user logged in
  const name = "Omolara";
  return (
    <header>
      <h1>Recipe Book</h1>
      <nav ref={navRef}>
        {/* div component for nav links */}
        <div
          //ternary operator to make the link active when you're on the page
          className={({ isActive }) => (isActive ? "active" : "")}
          to=""
          onClick={handleClick}>Home</div>

        <div
          className={({ isActive }) => (isActive ? "active" : "")}
          onClick={handleClick}
          to="">
          Recipe
        </div>
        <div
          className={({ isActive }) => (isActive ? "active" : "")}
          onClick={handleClick} to=""> 
          Favorite
        </div>
        {!auth && (
          <>
            <div
              className={({ isActive }) => (isActive ? "active" : "")}
              to=""
              onClick={handleClick}
            >
              Sign In
            </div>
            <button className="sign-up" onClick={handleClick}>
              <div
                className={({ isActive }) => (isActive ? "active" : "")}
                to=""
              >
                Sign up
              </div>
            </button>
          </>
        )}
        {/* display  apointment, logout and greeting when authenticated (logged in) & login and sign out when (logged out) */}
        {auth && (
          <>
            <div
              className={({ isActive }) => (isActive ? "active" : "")}
              to=""
              onClick={handleClick}
            >
              Profile
            </div>
            <button className="logout" onClick={handleLogOut}>
              <div
                className={({ isActive }) => (isActive ? "active" : "")}
                to=""
                onClick={handleClick}
              >
                Log out
              </div>
            </button>
          </>
        )}
        {auth && <span className="greeting">Hi, {name}</span>}
        {/* button to close navbar on mobile */}
        <button className="nav-btn nav-close-btn" onClick={showNavbar}>
          <FaTimes />
        </button>
      </nav>
      {/* display greeting when authenticated */}
      {auth && <span className="greeting1">Hi, {name}</span>}

      {/* Hambuger button to open navbar menu */}
      <button className="nav-btn" onClick={showNavbar}>
        <FaBars />
      </button>
    </header>
  );
}

export default Navbar;
