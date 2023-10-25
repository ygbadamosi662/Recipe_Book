import { React, useState } from "react";
import "./Dashboard.css";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { Formik, Form } from "formik";
import Recipes from "../../components/recipes/Recipes";
import * as Yup from "yup";
import FormikControl from "../../FormikControl";


const Dashboard = ({ reduxUser }) => {

  const init_payload = {
    page: 1,
    size: 5
  };

  const [payload, setPayload] = useState(init_payload);

  const form_init_value = {
    name: "",
    ingredients: "",
    type: "",
  };

  const validationSchema = Yup.object({
    name: Yup
      .string(),
    type: Yup
      .string(),
    ingredients: Yup
      .string()
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

  const handleFilterSubmit = (values) => {
    if((values.name === "" ) && (values.ingredients === "") && (values.type === "")) {
      toast.warning("Filter is empty", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }

    // build query
    let query = {};
    if(values?.type !== "") {
      query.type = values.type?.toUpperCase();
    }

    if(values.ingredients !== "") {
      query.ingredients = values.ingredients.split(",");
    }

    if(values.name !== "") {
      query.name = values.name
    }

    query.page = 1;
    query.size = 5
    console.log(query)
    setPayload(query);
  }

  return (
    <div className="relative container home-container">
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
        <Recipes payload={payload} command="user_recipes"/>
      </div>
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
