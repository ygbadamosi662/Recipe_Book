import React, { useState } from "react";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({
    mail: false,
    pass: false,
  });

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    const data = {
      email,
      password,
    };

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/;

    if (!emailRegex.test(email)) {
      // The string matches the regex pattern
      console.log("Invalid email address");
      setError((err) => ({ ...err, mail: true }));
    } else if (!passwordRegex.test(password)) {
      // The string matches the regex pattern
      console.log("Invalid password");
      setError((err) => ({ ...err, pass: true }));
    } else {
      setError((err) => ({ ...err, email: true, pass: true }));

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
            </span>
          )}
          <button type="submit">Sign Up</button>
        </form>
        <p className="alternative">
          Dont have an account? <a href="/signup">Sign up</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
