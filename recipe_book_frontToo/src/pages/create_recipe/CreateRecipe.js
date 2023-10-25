import React from "react";
import { connect } from "react-redux";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikControl from "../../FormikControl";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createRecipe } from "../../api_calls";
import { logRecipe } from "../../Redux/Recipe/recipeActions";
import "./CreateRecipe.css";

const styles = {
  //   style form here
  form: {
    display: "grid",
    borderRadius: "0.5rem",
    color: "white",
  },
};
function CreateRecipe({ reduxLogRecipe }) {
  const navigate = useNavigate();

  const permit = [
    { key: "Access", value: "" },
    { key: "PUBLIC", value: "PUBLIC" },
    { key: "PRIVATE", value: "PRIVATE" },
  ];

  const form_init_value = {
    name: "",
    ingredients: "",
    guide: "",
    description: "",
    type: "",
    permit: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string().required(),
    type: Yup.string().required("Required"),
    guide: Yup.string()
      .test(
        "min-words",
        "Preparation should be longer, unless you want ppl to cook rubbish",
        (value) => {
          if (!value) return true; // If the field is empty, no validation needed
          const wordCount = value
            .split(/\s+/)
            .filter((word) => word.trim() !== "").length;
          return wordCount >= 5;
        }
      )
      .required("Required"),
    description: Yup.string().required("Required"),
    permit: Yup.string().oneOf(["PUBLIC", "PRIVATE"]).required("Required"),
    ingredients: Yup.string().test({
      name: "ingridient-validation",
      message: "too few ingredients",
      test: (value) => {
        if (value) {
          return value.split(",").length > 1;
        }
        return false;
      },
    }),
  });

  const handleSubmit = async (values) => {
    const { name, ingredients, description, type, permit, guide } = values;
    const recipe = {
      name: name,
      type: type.toUpperCase(),
      description: description,
      permit: permit,
      ingredients: ingredients.split(","),
    };

    try {
      const res = await createRecipe(JSON.stringify(recipe));
      if (res.status === 201) {
        toast.success(res.data.msg, {
          position: toast.POSITION.TOP_RIGHT,
        });
        reduxLogRecipe(res.data.recipe);
        navigate("/user/dash");
      }
    } catch (error) {
      if (error.response) {
        console.log(error.response.data.msg);
        toast.error(error.response.data.msg, {
          position: toast.POSITION.TOP_RIGHT,
        });
        return;
      }
      // Handle network errors or display an error message to the user
      toast.error("Network error. Please try again later.", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  return (
    <Formik
      onSubmit={handleSubmit}
      initialValues={form_init_value}
      validationSchema={validationSchema}
    >
      {(formik) => (
        <Form className="recipe-form" style={styles.form}>
          <FormikControl
            control="input"
            type="text"
            label="Recipe Name"
            name="name"
            className="input"
          />

          <FormikControl
            control="input"
            type="text"
            label="Describe Recipe"
            name="description"
            className="input"
          />

          <FormikControl
            control="input"
            type="text"
            label="Type"
            name="type"
            className="input"
          />

          <FormikControl
            control="input"
            type="text"
            label="Ingredients, seperated by a ',' comma"
            name="ingredients"
            className="input"
          />

          <FormikControl
            control="text-area"
            label="Preparation"
            name="guide"
            className="input-pre"
          />

          <FormikControl
            control="select"
            options={permit}
            label="Access"
            name="permit"
            className="input"
          />

          <button
            type="submit"
            disabled={!formik.isValid || formik.isSubmitting}
            className="submit-btn"
          >
            Create
          </button>
        </Form>
      )}
    </Formik>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    reduxLogRecipe: (rec) => dispatch(logRecipe(rec)),
  };
};

export default connect(null, mapDispatchToProps)(CreateRecipe);
