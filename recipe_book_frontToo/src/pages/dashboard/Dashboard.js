import { React, useState } from "react";
import "./Dashboard.css";
import { connect } from "react-redux";
// import Recipes from "../../components/recipes/Recipes";
import Recipe from "../../components/recipe/Recipe";
// import Reviews from "../../components/reviews/Reviews";
// import Notifications from "../../components/notifications/Notifications";



const Dashboard = ({ reduxUser }) => {
  // const filter = {
  //   count: false,
  //   status: "RECEIVED",
  //   page: 1,
  //   size: 20,
  // };

  const [flag, setFlag] = useState(false);
  // const submit = { ...filter.filter, page: 1, size: 10 };

  const handleClick = () => {
    console.log('hey');
    setFlag(true);
  };

  return (
    <div className="relative container home-container">
      Welcome here {reduxUser.id}
      <button type="button" >GET RECIPES</button>
      <button type="button" >GET REVIEWS</button>
      <button type="button" onClick={handleClick}>GET RECIPE</button>
      <button type="button" >GET NOTES</button>

      {flag && (
        <Recipe id="65341119db330d940b9697b0" />
      )}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    // gets user from store
    reduxUser: state.user.user, 
  }
};

export default connect(mapStateToProps, null)(Dashboard);
