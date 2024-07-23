import React, { useContext } from "react";
import { User } from "firebase/auth";

export type AuthContextType = {
  currentUser: User;
};

export const AuthContext = React.createContext<AuthContextType | undefined>(
  undefined
);

type AuthProviderProps = {
  children: React.ReactNode;
  value: AuthContextType;
};

export function AuthProvider({ children, value }: AuthProviderProps) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthValue(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthValue must be used within an AuthProvider");
  }
  return context;
}
