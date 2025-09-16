import { useState } from "react";
import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  updatePassword
} from "firebase/auth";
import { useAuthValue } from "contexts/AuthContext";
import {
  ConfirmButton,
  InTextButton,
  StyledForm,
  StyledInput
} from "./Settings.styles";
import { ERROR_MESSAGES, UNKNOWN_ERROR_MESSAGE } from "constants/authErrors";

const componentSpecificErrors: Record<string, string> = {
  "auth/too-many-requests": "Reauthentication is temporarily restricted due to repeated failed attempts. Please wait a few minutes before trying again.",
};

type PasswordChangeFormProps = {
  setShowSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string>>;
  setShowError: React.Dispatch<React.SetStateAction<boolean>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
};

export default function PasswordChangeForm({
  setShowSuccess,
  setSuccessMessage,
  setShowError,
  setErrorMessage,
}: PasswordChangeFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const { currentUser } = useAuthValue();

  const onChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowSuccess(false);
    setShowError(false);

    if (!currentUser) {
      setShowError(true);
      setErrorMessage("No user is currently logged in.");
      return;
    }

    if (newPassword === "" || confirmNewPassword === "") {
      setShowError(true);
      setErrorMessage("Please fill all fields.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setShowError(true);
      setErrorMessage("Please make sure the new password fields match.");
      return;
    }

    if (!currentUser.email) {
      setShowError(true);
      setErrorMessage("User email not found.");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      setShowSuccess(true);
      setSuccessMessage("Password changed successfully.");
    } catch (error: any) {
      const errorCode = error.code;
      setShowError(true);
      const message =
        componentSpecificErrors[errorCode] ||
        ERROR_MESSAGES[errorCode] ||
        UNKNOWN_ERROR_MESSAGE;
      setErrorMessage(message);
    }
  };

  const onSendPasswordResetEmail = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    setShowSuccess(false);
    setShowError(false);
    const auth = getAuth();

    if (!currentUser) {
      setShowError(true);
      setErrorMessage("No user is currently logged in.");
      return;
    }

    if (currentUser.email) {
      sendPasswordResetEmail(auth, currentUser.email)
        .then(() => {
          setShowSuccess(true);
          setSuccessMessage(
            "The system will send you an email to reset your password shortly."
          );
        })
        .catch(() => {
          setShowError(true);
          setErrorMessage(
            "An unknown error occurred. Please wait a moment and try again."
          );
        });
    } else {
      setShowError(true);
      setErrorMessage("User email not found.");
    }
  };
  return (
    <StyledForm onSubmit={onChangePassword}>
      <h1>Change password</h1>
      <StyledInput
        id="current-password"
        type="password"
        value={currentPassword}
        required
        placeholder="Current password"
        autoComplete="current-password"
        onChange={e => setCurrentPassword(e.target.value)}
      />
      <StyledInput
        id="new-password"
        type="password"
        value={newPassword}
        required
        placeholder="New password"
        autoComplete="new-password"
        onChange={e => setNewPassword(e.target.value)}
      />
      <StyledInput
        id="confirm-new-password"
        type="password"
        value={confirmNewPassword}
        required
        placeholder="Confirm new password"
        autoComplete="new-password"
        onChange={e => setConfirmNewPassword(e.target.value)}
      />
      <ConfirmButton type="submit">
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
  )
}