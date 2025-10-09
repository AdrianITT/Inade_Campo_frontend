import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logout_Api from "../../apis/ApiCampo/LougoutApi";

const AutoLogoutTimer = ({ timeout = 60 * 60 * 1000 }) => { // 5 min por defecto
  const navigate = useNavigate();
  const [remaining, setRemaining] = useState(timeout);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  // 🔒 Cerrar sesión automática
  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      await Logout_Api.post(
        "",
        {},
        {
          headers: { Authorization: `Token ${token}` }, // o 'Bearer' si usas JWT
        }
      );
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      alert("Tu sesión ha expirado por inactividad.");
      navigate("/");
    }
  };

  // 🧠 Reinicia el contador e intervalo cuando el usuario interactúa
  const resetTimer = () => {
    setRemaining(timeout);
    clearTimeout(timerRef.current);
    clearInterval(intervalRef.current);

    // Cada segundo reducimos el contador
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => prev - 1000);
    }, 1000);

    // Programamos el cierre de sesión al expirar
    timerRef.current = setTimeout(() => {
      clearInterval(intervalRef.current);
      handleLogout();
    }, timeout);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // inicia el contador

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(timerRef.current);
      clearInterval(intervalRef.current);
    };
  }, []);

  // 🕒 Convierte milisegundos en formato mm:ss
  const formatTime = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div style={{ color: remaining < 60000 ? "red" : "#555", fontWeight: "bold" }}>
      ⏳ Sesión expira en {formatTime(remaining)}
    </div>
  );
};

export default AutoLogoutTimer;
