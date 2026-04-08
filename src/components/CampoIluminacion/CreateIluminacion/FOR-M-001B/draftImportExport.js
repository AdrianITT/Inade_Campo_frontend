const STORAGE_PREFIX = "FOR-M-001B:create:draft:";

export function getDraftKey({ scopeId }) {
  return `${STORAGE_PREFIX}${String(scopeId ?? "default")}`;
}

export function saveDraft({ scopeId, values }) {
  try {
    const payload = {
      version: 1,
      scopeId: String(scopeId ?? "default"),
      savedAt: new Date().toISOString(),
      values,
    };
    localStorage.setItem(getDraftKey({ scopeId }), JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function loadDraft({ scopeId }) {
  try {
    const raw = localStorage.getItem(getDraftKey({ scopeId }));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearDraft({ scopeId }) {
  try {
    localStorage.removeItem(getDraftKey({ scopeId }));
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
  const values = payload?.values;
  if (!values || typeof values !== "object") {
    return { ok: false, message: "El archivo no contiene 'values' válido." };
  }
  return { ok: true, values };
}

