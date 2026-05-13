import { useState } from "react";
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
      <div className="login-left">
        <div className="left-content">
          <h1>Cada rescate empieza con <span>un corazón dispuesto.</span></h1>
          <p>Bienvenido al panel oficial para rescatistas de Huellas UIO. Tu labor en las calles de Quito transforma vidas.</p>
          
          <div className="imagen">
            <img src={maxImg} alt="Rescate" />
            <span className="badge">COMUNIDAD ACTIVA</span>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <h2>Ingresar</h2>
          <p className="bienvenida">Bienvenido de vuelta. Por favor ingresa tus credenciales para continuar gestionando rescates.</p>
          
          <form className="formLogin" onSubmit={(e) => {e.preventDefault(); login(username, password);}}>
            <div className="input-group">
              <label>Correo Electrónico</label>
              <input
                type="text"
                placeholder="tu@email.com"
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" /> Recordarme
              </label>
              <a href="#" className="forgot-pass">Olvidé mi contraseña</a>
            </div>

            <button type="submit" id="ingresar">
              Ingresar →
            </button>
          </form>
          
          <p className="register-link">
            ¿Aún no eres parte de nuestra red? <a href="#">Regístrate</a>
          </p>
        </div>
      </div>
    </div>
  );
}
