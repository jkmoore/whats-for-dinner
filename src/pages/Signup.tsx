import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { User, createUserWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationSent, setVerificationSent] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const onSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setShowError(false);
    setVerificationSent(false);
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendVerification(userCredential.user);
      await signOut(auth);
    } catch (error: any) {
      console.error(error);
      const errorCode = error.code;
      setShowError(true);
      switch (errorCode) {
        case "auth/email-already-in-use":
          setErrorMessage("An account with that email address already exists. Please log in or choose a different email to sign up.")
          break;
        case "auth/invalid-email":
          setErrorMessage("Please enter a valid email address.");
          break;
        case "auth/weak-password":
          setErrorMessage("Please enter a stronger password (at least 6 characters).");
          break;
        case "auth/missing-password":
          setErrorMessage("Please enter a password.");
          break;
        default:
          setErrorMessage("An unknown error occurred. Please wait a moment and try again.")
          break;
      }
    }
  };

  const sendVerification = async (user: User) => {
    try {
      await sendEmailVerification(user);
      setVerificationSent(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <form>
        <div>
          <label htmlFor="email-address">Email address</label>
          <input
            id="email-address"
            type="email"
            value={email}
            required
            placeholder="Email address"
            autoComplete="off"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            required
            placeholder="Password"
            autoComplete="off"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" onClick={onSubmit}>
          Sign up
        </button>
      </form>
      {showError && (<p>{errorMessage}</p>)}
      {verificationSent && (
        <span>
          <p>
            A verification email has been sent to your email address. Please verify your email to complete the sign-up process.
          </p>
        </span>
      )}
      <p>
        Already have an account? <NavLink to="/login">Sign in</NavLink>
      </p>
    </div>
  );
}
