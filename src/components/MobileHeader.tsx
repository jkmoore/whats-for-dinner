import React from "react";
import HamburgerMenu from "./HamburgerMenu"; // Replace with the correct path
import styled from "styled-components";

const StyledImg = styled.img`
  align-self: flex-end;
  margin-left: auto;
  margin-right: auto;
  height: 76px;
  width: 144px;
`;

const StyledContainer = styled.div`
  width: 100%;
  min-height: 5rem;
  display: flex;
  border-bottom: 1px solid #d9d9d9;
  .bm-overlay {
    position: fixed;
    top: 0;
    left: 0;
  }
  .bm-burger-button {
    position: absolute;
    width: 2.25rem;
    height: 1.875rem;
    right: 2rem;
    top: 1.625rem;
  }
  .bm-burger-bars {
    background: #373a47;
  }
  .bm-cross {
    background: #bdc3c7;
  }
  .bm-menu {
    padding: 2.5em 1.5em 0;
    font-size: 1.15em;
    background-color: #fafafa;
  }
  .bm-item-list {
    padding: 0.8rem;
    max-height: 95%;
  }
  .bm-item {
    margin-bottom: 1rem;
  }
`;

export default function MobileHeader() {
  return (
    <StyledContainer id="container">
      <StyledImg
        src={process.env.PUBLIC_URL + "/logoNavbar.svg"}
        alt="What's for Dinner?"
      />
      <div id="page-wrap" />
      <HamburgerMenu />
    </StyledContainer>
  );
}
