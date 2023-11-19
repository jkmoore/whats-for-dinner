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
import NotFound from "./pages/NotFound.tsx";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider value={{ currentUser }}>
        <div>
          {currentUser && <Navbar />}
          <section>
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
          </section>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
