import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import {
  StyledFormBackground,
  StyledFormContainer,
  StyledInput,
  SubmitButton,
  StyledImg,
  StyledForm,
  ErrorMessage,
  StyledText,
  StyledHeader,
  StyledTextCenter
} from "../../StyledAuthForm";
import { NavLink } from "react-router-dom";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [resultMessage, setResultMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);

  const onSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsError(false);
    setResultMessage("");
    e.preventDefault();
    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setResultMessage("If an account with the given email address exists, the system will send an email to reset your password shortly.");
      })
      .catch((error) => {
        setIsError(true);
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
    <StyledFormBackground>
      <StyledFormContainer>
        <StyledImg src={process.env.PUBLIC_URL + "/logoNavbar.svg"} alt="What's for Dinner?"/>
        <StyledHeader>Reset your password</StyledHeader>
        <StyledForm>
          <StyledInput
            id="email-address"
            type="email"
            value={email}
            required
            placeholder="Email address"
            autoComplete="email"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />
          <SubmitButton type="submit" onClick={onSubmit}>
            Send password reset email
          </SubmitButton>
        </StyledForm>
        {resultMessage && (isError ? <ErrorMessage>{resultMessage}</ErrorMessage> : <StyledText>{resultMessage}</StyledText>)}
        <StyledTextCenter>
          Have your password? <NavLink to="/login">Log in</NavLink>
        </StyledTextCenter>
      </StyledFormContainer>
    </StyledFormBackground>
  );
}
