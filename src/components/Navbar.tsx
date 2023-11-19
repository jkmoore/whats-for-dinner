import { signOut } from "firebase/auth";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useAuthValue } from "../AuthContext";
import styled from "styled-components";

const StyledList = styled.ul`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  list-style-type: none;
  a {
    text-decoration: none;
    color: black;
  }
  p {
    margin-block-start: 0;
    margin-block-end: 0;
  }
`;

export default function Navbar() {
  const { currentUser } = useAuthValue();
  console.log("User read in navbar: ", currentUser);
  const navigate = useNavigate();

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
    <div>
      <StyledList>
        <li>
          <Link to="/inventory">Inventory</Link>
        </li>
        <li>
          <Link to="/recipes">Recipes</Link>
        </li>
        <li>
          <Link to="/accountsettings">Account Settings</Link>
        </li>
        <li>
          <button onClick={handleLogout}>Logout</button>
        </li>
      </StyledList>
    </div>
  );
}
