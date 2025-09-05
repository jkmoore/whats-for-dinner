import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import styled, { useTheme } from "styled-components";
import { useMediaQuery } from "styled-breakpoints/use-media-query";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./services/firebase";
import { AuthProvider } from "./contexts/AuthContext";
import Inventory from "./components/pages/Inventory/Inventory";
import ShoppingList from "./components/pages/ShoppingList/ShoppingList";
import Recipes from "./components/pages/Recipes/Recipes";
import Settings from "./components/pages/Settings/Settings";
import MealPlan from "./components/pages/MealPlan/MealPlan";
import Signup from "./components/pages/Signup/Signup";
import Login from "./components/pages/Login/Login";
import PasswordReset from "./components/pages/PasswordReset/PasswordReset";
import NotFound from "./components/pages/NotFound/NotFound";
import PrivateRoute from "./routes/PrivateRoute";
import LoggedOutRoute from "./routes/LoggedOutRoute";
import Navbar from "./components/common/Navbar";
import MobileHeader from "./components/common/MobileHeader";

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
