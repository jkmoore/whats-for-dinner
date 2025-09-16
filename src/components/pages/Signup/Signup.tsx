import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  User,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth } from "services/firebase";
import {
  StyledFormBackground,
  StyledFormContainer,
  StyledInput,
  SubmitButton,
  StyledImg,
  StyledForm,
  ErrorMessage,
  StyledText,
  StyledTextCenter,
} from "styles/AuthForm.styles";
import { ERROR_MESSAGES, UNKNOWN_ERROR_MESSAGE } from "constants/authErrors";
import logo from "assets/images/logo-navbar.svg";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    setShowError(false);
    setVerificationSent(false);
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await sendVerification(userCredential.user);
      await signOut(auth);
    } catch (error: any) {
      console.error(error);
      const message = ERROR_MESSAGES[error.code] || UNKNOWN_ERROR_MESSAGE;
      setShowError(true);
      setErrorMessage(message);
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
    <StyledFormBackground>
      <StyledFormContainer>
        <StyledImg
          src={logo}
          alt="What's for Dinner?"
        />
        <StyledForm onSubmit={handleSignup}>
          <StyledInput
            id="email-address"
            type="email"
            value={email}
            required
            placeholder="Email address"
            autoComplete="off"
            onChange={e => setEmail(e.target.value)}
          />
          <StyledInput
            id="password"
            type="password"
            value={password}
            required
            placeholder="Password"
            autoComplete="off"
            onChange={e => setPassword(e.target.value)}
          />
          <SubmitButton type="submit">
            Sign up
          </SubmitButton>
        </StyledForm>
        {showError && <ErrorMessage>{errorMessage}</ErrorMessage>}
        {verificationSent && (
          <StyledText>
            A verification email has been sent to your email address. Please
            verify your email to complete the sign-up process.
          </StyledText>
        )}
        <StyledTextCenter>
          Already have an account? <NavLink to="/login">Sign in</NavLink>
        </StyledTextCenter>
      </StyledFormContainer>
    </StyledFormBackground>
  );
}
