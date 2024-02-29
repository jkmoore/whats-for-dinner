import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [resultMessage, setResultMessage] = useState<string>("");

  const onSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    setResultMessage("");
    e.preventDefault();
    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setResultMessage("If an account with the given email address exists, the system will send an email to reset your password shortly.");
      })
      .catch((error) => {
        console.error(error);
        const errorCode = error.code;
        switch (errorCode) {
          case "auth/invalid-email":
            setResultMessage("Please enter a valid email address.");
            break;
          case "auth/missing-email":
            setResultMessage("Please enter a valid email address.");
            break;
          default:
            setResultMessage("An unknown error occurred. Please wait a moment and try again.")
            break;
        }
      });
  }

  return (
    <>
      <h1>Reset your password</h1>
      <form>
        <div>
          <label htmlFor="email-address">Email address</label>
          <input
            id="email-address"
            type="email"
            value={email}
            required
            placeholder="Email address"
            autoComplete="email"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />
        </div>
        <button type="submit" onClick={onSubmit}>
          Send password reset email
        </button>
      </form>
      {resultMessage && <p>{resultMessage}</p>}
    </>
  );
}
