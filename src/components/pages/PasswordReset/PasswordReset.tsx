import { useState } from "react";
import { NavLink } from "react-router-dom";
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
} from "styles/AuthForm.styles";
import { FirebaseAuthError } from "types/firebase";
import { ERROR_MESSAGES, UNKNOWN_ERROR_MESSAGE } from "constants/authErrors";
import logo from "assets/images/logo-navbar.svg";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsError(false);
    setResultMessage("");
    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, email);
      setResultMessage("If an account with the given email address exists, the system will send an email to reset your password shortly.");
    } catch (error: unknown) {
      setIsError(true);
      console.error(error);
      const authError = error as FirebaseAuthError;
      setResultMessage(ERROR_MESSAGES[authError?.code] || UNKNOWN_ERROR_MESSAGE);
    }
  }

  return (
    <StyledFormBackground>
      <StyledFormContainer>
        <StyledImg src={logo} alt="What's for Dinner?" />
        <StyledHeader>Reset your password</StyledHeader>
        <StyledForm onSubmit={handlePasswordReset}>
          <StyledInput
            id="email-address"
            type="email"
            value={email}
            required
            placeholder="Email address"
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <SubmitButton type="submit">
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
