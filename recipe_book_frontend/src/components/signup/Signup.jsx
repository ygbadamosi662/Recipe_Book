import React, { useState } from "react";
import "./Signup.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const defaultFormData = {
    fname: "",
    lname: "",
    email: "",
    password: "",
    cpassword: "",
    phone: "",
  };
  const [formData, setFormData] = useState(defaultFormData);
  const [error, setError] = useState({
    first: false,
    last: false,
    mail: false,
    pass: false,
    match: false,
    number: false,
  });

  const navigate = useNavigate();

  const { fname, lname, email, password, cpassword, phone } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    const data = { fname, lname, email, password, phone };

    let valid = signup();

    

    if (valid) {
      try {
        // fetch API
        const response = await fetch("/api/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        if (response.status === 200) {
          setFormData(defaultFormData); // Clear the form fields.
          navigate("/login"); // Redirect to the login page to signup
        } else if (response === 400) {
          // Handle validation errors from the server
          const errorData = await response.json();
          toast.error(errorData.message, {
            position: toast.POSITION.TOP_RIGHT,
          });
        } else {
          toast.error("An unexpected error occurred", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
      } catch (error) {
        // Handle network errors or display an error message to the user
        toast.error("Network error. Please try again later.", {
          position: toast.POSITION.TOP_RIGHT,
        });
        console.error("Error:", error);
      }
    }
  };

  const signup = () => {
    const nameRegex = /^[a-zA-Z]{3,15}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const phoneRegex =
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{5,7}$/;

    if (!nameRegex.test(fname)) {
      // The string does not match the regex pattern
      console.log("Invalid name ");
      setError((err) => ({ ...err, first: true }));

      return false;
    } else {
      setError((err) => ({ ...err, first: false }));
    }

    if (!nameRegex.test(lname)) {
      // The string does not match the regex pattern
      console.log("Invalid password");
      setError((err) => ({ ...err, last: true }));
      return false;
    } else {
      setError((err) => ({ ...err, last: false }));
    }

    if (!passwordRegex.test(password)) {
      // The string does not match the regex pattern
      console.log("Invalid password");
      setError((err) => ({ ...err, pass: true }));
      return false;
    } else {
      setError((err) => ({ ...err, pass: false }));
    }

    if (cpassword !== password) {
      // The string does not match the regex pattern
      setError((err) => ({ ...err, match: true }));
      return false;
    } else {
      setError((err) => ({ ...err, match: false }));
    }

    if (!emailRegex.test(email)) {
      // The string does not match the regex pattern
      setError((err) => ({ ...err, mail: true }));
      return false;
    } else {
      setError((err) => ({ ...err, mail: false }));
    }

    if (!phoneRegex.test(phone)) {
      // The string does not match the regex pattern
      console.log("Invalid phone number");
      setError((err) => ({ ...err, number: true }));
      return false;
    } else {
      setError((err) => ({ ...err, number: false }));
    }

    return true;
  };

  return (
    <>
      <ToastContainer autoClose={2000} />
      <div className="signUp-container">
        <div className="signUp">
          <h2>Sign Up</h2>
          <form onSubmit={handleSignUp}>
            <input
              type="text"
              name="fname"
              placeholder="First name"
              value={fname}
              onChange={(e) => handleChange(e)}
              required
            />
            {error.first && (
              <span className="error-message">
                <small>Invalid first name</small>
              </span>
            )}
            <input
              type="text"
              name="lname"
              placeholder="Last name"
              value={lname}
              onChange={(e) => handleChange(e)}
              required
            />
            {error.last && (
              <span className="error-message">
                <small>Invalid last name</small>
              </span>
            )}
            <input
              type="email"
              name="email"
              placeholder="email@example.com"
              // pattern="\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b"
              value={email}
              onChange={(e) => handleChange(e)}
              required
            />
            {error.mail && (
              <span className="error-message">
                <small>Invalid email</small>
              </span>
            )}
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => handleChange(e)}
              required
            />
            {error.pass && (
              <span className="error-message">
                <small>Invalid password</small>
                <small>
                  password should contain at least:
                  <br /> 1 uppercase and 1 lowercase letter, <br />1 number and
                  1 special character.
                </small>
              </span>
            )}
            <input
              type="password"
              name="cpassword"
              placeholder="Confirm password"
              value={cpassword}
              onChange={(e) => handleChange(e)}
              required
            />
            {error.match && (
              <span className="error-message">
                <small>Passwords do not match</small>
              </span>
            )}
            <input
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => handleChange(e)}
              required
            />
            {error.number && (
              <span className="error-message">
                <small>Invalid phone number</small>
              </span>
            )}
            <button type="submit">Sign Up</button>
          </form>
          <p className="alternative">
            Have an account? <a href="/login">Login</a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Signup;
