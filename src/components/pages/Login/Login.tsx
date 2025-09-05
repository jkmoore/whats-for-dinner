import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { sendEmailVerification, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../../services/firebase";
import {
  StyledFormBackground,
  StyledFormContainer,
  StyledInput,
  SubmitButton,
  StyledImg,
  StyledForm,
  ErrorMessage,
  StyledTextCenter
} from "../../common/StyledAuthForm";
import logo from "../../../assets/images/logo-navbar.svg"

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
          setErrorMessage("Your account is not yet verified. Not to worry! We've sent you a new verification email. If you don't see it in your inbox within a few minutes, click Login again to resend.")
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
            setErrorMessage("Login is temporarily disabled due to repeated failed attempts with incorrect or unverified credentials. Please wait a few minutes and try again. If you aren't verified, check your email for a verification link.");
            break;
          default:
            setErrorMessage("An unknown error occurred. Please wait a moment and try again.")
            break;
        }
      });
  };

  return (
    <StyledFormBackground>
      <StyledFormContainer>
        <StyledImg src={logo} alt="What's for Dinner?"/>
        <StyledForm>
          <StyledInput
            id="email-address"
            name="email"
            type="email"
            required
            placeholder="Email address"
            autoComplete="email"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />
          <StyledInput
            id="password"
            name="password"
            type="password"
            required
            placeholder="Password"
            autoComplete="current-password"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          />
          <SubmitButton onClick={onLogin}>Login</SubmitButton>
        </StyledForm>
        {showErrorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
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
