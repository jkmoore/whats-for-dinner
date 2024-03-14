import React from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import LogOutButton from "./LogOutButton";

const StyledDiv = styled.div`
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #d9d9d9;
`;

const StyledList = styled.ul`
  width: 48rem;
  min-width: 48rem;
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
  margin-left: 1rem;
  margin-right: 1rem;
  padding: 0rem;
`;

const StyledLink = styled(Link)<{ $isActive: boolean }>`
  text-decoration: none;
  font-size: 1rem;
  color: ${(props) => (props.$isActive ? "#D30000" : "black")};
  border-bottom: ${(props) =>
    props.$isActive ? "0.25rem solid #D30000" : "0.25rem solid transparent"};
  &:hover {
    color: #D30000;
  }
  padding: 0.25rem;
  display: inline-block;
`;

export default function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navLinks = [
    { path: "/inventory", text: "INVENTORY" },
    { path: "/shoppingList", text: "SHOPPING LIST" },
    { path: "/recipes", text: "RECIPES" },
    { path: "/mealPlan", text: "MEAL PLAN"},
    { path: "/settings", text: "SETTINGS" },
  ];

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
          <LogOutButton type="navbar" />
        </li>
      </StyledList>
    </StyledDiv>
  );
}
