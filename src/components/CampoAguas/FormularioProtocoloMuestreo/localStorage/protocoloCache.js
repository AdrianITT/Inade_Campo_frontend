// logic/protocoloCache.js
const KEY = "PROTOCOLO_ID";

export const getProtocoloId  = () => {
  const v = localStorage.getItem(KEY);
  return v ? Number(v) : null;
};

export const setProtocoloId  = (id) => localStorage.setItem(KEY, String(id));
export const clearProtocoloId = () => localStorage.removeItem(KEY);
