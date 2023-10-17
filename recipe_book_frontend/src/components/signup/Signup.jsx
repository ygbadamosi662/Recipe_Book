import React, { useState } from "react";
import "./Signup.css";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCpassword] = useState("");

  // const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    const data = {
      email,
      password,
      cpassword,
      lname,
      fname,
    };

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
          />
          <input
            type="text"
            name="lname"
            placeholder="Last name"
            value={lname}
            onChange={(e) => setLname(e.target.value)}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            pattern="\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            name="cpassword"
            placeholder="Confirm password"
            value={cpassword}
            onChange={(e) => setCpassword(e.target.value)}
          />
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