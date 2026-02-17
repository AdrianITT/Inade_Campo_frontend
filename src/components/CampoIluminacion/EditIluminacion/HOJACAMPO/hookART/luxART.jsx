import { AutoComplete, Button, Form, Input, InputNumber, Switch } from "antd";
// import { excel } from "../stylesExcel";

const excel = {
  wrap: {
    width: "100%",
  },

  scroller: {
  maxWidth: "100%",
  maxHeight: "70vh",   // ✅ ajusta
  overflowX: "auto",
  overflowY: "auto",   // ✅
  WebkitOverflowScrolling: "touch",
  },

  table: {
    width: "max-content",
    minWidth: 1400,
    maxWidth: "none",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  },

  stickyHead: {
    position: "sticky",
    top: 0,
    zIndex: 3,
  },

  th: {
    background: "#f8fafc",
    fontSize: 12,
    fontWeight: 700,
    color: "#334155",
    borderBottom: "1px solid #e6eaf2",
    borderRight: "1px solid #e6eaf2",
    padding: "8px 10px",
    textAlign: "left",
    whiteSpace: "nowrap",
  },

  td: {
    borderBottom: "1px solid #e6eaf2",
    borderRight: "1px solid #e6eaf2",
    padding: 0,
    verticalAlign: "middle",
    background: "#fff",
  },

  cell: {
    padding: "2px 6px",
    display: "flex",          // ✅ para que justifyContent funcione
    alignItems: "center",
  },

  stickyCol: {
    position: "sticky",
    left: 0,
    zIndex: 2,
    background: "#fff",
  },

  inputCell: {               // ✅ alias correcto (tú estabas usando excel.inputCell)
    width: "100%",
    border: "none",
    boxShadow: "none",
    borderRadius: 0,
    padding: "6px 6px",
    background: "transparent",
  },

  actionBtn: { padding: "0 6px" },

  hint: {
    padding: "8px 10px",
    fontSize: 12,
    color: "#64748b",
    borderTop: "1px solid #e6eaf2",
    background: "#fff",
  },
};


export default function PuntosExcelSheetART({
  puntoFields,
  bloqueField,
  bloqueIdx,
  onRemovePoint,
  autoCompleteOptions,
  form,
  disabled,
}) {
  const nameBase = (pName, key) => [pName, key];

  const colW = {
    num: 80,
    area: 180,
    pos: 170,
    desc: 260,
    refl: 110,
    lux: 95,
    nivel: 120,
    actions: 90,
  };

  const td = (sticky = false) => ({
    ...excel.td,
    ...(sticky ? excel.stickyCol : null),
  });

  return (
<>
  <div style={excel.scroller}>  
        <table style={excel.table}>
          <thead>
            <tr>
              <th style={{ ...excel.th, ...excel.stickyHead, ...excel.stickyCol, width: colW.num }}>No.</th>
              <th style={{ ...excel.th, ...excel.stickyHead, width: colW.area }}>Área</th>
              <th style={{ ...excel.th, ...excel.stickyHead, width: colW.pos }}>Posición</th>
              <th style={{ ...excel.th, ...excel.stickyHead, width: colW.desc }}>Descripción</th>
              <th style={{ ...excel.th, ...excel.stickyHead, width: colW.refl }}>Refl. pared</th>
              <th style={{ ...excel.th, ...excel.stickyHead, width: colW.refl }}>Refl. plano</th>

              <th style={{ ...excel.th, ...excel.stickyHead, width: colW.lux }}>E2-1</th>
              <th style={{ ...excel.th, ...excel.stickyHead, width: colW.lux }}>E2-2</th>
              <th style={{ ...excel.th, ...excel.stickyHead, width: colW.lux }}>E2-3</th>

              <th style={{ ...excel.th, ...excel.stickyHead, width: colW.lux }}>E1-1</th>
              <th style={{ ...excel.th, ...excel.stickyHead, width: colW.lux }}>E1-2</th>
              <th style={{ ...excel.th, ...excel.stickyHead, width: colW.lux }}>E1-3</th>

              <th style={{ ...excel.th, ...excel.stickyHead, width: colW.nivel }}>Nivel mín.</th>
              <th style={{ ...excel.th, ...excel.stickyHead, width: colW.actions }}>Acción</th>
            </tr>
          </thead>

          <tbody>
            {puntoFields.map((pField) => {
              // ✅ OJO: ART usa "bloquesART"
              const basePath = ["bloquesART", bloqueField.name, "puntos", pField.name];

              return (
                <tr key={pField.key}>
                  <td style={td(true)}>
                    <div style={excel.cell}>
                      <Form.Item name={nameBase(pField.name, "numeroPunto")} style={{ margin: 0 }}>
                        <InputNumber
                          disabled={disabled}
                          min={1}
                          style={excel.inputCell}
                        />
                      </Form.Item>
                    </div>
                  </td>

                  <td style={td(false)}>
                    <div style={excel.cell}>
                      <Form.Item name={nameBase(pField.name, "areaMonitoreo")} style={{ margin: 0 }}>
                        <AutoComplete
                          disabled={disabled}
                          options={autoCompleteOptions}
                        >
                          <Input style={excel.inputCell} />
                        </AutoComplete>
                      </Form.Item>
                    </div>
                  </td>

                  <td style={td(false)}>
                    <div style={excel.cell}>
                      <Form.Item name={nameBase(pField.name, "posicionTrabajo")} style={{ margin: 0 }}>
                        <Input disabled={disabled} style={excel.inputCell} />
                      </Form.Item>
                    </div>
                  </td>

                  <td style={td(false)}>
                    <div style={excel.cell}>
                      <Form.Item name={nameBase(pField.name, "descripcionPunto")} style={{ margin: 0 }}>
                        <Input disabled={disabled} style={excel.inputCell} />
                      </Form.Item>
                    </div>
                  </td>

                  <td style={td(false)}>
                    <div style={{ ...excel.cell, justifyContent: "center" }}>
                      <Form.Item
                        name={nameBase(pField.name, "refl_paredes")}
                        valuePropName="checked"
                        style={{ margin: 0 }}
                      >
                        <Switch
                          disabled={disabled}
                          onChange={(checked) => {
                            if (checked) {
                              form.setFields([{ name: [...basePath, "refl_plano_trabajo"], value: false }]);
                            }
                          }}
                        />
                      </Form.Item>
                    </div>
                  </td>

                  <td style={td(false)}>
                    <div style={{ ...excel.cell, justifyContent: "center" }}>
                      <Form.Item
                        name={nameBase(pField.name, "refl_plano_trabajo")}
                        valuePropName="checked"
                        style={{ margin: 0 }}
                      >
                        <Switch
                          disabled={disabled}
                          onChange={(checked) => {
                            if (checked) {
                              form.setFields([{ name: [...basePath, "refl_paredes"], value: false }]);
                            }
                          }}
                        />
                      </Form.Item>
                    </div>
                  </td>

                  {["lux1E2", "lux2E2", "lux3E2"].map((k) => (
                    <td key={k} style={td(false)}>
                      <div style={excel.cell}>
                        <Form.Item name={nameBase(pField.name, k)} style={{ margin: 0 }}>
                          <Input disabled={disabled} style={excel.inputCell} inputMode="numeric" />
                        </Form.Item>
                      </div>
                    </td>
                  ))}

                  {["lux1E1", "lux2E1", "lux3E1"].map((k) => (
                    <td key={k} style={td(false)}>
                      <div style={excel.cell}>
                        <Form.Item name={nameBase(pField.name, k)} style={{ margin: 0 }}>
                          <Input disabled={disabled} style={excel.inputCell} inputMode="numeric" />
                        </Form.Item>
                      </div>
                    </td>
                  ))}

                  <td style={td(false)}>
                    <div style={excel.cell}>
                      <Form.Item name={nameBase(pField.name, "nivelMinimo")} style={{ margin: 0 }}>
                        <InputNumber disabled={disabled} min={0} step={0.01} style={excel.inputCell} />
                      </Form.Item>
                    </div>
                  </td>

                  <td style={td(false)}>
                    <div style={{ ...excel.cell, justifyContent: "center" }}>
                      <Button
                        danger
                        size="small"
                        style={excel.actionBtn}
                        disabled={disabled || puntoFields.length === 1}
                        onClick={() => onRemovePoint(pField.name)}
                      >
                        Quitar
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
  </div>


      <div style={excel.hint}>
        Tip: usa <b>Tab</b> para moverte como Excel. (Shift+Tab para regresar)
      </div>
</>
  );
}

