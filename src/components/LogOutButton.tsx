import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const NavbarButton = styled.button`
  border: none;
  background-color: transparent;
  color: grey;
  cursor: pointer;
  padding: 0.5rem;
`;

const HamburgerMenuButton = styled.button`
  border: none;
  background-color: transparent;
  color: grey;
  margin: 0rem;
  padding: 0rem;
  font-size: 1.1rem;
  cursor: pointer;
`;

interface LogoutButtonProps {
  type: "navbar" | "hamburgerMenu";
}

export default function LogOutButton({ type }: LogoutButtonProps) {
  const navigate = useNavigate();
  const Button = type === "navbar" ? NavbarButton : HamburgerMenuButton;

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return <Button onClick={handleLogout}>Log Out</Button>;
}
