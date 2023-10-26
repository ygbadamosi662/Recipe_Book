import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { Formik, Form } from "formik";
import { getFollowersOrFollowing } from "../../api_calls";
import Recipes from "../../components/recipes/Recipes";
import FullHouse from "../../components/followers_following/FullHouse";
import * as Yup from "yup";
import FormikControl from "../../FormikControl";

const Dashboard = ({ reduxUser }) => {
  const [showFullHouse, setShowFullHouse] = useState(false);
  const [ffCount, setFfCount] = useState({
    followers: 0,
    following: 0,
  });

  const init_payload = {
    page: 1,
    size: 5,
  };

  const [payload, setPayload] = useState(init_payload);

  const form_init_value = {
    name: "",
    ingredients: "",
    type: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string(),
    type: Yup.string(),
    ingredients: Yup.string(),
    // .test({
    //   name: 'ingridient-validation',
    //   message: '',
    //   test: (value) => {
    //       if(value) {
    //         return value.split(",").length < 1;
    //       }
    //       return false;
    //     },
    // }),
  });

  useEffect(() => {
    const fetchFf = async () => {
      try {
        const gather_task = Promise.all([
          getFollowersOrFollowing({
            count: true,
            id: reduxUser._id,
            which: "followers",
          }),
          getFollowersOrFollowing({
            count: true,
            id: reduxUser._id,
            which: "following",
          }),
        ]);
        const res = await gather_task;
        if (res[0].status === 200 && res[1].status === 200) {
          setFfCount({
            followers: res[0].data.count,
            following: res[1].data.count,
          });
        }
      } catch (error) {
        if (error.response) {
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
    fetchFf();
  }, [reduxUser._id]);

  const handleFilterSubmit = (values) => {
    if (values.name === "" && values.ingredients === "" && values.type === "") {
      toast.warning("Filter is empty", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }

    // build query
    let query = {};
    if (values?.type !== "") {
      query.type = values.type?.toUpperCase();
    }

    if (values.ingredients !== "") {
      query.ingredients = values.ingredients.split(",");
    }

    if (values.name !== "") {
      query.name = values.name;
    }

    query.page = 1;
    query.size = 5;
    console.log(query);
    setPayload(query);
  };

  const handleFollowers_following_btn = (e) => {
    e.preventDefault();
    setShowFullHouse(true);
  };

  const handleBackToDashClick = (e) => {
    e.preventDefault();
    setShowFullHouse(false);
  };

  return (
    <div className="relative container home-container">
<<<<<<< HEAD
      { !showFullHouse && (
          <button type="button" className="followers-following-btn" onClick={(e) => handleFollowers_following_btn(e)}>
            <span>{`Followers(${ffCount.followers})`}</span>/
            <span>{`Following(${ffCount.following})`}</span>
          </button>
        )
      }
      { !showFullHouse && (
          <div className="filter">
            <Formik 
            onSubmit={handleFilterSubmit}
            initialValues={form_init_value}
            validationSchema={validationSchema}
            >
              {(formik) => (
                <Form className="filter-form" >
                  <FormikControl
                    control="input"
                    type="text"
                    label="Recipe Name"
                    name="name"
                  />
    
                  <FormikControl
                    control="input"
                    type="text"
                    label="Type"
                    name="type"
                  />
    
                  <FormikControl
                    control="input"
                    type="text"
                    label="Ingredients"
                    name="ingredients"
                  />
    
                  <button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="submit-btn"
                  >
                    Search
                  </button>
                </Form>
              )}
            </Formik>
            <Recipes payload={payload} command="user_recipes"/>
          </div>
        )
      }
      { showFullHouse && (
          <div className="fullhouse">
            <button type="button" className="dash-bk-btn" onClick={(e) => handleBackToDashClick(e)}>Go back to Dash</button>
            <FullHouse id={reduxUser._id}/>
          </div>
        )
      }
=======
      {!showFullHouse && (
        <button
          type="button"
          className="followers-following-btn"
          onClick={(e) => handleFollowers_following_btn(e)}
        >
          <span>{`Followers(${ffCount.followers})`}</span>/
          <span>{`Following(${ffCount.following})`}</span>
        </button>
      )}
      {!showFullHouse && (
        <div className="Filter">
          <h3>Search By: </h3>
          <Formik
            onSubmit={handleFilterSubmit}
            initialValues={form_init_value}
            validationSchema={validationSchema}
          >
            {(formik) => (
              <Form className="recipe-form">
                <FormikControl
                  control="input"
                  type="text"
                  label="Recipe Name"
                  name="name"
                />

                <FormikControl
                  control="input"
                  type="text"
                  label="Type"
                  name="type"
                />

                <FormikControl
                  control="input"
                  type="text"
                  label="Ingredients, seperated by a ',' comma"
                  name="ingredients"
                />

                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="submit-btn"
                >
                  Search
                </button>
              </Form>
            )}
          </Formik>
          <Recipes payload={payload} command="user_recipes" />
        </div>
      )}
      {showFullHouse && (
        <div className="fullhouse">
          <button
            type="button"
            className="dash-bk-btn"
            onClick={(e) => handleBackToDashClick(e)}
          >
            Go back to Dash
          </button>
          <FullHouse id={reduxUser._id} />
        </div>
      )}
>>>>>>> e9761dfdfb03a15efe66a5b285ad85a6fcb469e7
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    // gets user from store
    reduxUser: state.user.user,
  };
};

export default connect(mapStateToProps, null)(Dashboard);
