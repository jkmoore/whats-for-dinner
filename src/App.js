import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import styled, { useTheme } from "styled-components";
import { useMediaQuery } from "styled-breakpoints/use-media-query";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { AuthProvider } from "./AuthContext";
import Inventory from "./components/pages/Inventory/Inventory.tsx";
import ShoppingList from "./components/pages/ShoppingList/ShoppingList.tsx";
import Recipes from "./components/pages/Recipes/Recipes.tsx";
import Settings from "./components/pages/Settings/Settings.tsx";
import MealPlan from "./components/pages/MealPlan/MealPlan.tsx";
import Signup from "./components/pages/Signup/Signup.tsx";
import Login from "./components/pages/Login/Login.tsx";
import PasswordReset from "./components/pages/PasswordReset/PasswordReset.tsx";
import NotFound from "./components/pages/NotFound/NotFound.tsx";
import PrivateRoute from "./PrivateRoute";
import LoggedOutRoute from "./LoggedOutRoute";
import Navbar from "./components/Navbar.tsx";
import MobileHeader from "./components/MobileHeader.tsx";

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const StyledSection = styled.section`
  background-color: #f2f2f2;
  background-image: linear-gradient(#f2f2f2, white);
  h1,
  h2,
  p {
    margin-top: 0rem;
  }
  flex: 1;
`;

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isLarge = useMediaQuery(useTheme()?.breakpoints.up("md"));

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
        <Container>
          {currentUser &&
            currentUser.emailVerified &&
            (isLarge ? <Navbar /> : <MobileHeader />)}
          <StyledSection>
            <Routes>
              <Route
                path="/"
                element={
                  currentUser ? (
                    <Navigate to="/inventory" />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/inventory"
                element={
                  <PrivateRoute>
                    <Inventory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/shoppinglist"
                element={
                  <PrivateRoute>
                    <ShoppingList />
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
                path="/mealPlan"
                element={
                  <PrivateRoute>
                    <MealPlan />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <Settings />
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
              <Route
                path="/passwordreset"
                element={
                  <LoggedOutRoute>
                    <PasswordReset />
                  </LoggedOutRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </StyledSection>
        </Container>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
