import { Navigate } from "react-router-dom";
import { useAuthValue } from "./AuthContext";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";

export default function PrivateRoute({ children }) {
  const { currentUser } = useAuthValue();

  if (!currentUser) {
    return <Navigate to="/login" replace/>
  }
  else if (!currentUser.emailVerified) {
    signOut(auth);
  }
  else {
    return children;
  }
}
