import styled from "styled-components";

export const StyledFormBackground = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  position: fixed;
  background-color: inherit;
  background-image: inherit;
  ${({ theme }) => theme.breakpoints.down('sm')} {
    background-color: white  !important;
    background-image: none;
  }
`;

export const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 30rem;
  height: 35rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  ${({ theme }) => theme.breakpoints.down('sm')} {
    box-shadow: none;
  }
`;

export const StyledInput = styled.input`
  margin-bottom: 1rem;
  width: 16rem;
  height: 2rem;
  padding-left: 0.5rem;
  box-sizing: border-box;
  font-size: 1rem;
`;

export const SubmitButton = styled.button`
  cursor: pointer;
  height: 2rem;
  width: 16rem;
  border-radius: 0.2rem;
  background-color: #4285f4;
  color: white;
  border: none;
  margin-bottom: 1rem;
  font-size: 1rem;
`;

export const StyledImg = styled.img`
  height: 9.5rem;
  width: 18rem;
  margin-bottom: 2rem;
`;

export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
`;

export const ErrorMessage = styled.p`
  color: crimson;
  max-width: 80%;
`;

export const StyledHeader = styled.h1`
  white-space: nowrap;
`;

export const StyledText = styled.p`
  white-space: pre-wrap;
  max-width: 80%;
`;

export const StyledTextCenter = styled.p`
  white-space: pre-wrap;
  max-width: 80%;
  text-align: center;
`;
