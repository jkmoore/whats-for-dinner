import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthValue } from "./AuthContext";
import React from "react";

type LoggedOutRouteProps = {
  children: ReactNode;
};

export default function LoggedOutRoute({ children }: LoggedOutRouteProps) {
  const {
    currentUser,
  }: {
    currentUser: { emailVerified: boolean } | null;
  } = useAuthValue();

  if (currentUser && currentUser.emailVerified) {
    return <Navigate to="/inventory" replace />;
  } else {
    return <>{children}</>;
  }
}
