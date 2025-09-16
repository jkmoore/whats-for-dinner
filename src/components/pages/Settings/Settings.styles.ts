import { styled } from "styled-components";

export const StyledDiv = styled.div`
  width: 100%;
  height: 100%;
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
`;

export const StyledContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem 3rem;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: 1rem;
    font-size: 0.9rem;
  }

  ${({ theme }) => theme.breakpoints.up("md")} {
    padding-left: 4rem;
    padding-right: 4rem;
  }

  ${({ theme }) => theme.breakpoints.up("xl")} {
    padding-left: 10rem;
    padding-right: 10rem;
  }

  ${({ theme }) => theme.breakpoints.up("xxl")} {
    padding-left: 15rem;
    padding-right: 15rem;
  }
`;

export const StyledForm = styled.form`
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
`;

export const StyledInput = styled.input`
  margin-bottom: 1rem;
  width: 16rem;
  height: 2rem;
  padding-left: 0.5rem;
  box-sizing: border-box;
  font-size: 1rem;
`;

export const ConfirmButton = styled.button`
  cursor: pointer;
  height: 2rem;
  width: 16rem;
  border-radius: 0.2rem;
  background-color: #4285f4;
  color: white;
  border: none;
  font-size: 1rem;
`;

export const InTextButton = styled.button`
  border: none;
  background: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: blue;
  cursor: pointer;
`;
