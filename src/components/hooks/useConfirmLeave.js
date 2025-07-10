// hooks/useConfirmLeave.js
import { Modal } from "antd";
import { useBlocker, unstable_usePrompt as usePrompt } from "react-router-dom";
import { useEffect } from "react";

export default function useConfirmLeave({ when, message }) {
  // 1️⃣  Bloquea la navegación (solo si `when` es true)
  const blocker = useBlocker(when);

  // 2️⃣  Caja del navegador para refresh / cerrar pestaña
  useEffect(() => {
    const handler = (e) => {
      if (!when) return;
      e.preventDefault();
      e.returnValue = "";          // Chrome muestra un texto genérico
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [when]);

  // 3️⃣  Modal Ant Design para rutas internas
  useEffect(() => {
    if (blocker.state !== "blocked") return;

    Modal.confirm({
      title: "¿Estás segura/o?",
      content: message ?? "Perderás los cambios no guardados.",
      okText: "Salir",
      cancelText: "Cancelar",
      onOk: blocker.proceed,   // deja navegar
      onCancel: blocker.reset, // se queda
    });
  }, [blocker, message]);
}
