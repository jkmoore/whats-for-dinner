import React, { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { AuthProvider } from "./AuthContext";
import Inventory from "./pages/Inventory.tsx";
import ShoppingList from "./pages/ShoppingList.tsx";
import Recipes from "./pages/Recipes.tsx";
import Settings from "./pages/Settings.tsx";
import MealPlan from "./pages/MealPlan.tsx";
import Signup from "./pages/Signup.tsx";
import Login from "./pages/Login.tsx";
import PasswordReset from "./pages/PasswordReset.tsx";
import PrivateRoute from "./PrivateRoute";
import LoggedOutRoute from "./LoggedOutRoute";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.tsx";
import MobileHeader from "./components/MobileHeader.tsx"
import NotFound from "./pages/NotFound.tsx";
import styled, { useTheme } from "styled-components";
import { useMediaQuery } from 'styled-breakpoints/use-media-query';

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const StyledSection = styled.section`
  background-color: #f2f2f2;
  background-image: linear-gradient(#f2f2f2, white);
  * {
    margin-top: 0rem;
  }
  flex: 1;
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
        <Container>
          {currentUser && currentUser.emailVerified && (isLarge ? <Navbar /> : <MobileHeader />)}
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
