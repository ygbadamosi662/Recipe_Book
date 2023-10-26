import React from "react";
import { connect } from "react-redux";
import { logRecipe } from "../../Redux/Recipe/recipeActions";
import { toast } from "react-toastify";
import { updateRecipe } from "../../api_calls";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikControl from "../../FormikControl";

function UpdateRecipe({ reduxRecipe, reduxLogRecipe }) {
  const which_permit = () => {
    if (reduxRecipe.permit === "PRIVATE") {
      return "PUBLIC";
    }
    if (reduxRecipe.permit === "PUBLIC") {
      return "PRIVATE";
    }
  };

  const init_permit = which_permit();
  const permit = [
    {
      key: reduxRecipe.permit,
      value: reduxRecipe.permit,
    },
    {
      key: init_permit,
      value: init_permit,
    },
  ];

  const form_init_value = {
    name: reduxRecipe.name,
    ingredients: reduxRecipe.ingredients.join(","),
    description: reduxRecipe.description,
    type: reduxRecipe.type,
    permit: reduxRecipe.permit,
    guide: reduxRecipe.guide,
  };

  const validationSchema = Yup.object({
    name: Yup.string(),
    type: Yup.string(),
    description: Yup.string(),
    permit: Yup.string().oneOf(["PUBLIC", "PRIVATE"]),
    guide: Yup.string()
      .test(
        "min-words",
        "Preparation should be longer, unless you want ppl to cook rubbish",
        (value) => {
          if (!value) return true; // If the field is empty, no validation needed
          const wordCount = value
            .split(/\s+/)
            .filter((word) => word.trim() !== "").length;
          return wordCount >= 50;
        }
      )
      .required("Required"),
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
    try {
      // if no changes made
      values.type.toUpperCase();
      if (values === form_init_value) {
        toast.success("No changes made", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return;
      }

      const { name, ingredients, description, type, permit, guide } = values;

      // build query
      let query = {};
      query.id = reduxRecipe._id;
      if (name) {
        query.name = name;
      }
      if (type) {
        query.type = type;
      }
      if (description) {
        query.description = description;
      }
      if (guide) {
        query.guide = guide;
      }
      if (permit) {
        query.permit = permit;
      }
      if (ingredients) {
        query.ingredients = ingredients.split(",");
      }
      const res = await updateRecipe(JSON.stringify(query));
      if (res.status === 201) {
        toast.success(res.data.msg, {
          position: toast.POSITION.TOP_RIGHT,
        });
        reduxLogRecipe(res.data.recipe);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          toast.error(error.response.data.msg, {
            position: toast.POSITION.TOP_RIGHT,
          });
          return;
        }
        // Handle network errors or display an error message to the user
        toast.error("Network error. Please try again later.", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return;
      }
      console.log(error);
    }
  };

  return (
    <Formik
      onSubmit={handleSubmit}
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
            className="form-control"
          />

          <FormikControl
            control="input"
            type="text"
            label="Recipe Description"
            name="description"
            className="form-control"
          />

          <FormikControl
            control="input"
            type="text"
            label="Type"
            name="type"
            className="form-control"
          />

          <FormikControl
            control="input"
            type="text"
            label="Ingredients, seperated by a ',' comma"
            name="ingredients"
            className="form-control"
          />

          <FormikControl
            control="text-area"
            label="Preparation"
            name="guide"
            className="text-area"
          />

          <FormikControl
            control="select"
            options={permit}
            label="Access"
            name="permit"
            className="form-control"
          />

          <button
            type="submit"
            disabled={!formik.isValid || formik.isSubmitting}
            className="submit-btn"
          >
            Save Changes
          </button>
        </Form>
      )}
    </Formik>
  );
}

const mapStateToProps = (state) => {
  return {
    reduxRecipe: state.recipe.recipe,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    reduxLogRecipe: (rec) => dispatch(logRecipe(rec)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UpdateRecipe);
