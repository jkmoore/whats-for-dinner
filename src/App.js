import React from 'react';
import Inventory from './pages/Inventory.tsx';
import Recipes from './pages/Recipes.tsx';
import AccountSettings from './pages/AccountSettings.tsx';
import Signup from './pages/Signup.tsx';
import Login from './pages/Login.tsx';
import { BrowserRouter } from 'react-router-dom';
import { Navigate, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
 
function App() {
  return (
    <BrowserRouter>
      <div>
        <Navbar />
        <section>                              
            <Routes>
                <Route path="/inventory" element={<Inventory/>}/>
                <Route path="/recipes" element={<Recipes/>}/>
                <Route path="/accountsettings" element={<AccountSettings/>}/>
                <Route path="/signup" element={<Signup/>}/>
                <Route path="/login" element={<Login/>}/>
            </Routes>                    
        </section>
      </div>
    </BrowserRouter>
  );
}
 
export default App;
