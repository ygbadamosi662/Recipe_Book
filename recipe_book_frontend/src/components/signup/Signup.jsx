import React, { useState } from "react";
import "./Signup.css";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCpassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState({
    first: false,
    last: false,
    mail: false,
    pass: false,
    match: false,
    number: false,
  });

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    const data = {
      fname,
      lname,
      email,
      password,
      phone,
    };

    const nameRegex = /^[a-zA-Z]{3,15}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const phoneRegex =
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,7}$/;

    if (!nameRegex.test(fname) || !nameRegex.test(lname)) {
      // The string matches the regex pattern
      console.log("Invalid name ");
      setError((err) => ({ ...err, first: true }));
    } else if (!passwordRegex.test(password)) {
      // The string matches the regex pattern
      console.log("Invalid password");
      setError((err) => ({ ...err, last: true }));
    } else if (cpassword !== password) {
      // The string matches the regex pattern
      console.log("Password mismatch");
      setError((err) => ({ ...err, pass: true }));
    } else if (!emailRegex.test(email)) {
      // The string matches the regex pattern
      console.log("Invalid email address");
      setError((err) => ({ ...err, mail: true }));
    } else if (!phoneRegex.test(phone)) {
      // The string matches the regex pattern
      console.log("Invalid phone");
      setError((err) => ({ ...err, number: true }));
    } else {
      console.log(data);

      //   try {
      //     // fetch API
      //     const response = await fetch("/api/signup", {
      //       method: "POST",
      //       headers: {
      //         "Content-Type": "application/json",
      //       },
      //       body: JSON.stringify(data),
      //     });

      //     if (response.status === 200) {
      //       navigate("/login"); // Redirect to the login page to signup
      //     } else {
      //       //display an error message to the user
      //     }
      //   } catch (error) {
      //     console.error("Error:", error);
      //     // Handle network errors or display an error message to the user
      //   }
    }
  };

  return (
    <div className="signUp-container">
      <div className="signUp">
        <h2>Sign Up</h2>
        <form onSubmit={handleSignUp}>
          <input
            type="text"
            name="fname"
            placeholder="First name"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
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
            onChange={(e) => setLname(e.target.value)}
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
            onChange={(e) => setEmail(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error.pass && (
            <span className="error-message">
              <small>Invalid password</small>
              <small>
                password should contain at least:
                <br /> 1 uppercase and 1 lowercase letter, <br />1 number and 1
                special character.
              </small>
            </span>
          )}
          <input
            type="password"
            name="cpassword"
            placeholder="Confirm password"
            value={cpassword}
            onChange={(e) => setCpassword(e.target.value)}
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
            onChange={(e) => setPhone(e.target.value)}
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
  );
};

export default Signup;
