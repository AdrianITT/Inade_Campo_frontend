import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Logout_Api from "../../apis/ApiCampo/LougoutApi"; // tu instancia de axios

const AutoLogout = ({ timeout = 1 * 60 * 1000 }) => { // 15 minutos por defecto
  const navigate = useNavigate();
  const timerRef = useRef(null);

  // ✅ Función para cerrar sesión por inactividad
  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      // No hay token → simplemente redirige
      navigate("/");
      return;
    }

    try {
      await Logout_Api.post(
        "",
        {},
        {
          headers: {
            Authorization: `Token ${token}`, // 🔹 o 'Bearer' si usas JWT
          },
        }
      );

      // 🔒 Limpieza completa de datos locales
      [
        "token",
        "user_id",
        "username",
        "rol",
        "organizacion",
        "organizacion_id",
      ].forEach((key) => localStorage.removeItem(key));

      sessionStorage.clear();

      alert("Tu sesión ha expirado por inactividad.");
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión automáticamente:", error.response?.data || error);
      // Aunque falle, limpia sesión local por seguridad
      localStorage.clear();
      sessionStorage.clear();
      navigate("/");
    }
  };

  // ✅ Reinicia el temporizador en cada interacción
  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleLogout, timeout);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // inicia el contador al montar el componente

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
      clearTimeout(timerRef.current);
    };
  }, []);

  return null;
};

export default AutoLogout;
