import React from "react";
import { useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikControl from "../../FormikControl";
import { useMutation } from "react-query";
import { setToken } from "../../appAuth";
import { setAuthHeader } from "../../appAxios";
import { useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { logUser } from "../../Redux/User/userActions";
import { login } from "../../api_calls";
import "./Login.css";

function Login(props) {
  const {reduxLogUser} = props;

  const {
    mutate: LogIn,
    isLoading,
    isError,
    error,
    data,
  } = useMutation(login);

  const navigate = useNavigate();

  // const toHome = () => {
  //   navigate('/home');
  // }

  useEffect(() => {
    if (data?.status === 200) {
      setToken(data?.data.token);
      setAuthHeader()
      reduxLogUser(data?.data.user);
      navigate('/user/dash');
    }
  });

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

  const onSubmit = (values) => {
    const { email_or_phone, password } = values;
    const user = {
      email_or_phone: email_or_phone,
      password: password,
    };

    LogIn(user);
  };

  if(isLoading)
  {
    return <h2>Loading...</h2>
  }

  if(isError)
  {
    console.log(error)
  }

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
          {/* <h2>{head}</h2> */}
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

const mapDispatchToProps = dispatch => {
  return {
    reduxLogUser: (user) => dispatch(logUser(user))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
