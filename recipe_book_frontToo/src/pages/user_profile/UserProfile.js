import React, { useEffect, useState } from 'react';
import { connect } from "react-redux";
import { logUser } from "../../Redux/User/userActions";
import { toast } from "react-toastify";
import { updateUser } from '../../api_calls';
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikControl from "../../FormikControl";

function UserProfile({reduxUser, reduxLogUser}) {
  const [showPasswordField, setShowPasswordField] = useState(false);

  // Set up the values for tracking changes in email, phone and change_pwd field of the form
  const [emailChanged, setEmailChanged] = useState(false);
  const [phoneChanged, setPhoneChanged] = useState(false);
  const [change_pwdChanged, setChange_pwdChanged] = useState(false);


  // Listen for changes in specific fields and update the showPasswordField state
  useEffect(() => {
    if (emailChanged || phoneChanged || change_pwdChanged) {
      setShowPasswordField(true);
    } else {
      setShowPasswordField(false);
    }
  }, [emailChanged, phoneChanged, change_pwdChanged, reduxUser._id, reduxLogUser]);

  const initVal = {
    fname: reduxUser.name.fname,
    lname: reduxUser.name.lname,
    email: reduxUser.email,
    phone: reduxUser.phone,
    change_pwd: "",
    cpass: "",
    password: ""
  };

  const validationSchema = Yup.object({
    fname: Yup
      .string(),
    lname: Yup
      .string(),
    email: Yup
      .string()
      .email('Email not valid!'),
    phone: Yup
      .string()
      .matches(/^[8792][01]\d{8}$/, "not a valid number"),
    change_pwd: Yup
      .string()
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/, "Password must have atleast one lowercase letter, one uppercase letter, one digit, one special chararcters and a minimum lenght of 8 chararcters"),
    cpass: Yup.string()
      .oneOf([Yup.ref('change_pwd')], 'password must match'),
    password: Yup
      .string()
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/, "Password must have atleast one lowercase letter, one uppercase letter, one digit, one special chararcters and a minimum lenght of 8 chararcters")
      .required("Password is required if you are changing email, phone or password"),
  });

  const handleSubmit = async (values) => {
    const { fname, lname, email, phone, change_pwd, password} = values;
    let query = {};
    // building query
    if(fname) {
        query.fname = fname;
    }
    if(lname) {
        query.lname = lname;
    }
    if(email && (email !== initVal.email)) {
        query.email = {
        new_email: email,
        password: password,
      };
    }
    if(phone && (phone !== initVal.phone)) {
      query.phone = {
        new_phone: phone,
        password: password,
      };
    }
    if(change_pwd) {
      query.password = {
        new_password: change_pwd,
        old_password: password,
      };
    }

    try {
      if(query) {
        const res = await updateUser(JSON.stringify(query));
        if(res.status === 201) {
          reduxLogUser(res.data.user);
          toast.success("Profile successfully updated", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
      }
    } catch (error) {
      if(error.response) {
          if(error.response.status === 400) {
            toast.error(`${error.response.data.msg}`, {
              position: toast.POSITION.TOP_RIGHT,
            });
            return;
          }
          if(error.response.status >= 500) {
            // Handle network errors or display an error message to the user
            toast.error("Server error", {
              position: toast.POSITION.TOP_RIGHT,
            });
          }
      }
    }
  };

  return (
    <Formik
      onSubmit={handleSubmit}
      initialValues={initVal}
      validationSchema={validationSchema}
    >
      {(formik) => (
        <Form className="update-user-form">
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
            onChange={(event) => {
              event.preventDefault();
              formik.setFieldValue("email", event.target.value);
              setEmailChanged(true);
            }}
          />

          <FormikControl
            control="input"
            type="text"
            label="Phone Number"
            name="phone"
            onChange={(event) => {
              event.preventDefault();
              formik.setFieldValue("phone", event.target.value);
              setPhoneChanged(true);
            }}
          />

          <div className="change-pwd">
            <FormikControl
              control="input"
              type="password"
              label="Change Password"
              name="change_pwd"
              onChange={(event) => {
                event.preventDefault();
                formik.setFieldValue("change_pwd", event.target.value);
                setChange_pwdChanged(true)
              }}
            />

            <FormikControl
              control="input"
              type="password"
              label="Confirm Password"
              name="cpass"
            />
          </div>
          {showPasswordField && (
            <FormikControl
            control="input"
            type="password"
            label="Provide your password to authenticate sensitive changes"
            name="password"
            />
          )}
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="submit-btn"
          >
            Save Changes
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

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);