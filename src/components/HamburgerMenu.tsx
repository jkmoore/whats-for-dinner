import React, { useState } from "react";
import { slide as Menu } from "react-burger-menu";
import { Link } from "react-router-dom";
import styled from "styled-components";
import LogOutButton from "./LogOutButton";

const StyledLink = styled(Link)`
  text-decoration: none;
  color: black;
`;

export default function HamburgerMenu() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleStateChange = (state: { isOpen: boolean }) => {
    setMenuOpen(state.isOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <Menu right customBurgerIcon={ <img src={process.env.PUBLIC_URL + "/hamburgerMenu.svg" } alt="Menu" />} isOpen={menuOpen} onStateChange={handleStateChange}>
      <StyledLink id="inventory" className="menu-item" to="/inventory" onClick={closeMenu}>Inventory</StyledLink>
      <StyledLink id="recipes" className="menu-item" to="/recipes" onClick={closeMenu}>Recipes</StyledLink>
      <StyledLink id="settings" className="menu-item" to="/settings" onClick={closeMenu}>Settings</StyledLink>
      <LogOutButton type="hamburgerMenu" />
    </Menu>
  );
}
