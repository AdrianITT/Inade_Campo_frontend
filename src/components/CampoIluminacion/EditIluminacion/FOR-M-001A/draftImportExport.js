const STORAGE_PREFIX = "FOR-M-001A:draft:";

export function getDraftKey({ iluminacionId }) {
  return `${STORAGE_PREFIX}${String(iluminacionId ?? "unknown")}`;
}

export function saveDraft({ iluminacionId, cards }) {
  try {
    const payload = {
      version: 1,
      iluminacionId: String(iluminacionId ?? "unknown"),
      savedAt: new Date().toISOString(),
      cards,
    };
    localStorage.setItem(getDraftKey({ iluminacionId }), JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function loadDraft({ iluminacionId }) {
  try {
    const raw = localStorage.getItem(getDraftKey({ iluminacionId }));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearDraft({ iluminacionId }) {
  try {
    localStorage.removeItem(getDraftKey({ iluminacionId }));
    return true;
  } catch {
    return false;
  }
}

export function downloadJsonFile({ filename, data }) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function readJsonFile(file) {
  const text = await file.text();
  return JSON.parse(text);
}

export function validateImportedDraft(payload) {
  const cards = payload?.cards;
  if (!Array.isArray(cards)) return { ok: false, message: "El archivo no contiene 'cards' válido." };
  return { ok: true, cards };
}

