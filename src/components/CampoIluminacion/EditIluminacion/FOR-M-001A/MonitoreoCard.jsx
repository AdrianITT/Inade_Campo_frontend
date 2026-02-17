// FOR-M-001A/MonitoreoCard.jsx
import React, { useMemo, useState } from "react";

const MAX_ROWS = 15;

const makeEmptyRow = () => ({
  id: null,
  areaTrabajo: "",
  largo: "",
  ancho: "",
  alto: "",
  coincide: false,
});

export default function MonitoreoCard({ value, index, onChange, onRemove }) {
  const [collapsed, setCollapsed] = useState(false);

  const updateField = (field, newValue) => {
    onChange(index, { ...value, [field]: newValue });
  };

  const updateRow = (rowIndex, field, newValue) => {
    const nextRows = value.rows.map((r, i) =>
      i === rowIndex ? { ...r, [field]: newValue } : r
    );
    onChange(index, { ...value, rows: nextRows });
  };

  const addRow = () => {
    if ((value.rows?.length ?? 0) >= MAX_ROWS) return;
    onChange(index, { ...value, rows: [...value.rows, makeEmptyRow()] });
  };

  const removeRow = (rowIndex) => {
    const nextRows = value.rows.filter((_, i) => i !== rowIndex);
    onChange(index, { ...value, rows: nextRows });
  };

  const filledRows = useMemo(() => {
    return value.rows.filter((r) =>
      [r.areaTrabajo, r.largo, r.ancho, r.alto].some(
        (v) => String(v ?? "").trim() !== ""
      ) || r.coincide
    ).length;
  }, [value.rows]);

  const responsiveCss = `
    /* Tablet y abajo */
    @media (max-width: 992px) {
      .mc-header { flex-wrap: wrap; }
      .mc-actions { width: 100%; justify-content: flex-end; }
      .mc-grid2 { grid-template-columns: 1fr !important; }
      .mc-tableHeader, .mc-tableRow { display: none !important; }
      .mc-rowCard { display: block !important; }
      .mc-rowGrid { grid-template-columns: 1fr 1fr; }
    }

    /* Móvil */
    @media (max-width: 576px) {
      .mc-actions { gap: 8px; }
      .mc-rowGrid { grid-template-columns: 1fr !important; }
      .mc-btn, .mc-btnDanger { width: 100%; }
    }

    /* Desktop */
    @media (min-width: 993px) {
      .mc-tableHeader, .mc-tableRow { display: grid !important; }
      .mc-rowCard { display: none !important; }
      .mc-grid2 { grid-template-columns: 1fr 1fr !important; }
    }
  `;

  return (
    <div style={styles.card}>
      <style>{responsiveCss}</style>

      {/* Header */}
      <div className="mc-header" style={styles.cardHeader}>
        <div style={{ minWidth: 220, flex: "1 1 240px" }}>
          <div style={styles.titleRow}>
            <h3 style={{ margin: 0 }}>Monitoreo #{index + 1}</h3>

            {/* Chip con contador */}
            <span style={styles.badge}>
              {filledRows}/{value.rows.length} filas
            </span>

            {/* Chip max */}
            <span style={styles.badgeSoft}>Max {MAX_ROWS}</span>
          </div>

          {collapsed && (
            <div style={styles.subText}>
              {value.fechaMonitoreo
                ? `Monitoreo: ${value.fechaMonitoreo}`
                : "Sin fecha monitoreo"}{" "}
              •{" "}
              {value.fechaPreliminar
                ? `Preliminar: ${value.fechaPreliminar}`
                : "Sin preliminar"}
            </div>
          )}
        </div>

        <div className="mc-actions" style={styles.actions}>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="mc-btn"
            style={styles.btn}
          >
            {collapsed ? "Expandir" : "Contraer"}
          </button>

          <button
            type="button"
            onClick={() => onRemove(index)}
            className="mc-btnDanger"
            style={styles.btnDanger}
          >
            Eliminar card
          </button>
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <>
          {/* Top fields */}
          <div className="mc-grid2" style={styles.grid2}>
            <label style={styles.label}>
              Fecha de monitoreo
              <input
                type="date"
                value={value.fechaMonitoreo || ""}
                onChange={(e) => updateField("fechaMonitoreo", e.target.value)}
                style={styles.input}
              />
            </label>

            {/* <label style={styles.label}>
              Fecha preliminar
              <input
                type="date"
                value={value.fechaPreliminar || ""}
                onChange={(e) => updateField("fechaPreliminar", e.target.value)}
                style={styles.input}
              />
            </label> */}
          </div>

          {/* Table / rows */}
          <div style={{ marginTop: 12 }}>
            {/* Desktop table header */}
            <div className="mc-tableHeader" style={styles.tableHeader}>
              <div>#</div>
              <div>Área de trabajo</div>
              <div>Largo</div>
              <div>Ancho</div>
              <div>Alto</div>
              <div>Punto focal</div>
              <div></div>
            </div>

            {value.rows.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                {/* Desktop table row */}
                <div className="mc-tableRow" style={styles.tableRow}>
                  <div style={styles.cell}>
                    {rowIndex + 1}
                  </div>

                  <div style={styles.cell}>
                  <input
                    style={styles.input}
                    placeholder="Ej: Área A"
                    value={row.areaTrabajo}
                    onChange={(e) =>
                      updateRow(rowIndex, "areaTrabajo", e.target.value)
                    }
                  />

                  </div>
                  <div style={styles.cellCompact}>
                  <input
                    style={styles.input}
                    placeholder="Largo"
                    inputMode="decimal"
                    value={row.largo}
                    onChange={(e) => updateRow(rowIndex, "largo", e.target.value)}
                  />
                  </div>
                  <div style={styles.cellCompact}>
                  <input
                    style={styles.input}
                    placeholder="Ancho"
                    inputMode="decimal"
                    value={row.ancho}
                    onChange={(e) => updateRow(rowIndex, "ancho", e.target.value)}
                  />
                  </div>
                  <div style={styles.cellCompact}>
                  <input
                    style={styles.input}
                    placeholder="Alto"
                    inputMode="decimal"
                    value={row.alto}
                    onChange={(e) => updateRow(rowIndex, "alto", e.target.value)}
                  />
                  </div>
                  <div style={styles.cellCompact}>
                  <label style={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={!!row.coincide}
                      onChange={(e) =>
                        updateRow(rowIndex, "coincide", e.target.checked)
                      }
                    />
                    Sí
                  </label>
                  </div>
                  <div style={styles.cellCompact}>
                  <button
                    type="button"
                    onClick={() => removeRow(rowIndex)}
                    style={styles.btnDangerSmall}
                  >
                    Quitar
                  </button>
                  </div>




                </div>

                {/* Mobile/Tablet row card */}
                <div className="mc-rowCard" style={styles.rowCard}>
                  <div style={styles.rowCardTop}>
                    <div style={{ fontWeight: 700, color: "#111827" }}>
                      Fila #{rowIndex + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRow(rowIndex)}
                      style={styles.btnDangerSmall}
                    >
                      Quitar
                    </button>
                  </div>

                  <div className="mc-rowGrid" style={styles.rowGrid}>
                    <label style={styles.label}>
                      Área de trabajo
                      <input
                        style={styles.input}
                        placeholder="Ej: Área A"
                        value={row.areaTrabajo}
                        onChange={(e) =>
                          updateRow(rowIndex, "areaTrabajo", e.target.value)
                        }
                      />
                    </label>

                    <label style={styles.label}>
                      Largo
                      <input
                        style={styles.input}
                        placeholder="Largo"
                        inputMode="decimal"
                        value={row.largo}
                        onChange={(e) =>
                          updateRow(rowIndex, "largo", e.target.value)
                        }
                      />
                    </label>

                    <label style={styles.label}>
                      Ancho
                      <input
                        style={styles.input}
                        placeholder="Ancho"
                        inputMode="decimal"
                        value={row.ancho}
                        onChange={(e) =>
                          updateRow(rowIndex, "ancho", e.target.value)
                        }
                      />
                    </label>

                    <label style={styles.label}>
                      Alto
                      <input
                        style={styles.input}
                        placeholder="Alto"
                        inputMode="decimal"
                        value={row.alto}
                        onChange={(e) =>
                          updateRow(rowIndex, "alto", e.target.value)
                        }
                      />
                    </label>

                    <label style={styles.checkboxRow}>
                      <input
                        type="checkbox"
                        checked={!!row.coincide}
                        onChange={(e) =>
                          updateRow(rowIndex, "coincide", e.target.checked)
                        }
                      />
                      Punto focal coincide
                    </label>
                  </div>
                </div>
              </React.Fragment>
            ))}

            <div style={styles.footerRow}>
              <button
                type="button"
                onClick={addRow}
                style={{
                  ...styles.btn,
                  opacity:
                    (value.rows?.length ?? 0) >= MAX_ROWS ? 0.5 : 1,
                  cursor:
                    (value.rows?.length ?? 0) >= MAX_ROWS
                      ? "not-allowed"
                      : "pointer",
                }}
                disabled={(value.rows?.length ?? 0) >= MAX_ROWS}
              >
                + Agregar fila
              </button>

              <div style={styles.hint}>
                {(value.rows?.length ?? 0) >= MAX_ROWS
                  ? `Llegaste al máximo de ${MAX_ROWS} filas`
                  : "Agrega filas según necesites"}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 16,
    background: "white",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    marginBottom: 16,
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },

  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  badge: {
    fontSize: 12,
    fontWeight: 700,
    color: "#111827",
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    padding: "2px 8px",
    borderRadius: 999,
  },

  badgeSoft: {
    fontSize: 12,
    fontWeight: 600,
    color: "#374151",
    background: "#fafafa",
    border: "1px solid #eeeeee",
    padding: "2px 8px",
    borderRadius: 999,
  },

  subText: { fontSize: 12, color: "#6b7280", marginTop: 6 },

  actions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "center",
    flex: "1 1 240px",
  },

  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },

  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "#374151" },

  input: {
    width: "100%",
    height: 38,                 // ✅ un poco más alto
    padding: "8px 12px",        // ✅ más aire interno
    borderRadius: 12,           // ✅ más moderno
    border: "1px solid #d1d5db",
    outline: "none",
    background: "white",
    boxSizing: "border-box",
  },


  tableHeader: {
    display: "grid",
    gridTemplateColumns: "40px 1.6fr 1fr 1fr 1fr 1.2fr 90px",
    columnGap: 16,
    gap: 10,
    fontSize: 12,
    color: "#374151",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 12,
    fontWeight: 700,
  },

  tableRow: {
    display: "grid",
    gridTemplateColumns: "40px 1.6fr 1fr 1fr 1fr 1.2fr 90px",
    columnGap: 16,
    gap: 10,
    padding: "12px 12px",
    borderBottom: "1px solid #f3f4f6",
    alignItems: "center",
  },

  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: "#111827",
    userSelect: "none",
  },

  rowCard: {
    display: "none",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    background: "#fff",
    boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
  },

  rowCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  rowGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },

  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    color: "#111827",
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fafafa",
  },

  footerRow: { marginTop: 10, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },

  hint: { fontSize: 12, color: "#6b7280" },

  btn: {
    border: "1px solid #111827",
    background: "white",
    color: "#111827",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },

  btnDanger: {
    border: "1px solid #ef4444",
    background: "white",
    color: "#ef4444",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },

  btnDangerSmall: {
    border: "1px solid #ef4444",
    background: "white",
    color: "#ef4444",
    padding: "6px 10px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
  cell:{
    padding: "6px 0",
  },
  cellCompact:{
    padding: "0",
  }
};
