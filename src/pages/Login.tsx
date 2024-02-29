import React, { useState } from "react";
import { sendEmailVerification, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { NavLink, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const onLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    setShowErrorMessage(false);
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        if (user && user.emailVerified) {
          navigate("/inventory");
        }
        else if (user && !user.emailVerified) {
          await signOut(auth);
          await sendEmailVerification(userCredential.user);
          setShowErrorMessage(true);
          setErrorMessage("Your account is not yet verified. Please check your email for a verification link to log in. If you receive no email, please click to resend.")
        }
      })
      .catch((error) => {
        console.error(error);
        const errorCode = error.code;
        setShowErrorMessage(true);
        switch (errorCode) {
          case "auth/invalid-email":
            setErrorMessage("Please enter a valid email address.");
            break;
          case "auth/missing-password":
            setErrorMessage("Please enter a password.");
            break;
          case "auth/invalid-login-credentials":
            setErrorMessage("Invalid login credentials.");
            break;
          case "auth/too-many-requests":
            setErrorMessage("Login failed. It might be because you recently signed up or attempted to login and are not verified. Please check your email and verify before logging in. If you have not received an email, please wait a few minutes and try again.");
            break;
          default:
            setErrorMessage("An unknown error occurred. Please wait a moment and try again.")
            break;
        }
      });
  };

  return (
    <div>
      <form>
        <div>
          <label htmlFor="email-address">Email address</label>
          <input
            id="email-address"
            name="email"
            type="email"
            required
            placeholder="Email address"
            autoComplete="email"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="Password"
            autoComplete="current-password"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          />
        </div>
        <button onClick={onLogin}>Login</button>
      </form>
      {showErrorMessage && <p>{errorMessage}</p>}
      <p>
        <NavLink to="/passwordreset">Forgot your password?</NavLink>
      </p>
      <p>
        No account yet? <NavLink to="/signup">Sign up</NavLink>
      </p>
    </div>
  );
}
