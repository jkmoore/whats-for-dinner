import { signOut } from "firebase/auth";
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import styled from "styled-components";

const StyledDiv = styled.div`
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #d9d9d9;
`;

const StyledList = styled.ul`
  width: 50rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  list-style-type: none;
  p {
    margin-block-start: 0;
    margin-block-end: 0;
  }
  margin-bottom: 0rem;
  margin-top: 1.5rem;
`;

const StyledLink = styled(Link)<{ $isActive: boolean }>`
  text-decoration: none;
  font-size: 1.1rem;
  color: ${(props) => (props.$isActive ? "#D30000" : "black")};
  border-bottom: ${(props) =>
    props.$isActive ? "0.25rem solid #D30000" : "0.25rem solid transparent"};
  &:hover {
    color: #D30000;
  }
  padding: 0.25rem;
  display: inline-block;
`;

const StyledButton = styled.button`
  border: none;
  background-color: transparent;
  color: grey;
  cursor: pointer;
  padding: 0.5rem;
`;

export default function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();

  const navLinks = [
    { path: "/inventory", text: "INVENTORY" },
    { path: "/recipes", text: "RECIPES" },
    { path: "/accountSettings", text: "ACCOUNT SETTINGS" },
  ];

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
        console.log("Signed out successfully");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <StyledDiv>
      <StyledList>
        <img
          src={process.env.PUBLIC_URL + "/logoNavbar.svg"}
          alt="What's for Dinner?"
        />
        {navLinks.map((link) => (
          <li key={link.path}>
            <StyledLink to={link.path} $isActive={link.path === currentPath}>
              {link.text}
            </StyledLink>
          </li>
        ))}
        <li>
          <StyledButton onClick={handleLogout}>Log Out</StyledButton>
        </li>
      </StyledList>
    </StyledDiv>
  );
}
