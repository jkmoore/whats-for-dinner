import styled from "styled-components";

const Background = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1900;
`;

const ModalContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  height: 40%;
  background: white;
  padding: 2rem;
  color: black;
  border-radius: 1rem;
  z-index: 2000;
`;

const ConfirmButton = styled.button`
  background-color: crimson;
  border: none;
  color: white;
  cursor: pointer;
`;

const CancelButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
`;

interface ConfirmModalProps {
  mainText: string;
  confirmText: string;
  onConfirm: () => void;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ConfirmModal({
  mainText,
  confirmText,
  onConfirm,
  setIsOpen,
}: ConfirmModalProps) {
  return (
    <>
      <Background onClick={() => setIsOpen(false)} />
      <ModalContainer>
        <p>{mainText}</p>
        <CancelButton onClick={() => setIsOpen(false)}>Cancel</CancelButton>
        <ConfirmButton onClick={onConfirm}>{confirmText}</ConfirmButton>
      </ModalContainer>
    </>
  );
}
