import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { sendEmailVerification, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "services/firebase";
import {
  StyledFormBackground,
  StyledFormContainer,
  StyledInput,
  SubmitButton,
  StyledImg,
  StyledForm,
  ErrorMessage,
  StyledTextCenter
} from "styles/AuthForm.styles";
import { FirebaseAuthError } from "types/firebase";
import { ERROR_MESSAGES, UNKNOWN_ERROR_MESSAGE } from "constants/authErrors";
import logo from "assets/images/logo-navbar.svg";

const componentSpecificErrors: Record<string, string> = {
  "auth/too-many-requests": "Login is temporarily disabled due to repeated failed attempts with incorrect or unverified credentials. Please wait a few minutes and try again. If you aren't verified, check your email for a verification link.",
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        trimmedEmail,
        trimmedPassword
      );
      const user = userCredential.user;
      if (user && user.emailVerified) {
        navigate("/inventory");
      } else if (user && !user.emailVerified) {
        await signOut(auth);
        await sendEmailVerification(user);
        setErrorMessage("Your account is not yet verified. Not to worry! We've sent you a new verification email. If you don't see it in your inbox within a few minutes, click Login again to resend.");
      }
    }
    catch (error: unknown) {
      const authError = error as FirebaseAuthError;
      console.error(authError);
      const errorCode = authError?.code;
      const message =
        componentSpecificErrors[errorCode] ||
        ERROR_MESSAGES[errorCode] ||
        UNKNOWN_ERROR_MESSAGE;
      setErrorMessage(message);
    }
  };

  return (
    <StyledFormBackground>
      <StyledFormContainer>
        <StyledImg src={logo} alt="What's for Dinner?" />
        <StyledForm onSubmit={onLogin}>
          <StyledInput
            id="email-address"
            name="email"
            type="email"
            required
            placeholder="Email address"
            autoComplete="email"
            onChange={e => setEmail(e.target.value)}
          />
          <StyledInput
            id="password"
            name="password"
            type="password"
            required
            placeholder="Password"
            autoComplete="current-password"
            onChange={e => setPassword(e.target.value)}
          />
          <SubmitButton type="submit">Login</SubmitButton>
        </StyledForm>
        {errorMessage && <ErrorMessage aria-live="polite">{errorMessage}</ErrorMessage>}
        <StyledTextCenter>
          <NavLink to="/passwordreset">Forgot your password?</NavLink>
        </StyledTextCenter>
        <StyledTextCenter>
          No account yet? <NavLink to="/signup">Sign up</NavLink>
        </StyledTextCenter>
      </StyledFormContainer>
    </StyledFormBackground>
  );
}
