import { useState } from "react";
import LoginForms from "./components/LoginForms.jsx";
import UserProfile from "./components/UserProfile.jsx";
import "./App.css";

function App() {
  // Estado del token para controlar si el usuario está autenticado
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    setToken("");
  };

  return (
    <div className="App">
      {token ? (
        <UserProfile token={token} onLogout={handleLogout} />
      ) : (
        <LoginForms onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;