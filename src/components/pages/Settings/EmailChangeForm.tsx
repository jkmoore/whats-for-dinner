import { useEffect, useState } from "react";
import {
  ConfirmButton,
  StyledForm,
  StyledInput
} from "./Settings.styles";
import { useAuthValue } from "contexts/AuthContext";
import { EmailAuthProvider, reauthenticateWithCredential, verifyBeforeUpdateEmail } from "firebase/auth";
import { ERROR_MESSAGES, UNKNOWN_ERROR_MESSAGE } from "constants/authErrors";

const componentSpecificErrors: Record<string, string> = {
  "auth/too-many-requests": "Reauthentication is temporarily restricted due to repeated failed attempts. Please reset your password or wait a few minutes before trying again.",
};

type EmailChangeFormProps = {
  setShowSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string>>;
  setShowError: React.Dispatch<React.SetStateAction<boolean>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
};

export default function EmailChangeForm({
  setShowSuccess,
  setSuccessMessage,
  setShowError,
  setErrorMessage,
}: EmailChangeFormProps) {
  const [passwordForEmailChange, setPasswordForEmailChange] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmNewEmail, setConfirmNewEmail] = useState("");
  const { currentUser } = useAuthValue();

  useEffect(() => {
    if (currentUser && currentUser.email) {
      setCurrentEmail(currentUser.email);
    }
  }, [currentUser]);

  const onChangeEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowSuccess(false);
    setShowError(false);

    if (!currentUser) {
      setShowError(true);
      setErrorMessage("No user is currently logged in.");
      return;
    }

    if (
      newEmail === "" ||
      confirmNewEmail === "" ||
      passwordForEmailChange === ""
    ) {
      setShowError(true);
      setErrorMessage("Please fill all fields.");
      return;
    }

    if (newEmail !== confirmNewEmail) {
      setShowError(true);
      setErrorMessage("Please make sure the email addresses match.");
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
        passwordForEmailChange
      );
      await reauthenticateWithCredential(currentUser, credential);
      await verifyBeforeUpdateEmail(currentUser, newEmail);
      setShowSuccess(true);
      setSuccessMessage(
        "The system will send an email to your new address for you to verify it. Follow the steps in the email to finish the change."
      );
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

  return (
    <StyledForm onSubmit={onChangeEmail}>
      <h1>Change email address</h1>
      <p>Current email: {currentEmail}</p>
      <StyledInput
        id="new-email-address"
        type="email"
        value={newEmail}
        required
        placeholder="New email"
        autoComplete="off"
        onChange={e => setNewEmail(e.target.value)}
      />
      <StyledInput
        id="confirm-new-email-address"
        type="email"
        value={confirmNewEmail}
        required
        placeholder="Confirm new email"
        autoComplete="off"
        onChange={e => setConfirmNewEmail(e.target.value)}
      />
      <StyledInput
        id="password"
        type="password"
        value={passwordForEmailChange}
        required
        placeholder="Current password"
        autoComplete="current-password"
        onChange={e => setPasswordForEmailChange(e.target.value)}
      />
      <ConfirmButton type="submit">
        Confirm changes
      </ConfirmButton>
    </StyledForm>
  );
}