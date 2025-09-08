import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "services/firebase";
import { useAuthValue } from "contexts/AuthContext";

type PrivateRouteProps = {
  children: ReactNode;
};

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { currentUser } = useAuthValue();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  } else if (!currentUser.emailVerified) {
    signOut(auth);
    return <Navigate to="/login" replace />;
  } else {
    return <>{children}</>;
  }
}
