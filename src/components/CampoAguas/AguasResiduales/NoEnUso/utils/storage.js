// src/pages/AguasResiduales/GenerarOrden/utils/storage.js
export const TIEMPO_EXPIRACION_MS = 1 * 60 * 1000; // 1 minuto
export const LOCAL_STORAGE_KEY = "ordenes_trabajo_state";

export function guardarEstadoEnLocalStorage(data) {
  const payload = { valor: data, timestamp: Date.now() };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
}

export function leerEstadoDeLocalStorage() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const { valor, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > TIEMPO_EXPIRACION_MS) return null;
    return valor;
  } catch {
    return null;
  }
}
