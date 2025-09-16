import { styled } from "styled-components";

export const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 0rem;
  margin: 0.5rem 0;
  height: 2.5rem;
`;

export const SearchBar = styled.input`
  padding: 0.625rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  outline: none;
  width: 100%;
  margin-left: 0.5rem;
  box-shadow: 0.13rem 0.13rem 0.25rem rgba(0, 0, 0, 0.2);
  font-size: 1rem;

  ::placeholder {
    color: #ccc;
  }

  &:focus {
    outline: 0.1rem solid #ccc;
  }
`;

export const AddItemButton = styled.img`
  height: 2rem;
  width: 2rem;
  cursor: pointer;
  border-radius: 50%;
  box-shadow: 0.13rem 0.13rem 0.25rem rgba(0, 0, 0, 0.2);
  &:hover {
    filter: brightness(95%);
  }
`;

export const StyledDiv = styled.div`
  padding: 2rem 3rem;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    padding: 1rem;
    font-size: 0.9rem;
  }

  ${({ theme }) => theme.breakpoints.up("xl")} {
    padding-left: 8rem;
    padding-right: 8rem;
  }

  ${({ theme }) => theme.breakpoints.up("xxl")} {
    padding-left: 15rem;
    padding-right: 15rem;
  }
`;

export const StyledList = styled.ul`
  padding: 0rem;
`;

export const StyledListItem = styled.li`
  background-color: #fafafa;
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin: 0.5rem 0;
  box-shadow: 0.13rem 0.13rem 0.25rem rgba(0, 0, 0, 0.2);
  list-style-type: none;
  cursor: pointer;
  margin-top: 0rem;
  height: 3rem;
  box-sizing: border-box;
`;

export const DeleteItemButton = styled.img`
  cursor: pointer;
  border: none;
  height: 1.2rem;
  width: 1.2rem;
  margin-right: 0.5rem;
  opacity: 0.3;
  border-radius: 50%;
  &:hover {
    opacity: 0.7;
    background-color: #ccc;
  }
`;

export const ItemNameSpan = styled.span`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
