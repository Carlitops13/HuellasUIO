import { useState } from "react";
import LoginForms from "./components/LoginForms.jsx";
import UserProfile from "./components/UserProfile.jsx";
import { Routes, Route } from "react-router-dom";
import DashboardForm from './components/DashboardForm.jsx'; 
import "./App.css";

import RecuperarClave from "./components/RecuperarClave.jsx";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [vistaActual, setVistaActual] = useState("dashboard");

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
    setVistaActual("dashboard");
  };

  const handleLogout = () => {
    setToken("");
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          token ? (
            vistaActual === "dashboard" ? (
              <DashboardForm 
                token={token} 
                onLogout={handleLogout} 
                onIrAPerfil={() => setVistaActual("perfil")} 
              />
            ) : (
              <UserProfile 
                token={token} 
                onLogout={handleLogout} 
              />
            )
          ) : (
            <LoginForms onLoginSuccess={handleLoginSuccess} />
          )
        }
      />

      <Route
        path="/recuperarClave"
        element={<RecuperarClave />}
      />
    </Routes>
  );
}

export default App;