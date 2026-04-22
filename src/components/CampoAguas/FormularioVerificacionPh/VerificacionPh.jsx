import {
  Card,
  Row,
  Col,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Typography,
  Space,
  Radio,
  Button,
  Collapse,
  message,
  Modal,
  Checkbox,
  Alert,
} from "antd";
import {
  ExperimentOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import React, { useState } from "react";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import {
  createCalibracionPh,
  createCalibracionPhCampo,
  createCalibraionPhLaboratorio,
  createPuntoLaboratorio,
  createPuntoCampo,
  createLecturaVerificacionBulk,
} from "../../../apis/ApiCampo/VerificacionPhApi";
import {
  useBeforeUnload,
  useNavigationPrompt,
} from "../../hooks/DetectTabClosure";

const { Title, Text } = Typography;
const { Panel } = Collapse;

/* ---------- Configuración de bloques ---------- */
const LAB_PAIRS = [
  {
    numero: 1,
    certificado: { pref: "CertLab", titulo: "Estándar Certificado" },
    comercial: { pref: "ComLab", titulo: "Estándar Comercial" },
  },
  {
    numero: 2,
    certificado: { pref: "CertLab2", titulo: "Estándar Certificado (2)" },
    comercial: { pref: "ComLab2", titulo: "Estándar Comercial (2)" },
  },
  {
    numero: 3,
    certificado: { pref: "CertLab3", titulo: "Estándar Certificado (3)" },
    comercial: { pref: "ComLab3", titulo: "Estándar Comercial (3)" },
  },
];

const CAMPO_PAIRS = [
  {
    numero: 1,
    certificado: { pref: "CertCampo", titulo: "Estándar Certificado (Campo)" },
    comercial: { pref: "ComCampo", titulo: "Estándar Comercial (Campo)" },
  },
  {
    numero: 2,
    certificado: { pref: "CertCam2", titulo: "Estándar Certificado (Campo 2)" },
    comercial: { pref: "ComCamp2", titulo: "Estándar Comercial (Campo 2)" },
  },
  {
    numero: 3,
    certificado: { pref: "CertCam3", titulo: "Estándar Certificado (Campo 3)" },
    comercial: { pref: "ComCamp3", titulo: "Estándar Comercial (Campo 3)" },
  },
];

const SECCIONES = [
  {
    key: "laboratorio",
    titulo: "Calibración y Verificación en laboratorio",
    icon: <ExperimentOutlined />,
    color: "#1677ff",
    noteBg: "#f0f7ff",
    noteBorder: "#b7d8ff",
    noteColor: "#0958d9",
    nota:
      "Se debe calibrar a dos puntos, ejemplo: 7.00 - 4.00 o 7.00 - 10.00. Ya calibrado el equipo a dos puntos se deben realizar la comprobación.",
    pares: LAB_PAIRS,
  },
  {
    key: "campo",
    titulo: "Calibración y Verificación en campo",
    icon: <EnvironmentOutlined />,
    color: "#389e0d",
    noteBg: "#f6ffed",
    noteBorder: "#b7eb8f",
    noteColor: "#237804",
    nota:
      "Antes de realizar la calibración / verificación se debe utilizar la tira indicadora de pH para estimar el valor de pH de la muestra y poder seleccionar el rango a calibrar / verificar.",
    pares: CAMPO_PAIRS,
  },
];

const TODOS_LOS_BLOQUES = [
  ...LAB_PAIRS.flatMap((par) => [par.certificado, par.comercial]),
  ...CAMPO_PAIRS.flatMap((par) => [par.certificado, par.comercial]),
];

/* ---------- Estilos ---------- */
const scrollerStyle = {
  display: "flex",
  gap: 16,
  overflowX: "auto",
  overflowY: "hidden",
  paddingBottom: 12,
  scrollSnapType: "x proximity",
};

const pairCardStyle = {
  minWidth: 980,
  flex: "0 0 980px",
  scrollSnapAlign: "start",
  borderRadius: 16,
  border: "1px solid #edf0f3",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  background: "#fff",
};

/* ---------- Helpers ---------- */
function getLecturaPayload(pref, values, i) {
  return {
    lectura: values[`lectura${i}${pref}`] ?? null,
    temperatura: values[`tem${i}${pref}`] ?? null,
  };
}

function buildPuntoPayload(
  values,
  certPref,
  comPref,
  certLecturas,
  comLecturas,
  aceptacion
) {
  return {
    certificadoPh: values[`ph${certPref}`],
    certificadoHora: values[`hora${certPref}`]
      ? dayjs(values[`hora${certPref}`]).format("HH:mm")
      : null,
    certificadoMarca: values[`marca${certPref}`],
    certificadoLote: values[`lote${certPref}`],
    certificadoCaducidad: values[`caducidad${certPref}`]
      ? dayjs(values[`caducidad${certPref}`]).format("YYYY-MM-DD")
      : null,
    certificadoLectura: certLecturas[0] ?? null,
    certificadoLectura2: certLecturas[1] ?? null,
    certificadoLectura3: certLecturas[2] ?? null,

    comercialPh: values[`ph${comPref}`],
    comercialHora: values[`hora${comPref}`]
      ? dayjs(values[`hora${comPref}`]).format("HH:mm")
      : null,
    comercialMarca: values[`marca${comPref}`],
    comercialLote: values[`lote${comPref}`],
    comercialCaducidad: values[`caducidad${comPref}`]
      ? dayjs(values[`caducidad${comPref}`]).format("YYYY-MM-DD")
      : null,
    comercialLectura: comLecturas[0] ?? null,
    comercialLectura2: comLecturas[1] ?? null,
    comercialLectura3: comLecturas[2] ?? null,

    asectacion: aceptacion,
  };
}

/* ---------- Bloque individual ---------- */
function BloqueEstandar({ pref, titulo, onOpenBulk }) {
  return (
    <div
      style={{
        border: "1px solid #e8edf3",
        borderRadius: 14,
        padding: 16,
        background: "#ffffff",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#1f2937",
              lineHeight: 1.2,
              marginBottom: 4,
              wordBreak: "break-word",
            }}
          >
            {titulo}
          </div>
          <Text style={{ fontSize: 12, color: "#6b7280" }}>
            Captura del estándar
          </Text>
        </div>

        <Button size="small" type="link" onClick={onOpenBulk}>
          Replicar
        </Button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        <Form.Item label="pH" name={`ph${pref}`} style={{ marginBottom: 0 }}>
          <Input size="small" />
        </Form.Item>

        <Form.Item label="Hora" name={`hora${pref}`} style={{ marginBottom: 0 }}>
          <TimePicker size="small" format="HH:mm" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Marca" name={`marca${pref}`} style={{ marginBottom: 0 }}>
          <Input size="small" />
        </Form.Item>

        <Form.Item label="Lote" name={`lote${pref}`} style={{ marginBottom: 0 }}>
          <Input size="small" />
        </Form.Item>

        <div style={{ gridColumn: "1 / -1" }}>
          <Form.Item
            label="Caducidad"
            name={`caducidad${pref}`}
            style={{ marginBottom: 0 }}
          >
            <DatePicker
              size="small"
              format="YYYY-MM-DD"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#64748b",
            marginBottom: 10,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Lecturas y temperatura
        </div>

        <div
          style={{
            border: "1px solid #eaf0f6",
            borderRadius: 12,
            overflow: "hidden",
            background: "#fcfdff",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "72px 1fr 1fr",
              background: "#f8fafc",
              borderBottom: "1px solid #eaf0f6",
              fontSize: 12,
              fontWeight: 700,
              color: "#475569",
            }}
          >
            <div style={{ padding: "10px 12px" }}>N°</div>
            <div style={{ padding: "10px 12px", borderLeft: "1px solid #eaf0f6" }}>
              Lectura
            </div>
            <div style={{ padding: "10px 12px", borderLeft: "1px solid #eaf0f6" }}>
              Temp (°C)
            </div>
          </div>

          {[1, 2, 3].map((i, index) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "72px 1fr 1fr",
                alignItems: "start",
                borderBottom: index !== 2 ? "1px solid #eef2f7" : "none",
                background: index % 2 === 0 ? "#ffffff" : "#fbfdff",
              }}
            >
              <div
                style={{
                  padding: "12px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#334155",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                #{i}
              </div>

              <div
                style={{
                  padding: "8px 10px",
                  borderLeft: "1px solid #eef2f7",
                }}
              >
                <Form.Item
                  name={`lectura${i}${pref}`}
                  style={{ marginBottom: 0 }}
                >
                  <Input size="small" placeholder={`Lectura ${i}`} />
                </Form.Item>
              </div>

              <div
                style={{
                  padding: "8px 10px",
                  borderLeft: "1px solid #eef2f7",
                }}
              >
                <Form.Item
                  name={`tem${i}${pref}`}
                  style={{ marginBottom: 0 }}
                >
                  <Input size="small" placeholder="°C" />
                </Form.Item>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Componente principal ---------- */
export default function CalibracionLab() {
  const [form] = Form.useForm();
  const [bulkForm] = Form.useForm();

  const { id, idAguas } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [openBulk, setOpenBulk] = useState(false);

  useBeforeUnload(isDirty);
  useNavigationPrompt(isDirty);

  const CAMPOS_REPETIBLES = [
    { key: "ph", label: "pH" },
    { key: "marca", label: "Marca" },
    { key: "lote", label: "Lote" },
    { key: "caducidad", label: "Caducidad" },
  ];

  const abrirBulk = () => {
    bulkForm.setFieldsValue({
      campos: ["ph", "marca", "lote", "caducidad"],
      bloques: TODOS_LOS_BLOQUES.map((b) => b.pref),
      ph: "",
      marca: "",
      lote: "",
      caducidad: "",
    });
    setOpenBulk(true);
  };

  const abrirBulkDesde = (pref) => {
    const base = form.getFieldsValue([
      `ph${pref}`,
      `marca${pref}`,
      `lote${pref}`,
      `caducidad${pref}`,
    ]);

    bulkForm.setFieldsValue({
      campos: ["ph", "marca", "lote", "caducidad"],
      bloques: TODOS_LOS_BLOQUES.map((b) => b.pref),
      ph: base[`ph${pref}`] ?? "",
      marca: base[`marca${pref}`] ?? "",
      lote: base[`lote${pref}`] ?? "",
      caducidad: base[`caducidad${pref}`] ?? "",
    });

    setOpenBulk(true);
  };

  const aplicarBulk = async () => {
    const v = await bulkForm.validateFields();

    const patch = {};
    v.bloques.forEach((pref) => {
      v.campos.forEach((campo) => {
        patch[`${campo}${pref}`] = v[campo];
      });
    });

    form.setFieldsValue(patch);
    setIsDirty(true);
    setOpenBulk(false);
    message.success("Valores aplicados ✅");
  };

  const confirmarEnvio = (values) => {
    Modal.confirm({
      title: "¿Estás seguro de enviar la verificación de pH?",
      content: "Verifica que toda la información esté completa antes de continuar.",
      okText: "Sí, enviar",
      cancelText: "Cancelar",
      onOk: () => onFinish(values),
    });
  };

  const onFinish = async (values) => {
    setLoading(true);

    try {
      const bulkLecturasPayload = TODOS_LOS_BLOQUES.flatMap((bloque) =>
        [1, 2, 3].map((i) => getLecturaPayload(bloque.pref, values, i))
      );

      const { data: lecturasCreadas } = await createLecturaVerificacionBulk(
        bulkLecturasPayload
      );

      const totalEsperado = TODOS_LOS_BLOQUES.length * 3;
      if (
        !Array.isArray(lecturasCreadas) ||
        lecturasCreadas.length !== totalEsperado
      ) {
        throw new Error(
          `Se esperaban ${totalEsperado} lecturas y se recibieron ${
            lecturasCreadas?.length ?? 0
          }`
        );
      }

      const idsLecturas = lecturasCreadas.map((item) => item.id);
      let cursor = 0;

      const tomarTresLecturas = () => {
        const lote = idsLecturas.slice(cursor, cursor + 3);
        cursor += 3;
        return lote;
      };

      const laboratorio = await createCalibraionPhLaboratorio({});
      const campo = await createCalibracionPhCampo({});

      for (let i = 0; i < LAB_PAIRS.length; i++) {
        const par = LAB_PAIRS[i];
        const lecturasCert = tomarTresLecturas();
        const lecturasCom = tomarTresLecturas();

        await createPuntoLaboratorio({
          calibracion_laboratorio: laboratorio.data.id,
          numero_punto: par.numero,
          ...buildPuntoPayload(
            values,
            par.certificado.pref,
            par.comercial.pref,
            lecturasCert,
            lecturasCom,
            values[`aceptacionPar${i + 1}`]
          ),
        });
      }

      for (let i = 0; i < CAMPO_PAIRS.length; i++) {
        const par = CAMPO_PAIRS[i];
        const lecturasCert = tomarTresLecturas();
        const lecturasCom = tomarTresLecturas();

        await createPuntoCampo({
          calibracion_campo: campo.data.id,
          numero_punto: par.numero,
          ...buildPuntoPayload(
            values,
            par.certificado.pref,
            par.comercial.pref,
            lecturasCert,
            lecturasCom,
            values[`aceptacionPar${i + 4}`]
          ),
        });
      }

      await createCalibracionPh({
        calibracionVerificacion: id,
        calibracionPhLaboratorio: laboratorio.data.id,
        calibracionPhCampo: campo.data.id,
      });

      message.success("Formulario de pH guardado correctamente ✅");
      setIsDirty(false);

      setTimeout(() => {
        navigate(`/DetallesAguasResiduales/${idAguas}`);
      }, 1000);
    } catch (error) {
      console.error(error);
      message.error("Hubo un error al guardar los datos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card
        title="Calibración y Verificación de pH"
        bordered={false}
        style={{
          background: "#f5f7fa",
          borderRadius: 18,
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={confirmarEnvio}
          onValuesChange={() => setIsDirty(true)}
          scrollToFirstError
        >
          <Space style={{ marginBottom: 16 }}>
            <Button onClick={abrirBulk}>
              Aplicar pH / Marca / Lote / Caducidad a varios
            </Button>
          </Space>

          <Collapse
            accordion
            bordered={false}
            style={{ background: "transparent" }}
            expandIconPosition="end"
          >
            {SECCIONES.map((seccion, seccionIndex) => (
              <Panel
                key={seccion.key}
                header={
                  <div
                    style={{
                      padding: "20px 24px",
                      background: "#ffffff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      borderRadius: "12px 12px 0 0",
                      border: "1px solid #f0f0f0",
                      borderBottom: "none",
                    }}
                  >
                    <Title
                      level={4}
                      style={{
                        margin: "0 0 16px 0",
                        color: seccion.color,
                        fontSize: 18,
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      {seccion.icon}
                      {seccion.titulo}
                    </Title>

                    <div
                      style={{
                        padding: "16px 20px",
                        backgroundColor: seccion.noteBg,
                        border: `1px solid ${seccion.noteBorder}`,
                        borderRadius: 10,
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          color: seccion.noteColor,
                          lineHeight: 1.65,
                          fontWeight: 500,
                        }}
                      >
                        <strong>💡 Nota importante:</strong>
                        <br />
                        {seccion.nota}
                      </p>
                    </div>
                  </div>
                }
              >
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <Text style={{ color: "#64748b", fontSize: 13 }}>
                      Desliza horizontalmente para ver los 3 puntos del apartado.
                    </Text>
                  </div>

                  <div style={scrollerStyle}>
                    {seccion.pares.map((par, idx) => {
                      const aceptacionIndex =
                        seccionIndex === 0 ? idx + 1 : idx + 4;

                      return (
                        <Card
                          key={`${seccion.key}-${par.numero}`}
                          size="small"
                          style={pairCardStyle}
                          bodyStyle={{ padding: 16 }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: 14,
                            }}
                          >
                            <Title
                              level={5}
                              style={{
                                margin: 0,
                                fontSize: 16,
                                color: "#1f2937",
                              }}
                            >
                              Punto {par.numero}
                            </Title>

                            <Text style={{ fontSize: 12, color: "#64748b" }}>
                              {seccion.key === "laboratorio"
                                ? `Laboratorio ${idx + 1}`
                                : `Campo ${idx + 1}`}
                            </Text>
                          </div>

                          <Row gutter={[16, 16]} wrap={false} align="stretch">
                            <Col flex="1 1 460px" style={{ minWidth: 0 }}>
                              <BloqueEstandar
                                pref={par.certificado.pref}
                                titulo={par.certificado.titulo}
                                onOpenBulk={() =>
                                  abrirBulkDesde(par.certificado.pref)
                                }
                              />
                            </Col>

                            <Col flex="1 1 460px" style={{ minWidth: 0 }}>
                              <BloqueEstandar
                                pref={par.comercial.pref}
                                titulo={par.comercial.titulo}
                                onOpenBulk={() =>
                                  abrirBulkDesde(par.comercial.pref)
                                }
                              />
                            </Col>
                          </Row>

                          <div
                            style={{
                              border: "1px dashed #d9d9d9",
                              borderRadius: 10,
                              padding: 12,
                              backgroundColor: "#fcfcfc",
                              marginTop: 12,
                            }}
                          >
                            <Space
                              direction="vertical"
                              size={12}
                              style={{ width: "100%" }}
                            >
                              <div
                                style={{
                                  background: "#f9f9f9",
                                  borderRadius: "8px",
                                  padding: "12px",
                                  border: "1px solid #e8e8e8",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: "#595959",
                                    marginBottom: "8px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  📋 Criterios de Aceptación
                                </div>

                                <Space
                                  direction="vertical"
                                  size={6}
                                  style={{ width: "100%" }}
                                >
                                  <div
                                    style={{
                                      padding: "8px 12px",
                                      background: "#fff0f6",
                                      border: "1px solid #ffadd6",
                                      borderRadius: "6px",
                                      fontSize: "12px",
                                      lineHeight: "1.4",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontWeight: 600,
                                        color: "#c41d7f",
                                      }}
                                    >
                                      Criterio de aceptación:
                                    </span>{" "}
                                    ± 0.05 UpH del valor nominal del Estándar
                                  </div>

                                  <div
                                    style={{
                                      padding: "8px 12px",
                                      background: "#fff2f0",
                                      border: "1px solid #ffccc7",
                                      borderRadius: "6px",
                                      fontSize: "12px",
                                      lineHeight: "1.4",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontWeight: 600,
                                        color: "#cf1322",
                                      }}
                                    >
                                      Criterio de aceptación:
                                    </span>{" "}
                                    ± 0.03 UpH entre lecturas independientes
                                  </div>
                                </Space>
                              </div>

                              <Alert
                                type="info"
                                showIcon
                                message="Verificación importante"
                                description="Confirma que todas las lecturas cumplan con las tolerancias antes de proceder."
                                style={{
                                  fontSize: "13px",
                                  borderRadius: "8px",
                                }}
                              />

                              <Form.Item
                                label="¿Aceptado?"
                                name={`aceptacionPar${aceptacionIndex}`}
                                style={{ margin: "16px 0 0" }}
                              >
                                <Radio.Group size="small">
                                  <Radio value={true}>Sí</Radio>
                                  <Radio value={false}>No</Radio>
                                </Radio.Group>
                              </Form.Item>
                            </Space>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </Space>
              </Panel>
            ))}
          </Collapse>

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
            >
              Guardar
            </Button>
          </div>
        </Form>
      </Card>

      <Modal
        open={openBulk}
        title="Aplicar valores repetidos"
        onCancel={() => setOpenBulk(false)}
        onOk={aplicarBulk}
        okText="Aplicar"
        cancelText="Cancelar"
      >
        <Form form={bulkForm} layout="vertical">
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="ph" label="pH">
                <Input placeholder="Ej. 7.00" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item name="marca" label="Marca">
                <Input placeholder="Ej. Control Company" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item name="lote" label="Lote">
                <Input placeholder="Ej. CC805972" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label="Caducidad" name="caducidad">
                <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="campos"
            label="¿Qué campos quieres aplicar?"
            rules={[
              { required: true, message: "Selecciona al menos un campo" },
            ]}
          >
            <Checkbox.Group
              options={CAMPOS_REPETIBLES.map((c) => ({
                label: c.label,
                value: c.key,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="bloques"
            label="¿En qué bloques se aplicarán?"
            rules={[
              { required: true, message: "Selecciona al menos un bloque" },
            ]}
          >
            <Checkbox.Group
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
              options={TODOS_LOS_BLOQUES.map((b) => ({
                label: b.titulo,
                value: b.pref,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}