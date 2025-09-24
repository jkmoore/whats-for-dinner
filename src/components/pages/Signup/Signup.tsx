import { useState } from "react";
import { NavLink } from "react-router-dom";
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
import logo from "assets/images/logo-navbar.svg";
import { registerUser, sendVerificationEmail, signOutUser } from "services/auth";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowError(false);
    setVerificationSent(false);
    setErrorMessage(null);
    setLoading(true);
    const registrationResult = await registerUser(email, password);
    try {
      if (registrationResult.success && registrationResult.user) {
        const emailSent = await sendVerificationEmail(registrationResult.user);
        if (emailSent) {
          setVerificationSent(true);
          await signOutUser();
        } else {
          setErrorMessage("Your account was created, but a verification email could not be sent. Please try logging in with your new account and a new verification email will be sent at that time.");
          setShowError(true);
        }
      } else if (registrationResult.error) {
        setShowError(true);
        setErrorMessage(registrationResult.error);
      }
    } catch (error) {
      console.error("Signup process encountered an unexpected error:", error);
      setShowError(true);
      setErrorMessage("An unexpected error occurred during signup. Please try again.");
    } finally {
      setLoading(false);
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
          <SubmitButton type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Sign up"}
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
