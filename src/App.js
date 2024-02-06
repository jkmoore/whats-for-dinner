import React, { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { AuthProvider } from "./AuthContext";
import Inventory from "./pages/Inventory.tsx";
import Recipes from "./pages/Recipes.tsx";
import AccountSettings from "./pages/AccountSettings.tsx";
import Signup from "./pages/Signup.tsx";
import Login from "./pages/Login.tsx";
import PrivateRoute from "./PrivateRoute";
import LoggedOutRoute from "./LoggedOutRoute";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.tsx";
import MobileHeader from "./components/MobileHeader.tsx"
import NotFound from "./pages/NotFound.tsx";
import styled, { useTheme } from "styled-components";
import { useMediaQuery } from 'styled-breakpoints/use-media-query';

const StyledSection = styled.section`
  background-color: #f2f2f2;
  background-image: linear-gradient(#f2f2f2, white);
  * {
    margin-top: 0rem;
  }
`;

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isLarge = useMediaQuery(useTheme()?.breakpoints.up('md'));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <AuthProvider value={{ currentUser }}>
        <div>
          {currentUser && (isLarge ? <Navbar /> : <MobileHeader />)}
          <StyledSection>
            <Routes>
              <Route
                path="/inventory"
                element={
                  <PrivateRoute>
                    <Inventory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/recipes"
                element={
                  <PrivateRoute>
                    <Recipes />
                  </PrivateRoute>
                }
              />
              <Route
                path="/accountsettings"
                element={
                  <PrivateRoute>
                    <AccountSettings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <LoggedOutRoute>
                    <Signup />
                  </LoggedOutRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <LoggedOutRoute>
                    <Login />
                  </LoggedOutRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </StyledSection>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
