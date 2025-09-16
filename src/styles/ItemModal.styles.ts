import { styled } from "styled-components";

export const Background = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 900;
`;

export const ModalWindow = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 80%;
  background: white;
  padding: 2rem;
  color: black;
  border-radius: 1rem;
  z-index: 1000;
`;

export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
`;

export const StyledSpan = styled.span`
  display: flex;
  gap: 0.5rem;
`;

export const StyledButton = styled.button<{ type: "button" | "submit" }>`
  cursor: pointer;
  width: 8rem;
  border-radius: 0.25rem;
  ${(props) =>
    props.type === "submit"
      ? `
        background-color: #4285F4;
        color: white;
        border: none;
      `
      : `
        background-color: white;
        color: black;
        border: 0.5px solid black;
      `}
`;
