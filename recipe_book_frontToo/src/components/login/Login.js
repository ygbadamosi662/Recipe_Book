import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikControl from "../../FormikControl";
import { setToken } from "../../appAuth";
import { setAuthHeader } from "../../appAxios";
import { useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { logUser } from "../../Redux/User/userActions";
import { toast } from "react-toastify";
import { login } from "../../api_calls";
import "./Login.css";

function Login(props) {
  const {reduxLogUser} = props;

  const navigate = useNavigate();

  const initVal = {
    email_or_phone: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email_or_phone: Yup
      .string()
      .required(),
    password: Yup
      .string()
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/)
      .required("Required"),
  });

  const onSubmit = async (values) => {
    const { email_or_phone, password } = values;
    const user = {
      email_or_phone: email_or_phone,
      password: password,
    };
    
    try {
      const res = await login(user);
      setToken(res.data.token);
      setAuthHeader()
      reduxLogUser(res.data.user);
      navigate('/user/dash');
    } catch (error) {
      if(error.response) {
        console.log(error.response.data.msg)
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
      onSubmit={onSubmit}
      initialValues={initVal}
      validationSchema={validationSchema}
    >
      {(formik) => (
        <Form className="login-form">
          <FormikControl
            control="input"
            type="text"
            label="Email/Phone"
            name="email_or_phone"
          />

          <FormikControl
            control="input"
            type="password"
            label="Password"
            name="password"
          />

          <button
            type="submit"
            disabled={!formik.isValid || formik.isSubmitting}
          >
            Login
          </button>
        </Form>
      )}
    </Formik>
  );
}

const mapStateToProps = state => {
  return {
    reduxUser: state.user.user
  }
}

const mapDispatchToProps = dispatch => {
  return {
    reduxLogUser: (user) => dispatch(logUser(user))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
