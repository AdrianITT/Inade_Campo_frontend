import { AutoComplete, Button, Form, Input, InputNumber, Switch } from "antd";
const excel = {
  table: {
    width: "max-content",
    minWidth: 1600,
    maxWidth: "none",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  },

  th: {
    position: "sticky",
    top: 0,
    zIndex: 3,
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
  },

  cell: { padding: "2px 6px" },

  stickyCol: {
    position: "sticky",
    left: 0,
    zIndex: 2,
    background: "#fff",
  },

  inputLikeCell: {
    width: "100%",
    border: "none",
    boxShadow: "none",
    borderRadius: 0,
    padding: "6px 6px",
    background: "transparent",
  },

  actionBtn: { padding: "0 6px" },
};

export default    function PuntosExcelSheet({
      puntoFields,
      bloqueField,
      blockIndexGlobal,
      onRemovePoint,
      autoCompleteOptions,
      syncSharedPointField,
      form,
      disabled,
    }) {
      const nameBase = (pName, key) => [pName, key];
  
      const cellStyle = (isSticky = false) => ({
        ...excel.td,
        ...(isSticky ? excel.stickyCol : null),
      });
  
      const colW = {
        num: 90,
        area: 180,
        pos: 170,
        desc: 260,
        refl: 130,
        lux: 110,
        nivel: 140,
        actions: 90,
      };
  
      return (
        <table style={excel.table}>
          <thead>
            <tr>
              <th style={{ ...excel.th, ...excel.stickyCol, width: colW.num }}>No.</th>
              <th style={{ ...excel.th, width: colW.area }}>Área</th>
              <th style={{ ...excel.th, width: colW.pos }}>Posición</th>
              <th style={{ ...excel.th, width: colW.desc }}>Descripción</th>
              <th style={{ ...excel.th, width: colW.refl }}>Refl. pared</th>
              <th style={{ ...excel.th, width: colW.refl }}>Refl. plano</th>
  
              <th style={{ ...excel.th, width: colW.lux }}>Lux E2-1</th>
              <th style={{ ...excel.th, width: colW.lux }}>Lux E2-2</th>
              <th style={{ ...excel.th, width: colW.lux }}>Lux E2-3</th>
  
              <th style={{ ...excel.th, width: colW.lux }}>Lux E1-1</th>
              <th style={{ ...excel.th, width: colW.lux }}>Lux E1-2</th>
              <th style={{ ...excel.th, width: colW.lux }}>Lux E1-3</th>
  
              <th style={{ ...excel.th, width: colW.nivel }}>Nivel mín.</th>
              <th style={{ ...excel.th, width: colW.actions }}>Acción</th>
            </tr>
          </thead>
  
          <tbody>
            {puntoFields.map((pField) => {
              const basePath = ["bloques", bloqueField.name, "puntos", pField.name];
  
              return (
                <tr key={pField.key}>
                  <td style={cellStyle(true)}>
                    <div style={excel.cell}>
                      <Form.Item name={nameBase(pField.name, "numeroPunto")} style={{ margin: 0 }}>
                        <InputNumber
                          disabled={disabled}
                          min={1}
                          style={excel.inputLikeCell}
                          onChange={(val) =>
                            syncSharedPointField(blockIndexGlobal, pField.name, "numeroPunto", val)
                          }
                        />
                      </Form.Item>
                    </div>
                  </td>
  
                  <td style={cellStyle(false)}>
                    <div style={excel.cell}>
                      <Form.Item name={nameBase(pField.name, "areaMonitoreo")} style={{ margin: 0 }}>
                        <AutoComplete
                          disabled={disabled}
                          options={autoCompleteOptions}
                          onChange={(val) =>
                            syncSharedPointField(blockIndexGlobal, pField.name, "areaMonitoreo", val)
                          }
                        >
                          <Input style={excel.inputLikeCell} />
                        </AutoComplete>
                      </Form.Item>
                    </div>
                  </td>
  
                  <td style={cellStyle(false)}>
                    <div style={excel.cell}>
                      <Form.Item name={nameBase(pField.name, "posicionTrabajo")} style={{ margin: 0 }}>
                        <Input
                          disabled={disabled}
                          style={excel.inputLikeCell}
                          onChange={(e) =>
                            syncSharedPointField(
                              blockIndexGlobal,
                              pField.name,
                              "posicionTrabajo",
                              e.target.value
                            )
                          }
                        />
                      </Form.Item>
                    </div>
                  </td>
  
                  <td style={cellStyle(false)}>
                    <div style={excel.cell}>
                      <Form.Item name={nameBase(pField.name, "descripcionPunto")} style={{ margin: 0 }}>
                        <Input
                          disabled={disabled}
                          style={excel.inputLikeCell}
                          onChange={(e) =>
                            syncSharedPointField(
                              blockIndexGlobal,
                              pField.name,
                              "descripcionPunto",
                              e.target.value
                            )
                          }
                        />
                      </Form.Item>
                    </div>
                  </td>
  
                  <td style={cellStyle(false)}>
                    <div style={{ ...excel.cell, display: "flex", justifyContent: "center" }}>
                      <Form.Item
                        name={nameBase(pField.name, "refl_paredes")}
                        valuePropName="checked"
                        style={{ margin: 0 }}
                      >
                        <Switch
                          disabled={disabled}
                          onChange={(checked) => {
                            if (checked) {
                              form.setFields([
                                { name: [...basePath, "refl_plano_trabajo"], value: false },
                              ]);
                            }
                          }}
                        />
                      </Form.Item>
                    </div>
                  </td>
  
                  <td style={cellStyle(false)}>
                    <div style={{ ...excel.cell, display: "flex", justifyContent: "center" }}>
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
                    <td key={k} style={cellStyle(false)}>
                      <div style={excel.cell}>
                        <Form.Item name={nameBase(pField.name, k)} style={{ margin: 0 }}>
                          <Input disabled={disabled} style={excel.inputLikeCell} />
                        </Form.Item>
                      </div>
                    </td>
                  ))}
  
                  {["lux1E1", "lux2E1", "lux3E1"].map((k) => (
                    <td key={k} style={cellStyle(false)}>
                      <div style={excel.cell}>
                        <Form.Item name={nameBase(pField.name, k)} style={{ margin: 0 }}>
                          <Input disabled={disabled} style={excel.inputLikeCell} />
                        </Form.Item>
                      </div>
                    </td>
                  ))}
  
                  <td style={cellStyle(false)}>
                    <div style={excel.cell}>
                      <Form.Item name={nameBase(pField.name, "nivelMinimo")} style={{ margin: 0 }}>
                        <InputNumber
                          disabled={disabled}
                          min={0}
                          step={0.01}
                          style={excel.inputLikeCell}
                        />
                      </Form.Item>
                    </div>
                  </td>
  
                  <td style={cellStyle(false)}>
                    <div style={{ ...excel.cell, display: "flex", justifyContent: "center" }}>
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
      );
    }