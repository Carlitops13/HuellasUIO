import { useState } from "react";
import LoginForms from "./components/LoginForms.jsx";
import UserProfile from "./components/UserProfile.jsx";
import {Routes, Route} from "react-router-dom";
import "./App.css";

import RecuperarClave from "./components/RecuperarClave.jsx";

function App() {
  // Estado del token para controlar si el usuario está autenticado
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    setToken("");
  };
  console.log("Token en App.jsx:", token);
  return (
    <Routes>
      <Route
        path="/"
        element={
          token ? (
            <UserProfile
              token={token}
              onLogout={handleLogout}
            />
          ) : (
            <LoginForms
              onLoginSuccess={handleLoginSuccess}
            />
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