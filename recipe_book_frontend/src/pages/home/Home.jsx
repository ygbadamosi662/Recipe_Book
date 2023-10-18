import React from "react";
import "./Home.css";
import Reviews from "../../components/reviews/Reviews";
import Recipe from "../recipe/Recipe";

const Home = () => {
  return (
    <div className="relative container home-container">
      <div className="hero-container">
        <div className="hero-img-container">
          <img
            className="hero-img"
            src="https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80"
            alt=""
          />
        </div>
        <div className="hero-story">
          <p>
            Welcome ipsum dolor sit amet, consectetur adipiscing elit. Donec
            vulputate iaculis ante, commodo rutrum arcu suscipit lobortis.
            Praesent leo nisl, convallis a mollis ac, facilisis eget purus.
            Praesent dapibus eleifend diam nec imperdiet. Integer et convallis
            velit, nec posuere libero. Donec non rutrum risus. In porttitor
            justo mi, sit amet imperdiet sapien venenatis vel. Donec viverra
            velit quis eros pulvinar, sed hendrerit mi suscipit.
            tellus faucibus libero, eu dictum arcu tortor vel velit. Vivamus sit
            amet ullamcorper quam.
            <br />
            Duis vulputate porta mauris ac consequat. Vivamus in aliquam mauris.
            Sed purus lorem, pulvinar sed neque et, volutpat condimentum mi.
            Vivamus efficitur sodales enim quis dapibus. Aenean nec consequat
            orci. Integer sodales elit at diam sollicitudin, nec blandit felis
            suscipit. Aenean imperdiet, velit sed vestibulum consequat, massa
            leo tristique est, et sodales lorem massa at ligula. Sed vehicula
            molestie nunc. Donec ac orci molestie sapien cursus tempus. Nulla
            facilisi. Vivamus accumsan erat at aliquet posuere.
          </p>
        </div>
      </div>
      <div>
      <Recipe />
      </div>
      <div>
        <Reviews />
      </div>
    </div>
  );
};

export default Home;
