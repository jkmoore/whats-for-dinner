import React, { useEffect, useState } from "react";
import { useAuthValue } from "../AuthContext";
import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  updatePassword,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import styled from "styled-components";

const StyledDiv = styled.div`
  width: 100%;
  height: 100%;
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
`;

const StyledContainer = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 2rem;
  padding-bottom: 2rem;
  padding-left: 3rem;
  padding-right: 3rem;
  ${({ theme }) => theme.breakpoints.down('sm')} {
    padding: 1rem;
    font-size: 0.9rem;
  }
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding-left: 4rem;
    padding-right: 4rem;
  }
  ${({ theme }) => theme.breakpoints.up('xl')} {
    padding-left: 10rem;
    padding-right: 10rem;
  }
  ${({ theme }) => theme.breakpoints.up('xxl')} {
    padding-left: 15rem;
    padding-right: 15rem;
  }
`;

const StyledForm = styled.form`
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
`;

const StyledInput = styled.input`
  margin-bottom: 1rem;
  width: 16rem;
  height: 2rem;
  padding-left: 0.5rem;
  box-sizing: border-box;
`;

const ConfirmButton = styled.button`
  cursor: pointer;
  height: 2rem;
  width: 16rem;
  border-radius: 0.2rem;
  background-color: #4285f4;
  color: white;
  border: none;
`;

const InTextButton = styled.button`
  border: none;
  background: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: blue;
  cursor: pointer;
`;

export default function AccountSettings() {
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showError, setShowError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [passwordForEmailChange, setPasswordForEmailChange] =
    useState<string>("");
  const [currentEmail, setCurrentEmail] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");
  const [confirmNewEmail, setConfirmNewEmail] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const { currentUser } = useAuthValue();

  const onChangeEmail = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setShowSuccess(false);
    setShowError(false);
    e.preventDefault();
    try {
      if (
        newEmail === "" ||
        confirmNewEmail === "" ||
        passwordForEmailChange === ""
      ) {
        setShowError(true);
        setErrorMessage("Please fill all fields.");
      } else if (newEmail === confirmNewEmail) {
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          passwordForEmailChange
        );
        await reauthenticateWithCredential(currentUser, credential);
        await verifyBeforeUpdateEmail(currentUser, newEmail);
        setShowSuccess(true);
        setSuccessMessage(
          "The system will send an email at your new address for you to verify it. Follow the steps in the email to finish the change."
        );
      } else {
        setShowError(true);
        setErrorMessage("Please make sure the email addresses match.");
      }
    } catch (error: any) {
      const errorCode = error.code;
      setShowError(true);
      switch (errorCode) {
        case "auth/invalid-new-email":
          setErrorMessage("Please enter a valid email address.");
          break;
        case "auth/invalid-login-credentials":
          setErrorMessage("Invalid password.");
          break;
        case "auth/too-many-requests":
          setErrorMessage(
            "Reauthentication is temporarily restricted due to repeated failed attempts. Please reset your password or wait a few minutes before trying again."
          );
          break;
        default:
          setErrorMessage(
            "An unknown error occurred. Please wait a moment and try again."
          );
          break;
      }
    }
  };

  const onChangePassword = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setShowSuccess(false);
    setShowError(false);
    e.preventDefault();
    try {
      if (newPassword === "" || confirmNewPassword === "") {
        setShowError(true);
        setErrorMessage("Please fill all fields.");
      } else if (newPassword === confirmNewPassword) {
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          currentPassword
        );
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, newPassword);
        setShowSuccess(true);
        setSuccessMessage("Password changed successfully.");
      } else {
        setShowError(true);
        setErrorMessage("Please make sure the new password fields match.");
      }
    } catch (error: any) {
      const errorCode = error.code;
      setShowError(true);
      switch (errorCode) {
        case "auth/invalid-login-credentials":
          setErrorMessage("Invalid password.");
          break;
        case "auth/too-many-requests":
          setErrorMessage(
            "Reauthentication is temporarily restricted due to repeated failed attempts. Please wait a few minutes before trying again."
          );
          break;
        case "auth/weak-password":
          setErrorMessage(
            "Please enter a stronger password (at least 6 characters)."
          );
          break;
        default:
          setErrorMessage(
            "An unknown error occurred. Please wait a moment and try again."
          );
          break;
      }
    }
  };

  const onSendPasswordResetEmail = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    setShowSuccess(false);
    setShowError(false);
    const auth = getAuth();
    sendPasswordResetEmail(auth, currentUser.email)
      .then(() => {
        setShowSuccess(true);
        setSuccessMessage(
          "The system will send you an email to reset your password shortly."
        );
      })
      .catch((error) => {
        setShowError(true);
        setErrorMessage(
          "An unknown error occurred. Please wait a moment and try again."
        );
      });
  };

  useEffect(() => {
    if (currentUser && currentUser.email) {
      setCurrentEmail(currentUser.email);
    }
  }, [currentUser]);

  return (
    <StyledContainer>
      <StyledDiv>
        {showSuccess && <p>{successMessage}</p>}
        {showError && <p>{errorMessage}</p>}
        <StyledForm>
          <h1>Change email address</h1>
          <p>Current email: {currentEmail}</p>
          <StyledInput
            id="new-email-address"
            type="email"
            value={newEmail}
            required
            placeholder="New email"
            autoComplete="off"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewEmail(e.target.value)
            }
          />
          <StyledInput
            id="confirm-new-email-address"
            type="email"
            value={confirmNewEmail}
            required
            placeholder="Confirm new email"
            autoComplete="off"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmNewEmail(e.target.value)
            }
          />
          <StyledInput
            id="password"
            type="password"
            value={passwordForEmailChange}
            required
            placeholder="Current password"
            autoComplete="current-password"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPasswordForEmailChange(e.target.value)
            }
          />
          <ConfirmButton type="submit" onClick={onChangeEmail}>
            Confirm changes
          </ConfirmButton>
        </StyledForm>
        <StyledForm>
          <h1>Change password</h1>
          <StyledInput
            id="current-password"
            type="password"
            value={currentPassword}
            required
            placeholder="Current password"
            autoComplete="current-password"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCurrentPassword(e.target.value)
            }
          />
          <StyledInput
            id="new-password"
            type="password"
            value={newPassword}
            required
            placeholder="New password"
            autoComplete="new-password"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewPassword(e.target.value)
            }
          />
          <StyledInput
            id="confirm-new-password"
            type="password"
            value={confirmNewPassword}
            required
            placeholder="Confirm new password"
            autoComplete="new-password"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmNewPassword(e.target.value)
            }
          />
          <ConfirmButton type="submit" onClick={onChangePassword}>
            Confirm changes
          </ConfirmButton>
          <br />
          <p>
            Or click{" "}
            <InTextButton type="button" onClick={onSendPasswordResetEmail}>
              here
            </InTextButton>{" "}
            to reset your password via email
          </p>
        </StyledForm>
      </StyledDiv>
    </StyledContainer>
  );
}
