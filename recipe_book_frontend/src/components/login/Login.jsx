import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { setToken } from "../../appAuth";
import { ToastContainer, toast } from "react-toastify";

function Login() {
  const defaultFormData = {
    email: "",
    password: "",
  };
  const [formData, setFormData] = useState(defaultFormData);
  const [error, setError] = useState({
    mail: false,
    pass: false,
  });

  const navigate = useNavigate();

  const { email, password } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    const data = {
      email,
      password,
    };

    let isValid = login();

    if (isValid) {
      try {
        // fetch API
        const response = await fetch("/api/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        if (response.ok) {
          setFormData(defaultFormData);
          const result = await response.json();
          const token = result.token;
          if (token) {
            setToken(token);
            navigate("/login"); // Redirect to the login page to signup
          } else {
            //display an error message to the user if token is not found
            toast.error("Unable to validate login credentials.", {
              position: toast.POSITION.TOP_RIGHT,
            });
          }
        } else {
          //Handle error in case of no response from server
          toast.error("An unexpected error has occurred.", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
      } catch (error) {
        // Handle network errors or display an error message to the user
        toast.error("Network error. Please try again later.", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    }
  };

  const login = () => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/;

    if (!emailRegex.test(email)) {
      // The string des not match the regex pattern
      console.log("Invalid email address");
      setError((err) => ({ ...err, mail: true }));
      return false;
    } else {
      setError((err) => ({ ...err, mail: false }));
    }

    if (!passwordRegex.test(password)) {
      // The string des not match the regex pattern
      console.log("Invalid password");
      setError((err) => ({ ...err, pass: true }));
      return false;
    } else {
      setError((err) => ({ ...err, pass: false }));
    }

    return true;
  };

  return (
    <>
      <ToastContainer autoClose={2000} />
      <div className="login-container">
        <div className="login">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            {/* <div> </div> */}
            <input
              type="email"
              name="email"
              placeholder="email@example.com"
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
              </span>
            )}
            <button type="submit">Sign In</button>
          </form>
          <p className="alternative">
            Dont have an account? <a href="/signup">Sign up</a>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
