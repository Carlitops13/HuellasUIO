import {useState} from "react";
import maxImg from "../assets/max.jpeg";
import "./LoginForm.css";

export default function LoginForms() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function login(user, password) {
    if (user === "admin" && password === "123") {
      alert("Ingreso Exitoso!");
    } else {
      alert("Usuario o contraseña inválidos.");
    }
    setPassword("");
    setUsername("");
  }

  return (
      <div className="login-page">
      <div className="login-image" style={{ backgroundImage: `url(${maxImg})` }}>
        <div className="image-overlay">
        </div>
      </div>

    <div className="login">
      <h1 id="login-title">Iniciar Sesión</h1>
      <form className="formLogin" onSubmit={(e) => {e.preventDefault(); login(username, password);}}>
      <div className="input-container">
      <input
        type="text"
        placeholder="Usuario"
        value={username} 
        onChange={(e) => setUsername(e.target.value)}
        id="usuario"
        required
      />
      <input
        type="password"
        placeholder="Clave"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        id="clave"
        required
      />
</div>
      <button type="submit" id="ingresar">
        Ingresar
      </button>
      </form>
    </div>
    </div>
  );
}
