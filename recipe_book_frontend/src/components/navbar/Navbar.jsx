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
    console.log(navRef.current);
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
    <header className="relative">
      <h1>Recipe Book</h1>
      {/* <nav ref={navRef}> */}
      {/* div component for nav links */}
      <div className="nav" ref={navRef}>
        <div
          //ternary operator to make the link active when you're on the page
          className={` `}
          to=""
          onClick={handleClick}
        >
          <a href="/">Home</a>
        </div>

        <div className={``} onClick={handleClick} to="">
          <a href="javascript:void(0)">Recipe</a>
        </div>
        <div className={``} onClick={handleClick} to="">
          <a href="javascript:void(0)">Favorite</a>
        </div>
        {auth && (
          <div className={``} to="" onClick={handleClick}>
            <a href="javascript:void(0)">Profile</a>
          </div>
        )}
      </div>
      <div className="nav">
        {!auth ? (
          <div className="membership">
            <div className={``} to="" onClick={handleClick}>
              <a href="javascript:void(0)">Sign In</a>
            </div>
            <button className="sign-up" onClick={handleClick}>
              <div className={``} to="">
                <a href="/signup"> Sign up </a>
              </div>
            </button>
          </div>
        ) : (
          <div className=" membership">
            <button className="logout" onClick={handleLogOut}>
              <div className={``} to="" onClick={handleClick}>
                Log out
              </div>
            </button>
            <span className="greeting">Hi, {name}</span>
          </div>
        )}
      </div>
      {/* button to close navbar on mobile */}
      {/* <button className="nav-btn nav-close-btn" onClick={showNavbar}>
          <FaTimes />
        </button> */}
      {/* </nav> */}
      {/* display greeting when authenticated */}
      {auth && <span className="greeting1">Hi, {name}</span>}

      {/* Hambuger button to open navbar menu */}
      <div className="hamburger-button " >
        <button className="nav-btn" onClick={showNavbar}>
          <FaBars />
        </button>
        {/* <div className="hamburger-details">
          <a href="javascript:void(0)">Home</a>
          <a href="javascript:void(0)">Recipe</a>
          <a href="javascript:void(0)">Favourite</a>
        </div> */}
      </div>
    </header>
  );
}

export default Navbar;
