import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logout_Api from "../../apis/ApiCampo/LougoutApi";
import { clearSession } from "../../utils/session";

const AutoLogoutTimer = ({ timeout = 480 * 60 * 1000 }) => { // 1 hora por defecto
  const navigate = useNavigate();
  const [remaining, setRemaining] = useState(timeout);
  const lastActiveRef = useRef(Date.now());
  const checkIntervalRef = useRef(null);

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
          headers: { Authorization: `Token ${token}` },
        }
      );
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      // localStorage.clear();
      clearSession();
      sessionStorage.clear();
      alert("Tu sesión ha expirado por inactividad.");
      navigate("/");
    }
  };

  // 🧠 Reinicia el temporizador al detectar actividad
  const resetTimer = () => {
    lastActiveRef.current = Date.now();
  };

  useEffect(() => {
    // Eventos que cuentan como "actividad"
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Cada segundo verifica cuánto tiempo ha pasado desde la última actividad
    checkIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActiveRef.current;
      const newRemaining = timeout - elapsed;

      setRemaining(newRemaining);

      if (newRemaining <= 0) {
        clearInterval(checkIntervalRef.current);
        handleLogout();
      }
    }, 1000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearInterval(checkIntervalRef.current);
    };
  }, [timeout]);

  // 🕒 Convierte milisegundos a formato mm:ss
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
