import { Navigate } from "react-router-dom";
import { useAuthValue } from "./AuthContext";

export default function LoggedOutRoute({ children }) {
  const { currentUser } = useAuthValue();

  if (currentUser && currentUser.emailVerified) {
    return <Navigate to="/inventory" replace/>
  }
  else {
    return children;
  }
}
