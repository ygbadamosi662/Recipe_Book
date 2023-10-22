import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikControl from "../../FormikControl";
import { connect } from "react-redux";
import { logUser } from "../../Redux/User/userActions";
import { register } from "../../api_calls";
import { toast } from "react-toastify";
import "./Signup.css";


function Signup(props) {
  const {reduxLogUser, goL, reduxUser} = props;
  
  // Formik initial values
  let initVal = {};
  
  // if redux user exists
  if(reduxUser) {
    initVal = reduxUser;
  } else {
    initVal = {
      fname: "",
      lname: "",
      email: "",
      phone: "",
      password: "",
      cpass: "",
    };
  }

  const validationSchema = Yup.object({
    fname: Yup
      .string()
      .required("Required"),
    lname: Yup
      .string()
      .required("Required"),
    email: Yup
      .string()
      .email('Email not valid!')
      .required("Required"),
    password: Yup
      .string()
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/)
      .required("Required"),
      cpass: Yup.string()
      .oneOf([Yup.ref('password')], 'password must match')
      .required('Required'),
    phone: Yup
      .string()
      .matches(/^[8792][01]\d{8}$/)
      .required('Required'),
  });

  // handles form submission
  const onSubmit = async (values) => {
    const {fname, lname, email, password, phone} = values
    const user = {
      'fname': fname,
      'lname': lname,
      'email': email,
      'password': password,
      'phone': phone
    }
    
    try {
      const res = await register(user);
      reduxLogUser(res.data.user);
      goL();
    } catch (error) {
      if(error.response) {
        if(error.response.status === 400) {
          toast.error(`${error.response.data.msg}: Sign in instead?`, {
            position: toast.POSITION.TOP_RIGHT,
          });
          return;
        }
      }
      // Handle network errors or display an error message to the user
      toast.error("Network error. Please try again later.", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  }

  return (
    <Formik
      onSubmit={onSubmit}
      initialValues={initVal}
      validationSchema={validationSchema}
    >
      {(formik) => (
        <Form className="signup-form">
          <FormikControl
            control="input"
            type="text"
            label="Firstname"
            name="fname"
          />

          <FormikControl
            control="input"
            type="text"
            label="Lastname"
            name="lname"
          />

          <FormikControl
            control="input"
            type="email"
            label="Email"
            name="email"
          />

          <FormikControl
            control="input"
            type="text"
            label="Phone Number"
            name="phone"
          />

          <FormikControl
            control="input"
            type="password"
            label="Password"
            name="password"
          />

          <FormikControl
            control="input"
            type="password"
            label="Confirm Password"
            name="cpass"
          />

          <button
            type="submit"
            disabled={formik.isSubmitting}
          >
            Register
          </button>
          
        </Form>
      )}
    </Formik>
  );
}

const mapStateToProps = state => {
  return {
    // gets user email if set
    reduxUser: state.user.user
  }
}
// sets user email to redux
const mapDispatchToProps = dispatch => {
  return {
    reduxLogUser: (user) => dispatch(logUser(user))
  }
}

// hook up our component with our redux store
export default connect(mapStateToProps, mapDispatchToProps)(Signup);
