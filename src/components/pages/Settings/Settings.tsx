import { useState } from "react";
import { StyledContainer, StyledDiv } from "./Settings.styles";
import EmailChangeForm from "./EmailChangeForm";
import PasswordChangeForm from "./PasswordChangeForm";

export default function Settings() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <StyledContainer>
      <StyledDiv>
        {showSuccess && <p>{successMessage}</p>}
        {showError && <p>{errorMessage}</p>}
        <EmailChangeForm
          setShowSuccess={setShowSuccess}
          setSuccessMessage={setSuccessMessage}
          setShowError={setShowError}
          setErrorMessage={setErrorMessage}
        />
        <PasswordChangeForm
          setShowSuccess={setShowSuccess}
          setSuccessMessage={setSuccessMessage}
          setShowError={setShowError}
          setErrorMessage={setErrorMessage}
        />
      </StyledDiv>
    </StyledContainer>
  );
}
