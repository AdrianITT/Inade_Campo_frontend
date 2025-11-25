
import {
     Card, Row, Col, Form, Input, DatePicker, TimePicker,
     Typography, Space, Radio, Button, Collapse, message,
     Modal, Tag, Alert
} from "antd";
import { ExperimentOutlined, EnvironmentOutlined } from '@ant-design/icons';
import React, { useState} from "react";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import {createCalibracionPh,
createCalibracionPhCampo,
createCalibraionPhLaboratorio,
createPrimerPuntoLaboratorio,
createSegundoPuntoLaboratorio,
createPrimerPuntoCampo,
createSegundoPuntoCampo,
createLecturaVerificacion,
createLecturaVerificacionBulk} from "../../../apis/ApiCampo/VerificacionPhApi"
import { useBeforeUnload, useNavigationPrompt} from "../../hooks/DetectTabClosure";
const { Title } = Typography;
const { Panel } = Collapse;



/* ---------- Bloque individual ---------- */
function BloqueEstandar({ pref, titulo }) {
     const itemProps = { size: "small", style: { width: "100%" } };
     const cfg = { labelCol: { span: 9 }, wrapperCol: { span: 15 }, style: { marginBottom: 6 } };
     return (
          <div
          style={{
          border: "1px solid #d9d9d9",   // color gris claro de Ant Design
          borderRadius: 8,
          padding: 16,
          backgroundColor: "#fafafa",    // opcional para mejor contraste
          }}
          >
          <Space direction="vertical" size={4} style={{ width: "100%" }}>
               <Title level={5} style={{ margin: 0 }}>{titulo}</Title>
               <Form.Item label="pH:" name={`ph${pref}`} {...cfg}><Input {...itemProps} /></Form.Item>
               <Form.Item label="Hora:" name={`hora${pref}`} {...cfg}>
                    <TimePicker format="HH:mm" style={{ width: "100%" }} {...itemProps} />
               </Form.Item>
               <Form.Item label="Marca:" name={`marca${pref}`} {...cfg}><Input {...itemProps} /></Form.Item>
               <Form.Item label="Lote:" name={`lote${pref}`} {...cfg}><Input {...itemProps} /></Form.Item>
               <Form.Item label="Caducidad:" name={`caducidad${pref}`} {...cfg}>
                    <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} {...itemProps} />
               </Form.Item>
               {[1, 2, 3].map(i => (
                    <Row key={i} gutter={8}>
                         <Col span={12}>
                              <Form.Item label={`Lectura ${i}`} name={`lectura${i}${pref}`} {...cfg}><Input {...itemProps} /></Form.Item>
                         </Col>
                         <Col span={12}>
                              <Form.Item label={`Temp ${i} (°C)`} name={`tem${i}${pref}`} {...cfg}><Input {...itemProps} /></Form.Item>
                         </Col>
                    </Row>
               ))}
          </Space>
          </div>
     );
}

/* ---------- Componente principal ---------- */
export default function CalibracionLab() {
     const [form] = Form.useForm();
     const { id, idAguas } = useParams();
     const navigate = useNavigate();
     const [loading, setLoading] = useState(false);
     const [isDirty, setIsDirty] = useState(false);
     useBeforeUnload(isDirty);
     
     useNavigationPrompt(isDirty);
     
     /** 1.  lista de bloques en el orden deseado */
     const bloques = [
          { pref: "CertLab", titulo: "Estándar Certificado" },
          { pref: "ComLab", titulo: "Estándar Comercial" },
          { pref: "CertLab2", titulo: "Estándar Certificado (2)" },
          { pref: "ComLab2", titulo: "Estándar Comercial (2)" },
          { pref: "CertCampo", titulo: "Estándar Certificado (Campo)" },
          { pref: "ComCampo", titulo: "Estándar Comercial (Campo)" },
          { pref: "CertCam2", titulo: "Estándar Certificado (Campo 2)" },
          { pref: "ComCamp2", titulo: "Estándar Comercial (Campo 2)" },
     ];

     const confirmarEnvio = (values) => {
       Modal.confirm({
         title: "¿Estás seguro de enviar la verificación de Ph?",
         content: "Verifica que toda la información esté completa antes de continuar.",
         okText: "Sí, enviar",
         cancelText: "Cancelar",
         onOk: () => onFinish(values),  // llama a la función real de envío
       });
       };
     
     const onFinish = async (values) => {
          // console.log(values);
          setLoading(true);
          try {
          // 1. Crear todas las lecturas (24)
          const bulkLecturasPayload = [];

          ["CertLab", "ComLab", "CertLab2", "ComLab2", "CertCampo", "ComCampo", "CertCam2", "ComCamp2"].forEach((prefijo) => {
          for (let i = 1; i <= 3; i++) {
          bulkLecturasPayload.push({
               lectura: values[`lectura${i}${prefijo}`],
               temperatura: values[`tem${i}${prefijo}`]
          });
          }
          });

          const { data: lecturasCreadas } = await createLecturaVerificacionBulk(bulkLecturasPayload);
          const [
               l1, l2, l3, l4, l5, l6,
               l7, l8, l9, l10, l11, l12,
               l13, l14, l15, l16, l17, l18,
               l19, l20, l21, l22, l23, l24
               ] = lecturasCreadas.map(item => item.id);

          // const createLectura = async (lectura, temp) => {
          //      const { data } = await createLecturaVerificacion({ lectura, temperatura: temp });
          //      return data.id;
          // };
     
          // const crearGrupoLecturas = async (prefijo) => {
          //      const ids = [];
          //      for (let i = 1; i <= 3; i++) {
          //      const lectura = values[`lectura${i}${prefijo}`];
          //      const temp = values[`tem${i}${prefijo}`];
          //      ids.push(await createLectura(lectura, temp));
          //      }
          //      return ids;
          // };
     
          // const [l1, l2, l3] = await crearGrupoLecturas("CertLab");
          // const [l4, l5, l6] = await crearGrupoLecturas("ComLab");
          // const [l7, l8, l9] = await crearGrupoLecturas("CertLab2");
          // const [l10, l11, l12] = await crearGrupoLecturas("ComLab2");
          // const [l13, l14, l15] = await crearGrupoLecturas("CertCampo");
          // const [l16, l17, l18] = await crearGrupoLecturas("ComCampo");
          // const [l19, l20, l21] = await crearGrupoLecturas("CertCam2");
          // const [l22, l23, l24] = await crearGrupoLecturas("ComCamp2");
     
          // 2. Crear los puntos
          const punto1 = await createPrimerPuntoLaboratorio({
               certificadoPh: values.phCertLab,
               certificadoHora: dayjs(values.horaCertLab).format("HH:mm"),
               certificadoMarca: values.marcaCertLab,
               certificadoLote: values.loteCertLab,
               certificadoCaducidad: dayjs(values.caducidadCertLab).format("YYYY-MM-DD"),
               certificadoLectura: l1,
               certificadoLectura2: l2,
               certificadoLectura3: l3,
               comercialPh: values.phComLab,
               comercialHora: dayjs(values.horaComLab).format("HH:mm"),
               comercialMarca: values.marcaComLab,
               comercialLote: values.loteComLab,
               comercialCaducidad: dayjs(values.caducidadComLab).format("YYYY-MM-DD"),
               comercialLectura: l4,
               comercialLectura2: l5,
               comercialLectura3: l6,
               asectacion: values.aceptacionPar1
          });
     
          const punto2 = await createSegundoPuntoLaboratorio({
               certificadoPh: values.phCertLab2,
               certificadoHora: dayjs(values.horaCertLab2).format("HH:mm"),
               certificadoMarca: values.marcaCertLab2,
               certificadoLote: values.loteCertLab2,
               certificadoCaducidad: dayjs(values.caducidadCertLab2).format("YYYY-MM-DD"),
               certificadoLectura: l7,
               certificadoLectura2: l8,
               certificadoLectura3: l9,
               comercialPh: values.phComLab2,
               comercialHora: dayjs(values.horaComLab2).format("HH:mm"),
               comercialMarca: values.marcaComLab2,
               comercialLote: values.loteComLab2,
               comercialCaducidad: dayjs(values.caducidadComLab2).format("YYYY-MM-DD"),
               comercialLectura: l10,
               comercialLectura2: l11,
               comercialLectura3: l12,
               asectacion: values.aceptacionPar2
          });
     
          const punto3 = await createPrimerPuntoCampo({
               certificadoPh: values.phCertCampo,
               certificadoHora: dayjs(values.horaCertCampo).format("HH:mm"),
               certificadoMarca: values.marcaCertCampo,
               certificadoLote: values.loteCertCampo,
               certificadoCaducidad: dayjs(values.caducidadCertCampo).format("YYYY-MM-DD"),
               certificadoLectura: l13,
               certificadoLectura2: l14,
               certificadoLectura3: l15,
               comercialPh: values.phComCampo,
               comercialHora: dayjs(values.horaComCampo).format("HH:mm"),
               comercialMarca: values.marcaComCampo,
               comercialLote: values.loteComCampo,
               comercialCaducidad: dayjs(values.caducidadComCampo).format("YYYY-MM-DD"),
               comercialLectura: l16,
               comercialLectura2: l17,
               comercialLectura3: l18,
               asectacion: values.aceptacionPar3
          });
     
          const punto4 = await createSegundoPuntoCampo({
               certificadoPh: values.phCertCam2,
               certificadoHora: dayjs(values.horaCertCam2).format("HH:mm"),
               certificadoMarca: values.marcaCertCam2,
               certificadoLote: values.loteCertCam2,
               certificadoCaducidad: dayjs(values.caducidadCertCam2).format("YYYY-MM-DD"),
               certificadoLectura: l19,
               certificadoLectura2: l20,
               certificadoLectura3: l21,
               comercialPh: values.phComCamp2,
               comercialHora: dayjs(values.horaComCamp2).format("HH:mm"),
               comercialMarca: values.marcaComCam2,
               comercialLote: values.loteComCamp2,
               comercialCaducidad:dayjs(values.caducidadComCamp2).format("YYYY-MM-DD"),
               comercialLectura: l22,
               comercialLectura2: l23,
               comercialLectura3: l24,
               asectacion: values.aceptacionPar4
          });
          console.log("punto1.id",punto1.data.id)
          console.log("punto2.id",punto2.data.id)
          console.log("punto3.id",punto3.data.id)
          console.log("punto4.id",punto4.data.id)
          // 3. Crear agrupadores laboratorio/campo
          const laboratorio = await createCalibraionPhLaboratorio({
               primerPuntoLaboratorio: punto1.data.id,
               segundoPuntoLaboratorio: punto2.data.id
          });
     
          const campo = await createCalibracionPhCampo({
               primerPuntoCampo: punto3.data.id,
               segundoPuntoCampo: punto4.data.id,
               usoPh: values.tiraPhUtilizada,
               rangoA: values.rangoMin,
               rangoB: values.rangoMax
          });
     
          // 4. Crear final `CalibracionPh`
          await createCalibracionPh({
               calibracionVerificacion: id, // asegúrate que está disponible
               calibracionPhLaboratorio: laboratorio.data.id,
               calibracionPhCampo: campo.data.id
          });
     
          message.success("Formulario de pH guardado correctamente ✅");
          } catch (error) {
          console.error(error);
          message.error("Hubo un error al guardar los datos");
          }finally{
                 setIsDirty(false);
          setTimeout(() => {
               navigate(`/DetallesAguasResiduales/${idAguas}`); // regresar a la página anterior
               }, 1000);
               setLoading(false);
          }
     
     }
     /** 2.  divide en pares → [[b0,b1], [b2,b3], ...] */
     const pares = [];
     for (let i = 0; i < bloques.length; i += 2) {
          pares.push(bloques.slice(i, i + 2));
     }

     // Agrupa cada 2 pares (4 bloques) en un grupo
     const paresEnFila = [];
     for (let j = 0; j < pares.length; j += 2) {
          paresEnFila.push(pares.slice(j, j + 2));
     }

return (
<Card
     title="Calibración y Verificación de Ph"
     bordered={false}
     style={{ background: "#f5f7fa" }}
>
     <Form
          form={form}
          layout="vertical"
          onFinish={confirmarEnvio}
          onValuesChange={()=> setIsDirty(true)}
          scrollToFirstError
     >
          <Collapse
               accordion
               bordered={false}
               style={{ background: "transparent" }}
               expandIconPosition="end"
          >
               {paresEnFila.map((fila, filaIdx) => (
                    <Panel
               header={
               <div style={{ 
               padding: '20px 24px',
               background: '#ffffff',
               boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
               borderRadius: '12px 12px 0 0',
               border: '1px solid #f0f0f0',
               borderBottom: 'none'
               }}>
               <Title level={4} style={{ 
                    margin: '0 0 16px 0', 
                    color: '#1890ff',
                    fontSize: '18px',
                    fontWeight: 600,
                    letterSpacing: '-0.02em'
               }}>
                    {filaIdx === 0
                    ? "🔬 Calibración y Verificación en laboratorio"
                    : "🌱 Calibración y Verificación en campo"}
               </Title>
               
               <div style={{
                    padding: '16px 20px',
                    backgroundColor: '#f6ffed',
                    border: '1px solid #b7eb8f',
                    borderRadius: '8px',
                    position: 'relative'
               }}>
                    <div style={{
                    position: 'absolute',
                    left: '20px',
                    top: '16px',
                    width: '4px',
                    height: '20px',
                    backgroundColor: '#52c41a',
                    borderRadius: '2px'
                    }}></div>
                    <p style={{ 
                    margin: 0, 
                    paddingLeft: '20px',
                    fontSize: '13px', 
                    color: '#389e0d',
                    lineHeight: '1.6',
                    fontWeight: 500
                    }}>
                    <strong style={{ color: '#237804' }}>💡 Nota importante:</strong><br/>
                    {filaIdx === 0
                         ? "Se debe calibrar a dos puntos, ejemplo: 7.00 - 4.00 o 7.00 - 10.00 ya calibrado el equipo a dos puntos se deben realizar la comprobación"
                         : "Antes de realizar la Calibración / Verificación se debe utilizar la tira indicadora de PH para estimar el valor de PH de la muestra y poder seleccionar el rango a Calibrar / Verificar"}
                    </p>
               </div>
               </div>
               }
                    >
                         <Row gutter={[16, 24]}>
                              {/* Solo en el segundo punto de campo */}
                              {filaIdx === 1 && (
                                   <Col span={24} >
                                   <div style={{
                                             padding: '12px 16px',
                                             border: '1px solid #f0f0f0',
                                             borderRadius: 8,
                                             background: '#fff',
                                        }}
                                        >
                                        <Space
                                             align="center"
                                             size={16}
                                             wrap
                                             style={{ width: '100%', justifyContent: 'center' }}  // ⬅️ CENTRA
                                        >
                                             <Form.Item
                                                  label="¿Se utilizó la tira pH?"
                                                  name="tiraPhUtilizada"
                                                  style={{ margin: "16px 0 8px" }}
                                             >
                                                  <Radio.Group size="small">
                                                       <Radio value={true}>Sí</Radio>
                                                       <Radio value={false}>No</Radio>
                                                  </Radio.Group>
                                             </Form.Item>
                                             <Form.Item
                                                  label="Rango a calibrar"
                                                  style={{ margin: "8px 0 24px" }}
                                             >
                                                  <Input.Group compact>
                                                       <Form.Item
                                                            name="rangoMin"
                                                            noStyle
                                                       >
                                                            <Input style={{ width: 120 }} placeholder="Mínimo" />
                                                       </Form.Item>
                                                       <span style={{ margin: "0 8px" }}>a</span>
                                                       <Form.Item
                                                            name="rangoMax"
                                                            noStyle
                                                       >
                                                            <Input style={{ width: 120 }} placeholder="Máximo" />
                                                       </Form.Item>
                                                  </Input.Group>
                                             </Form.Item>
                                        </Space>
                                   </div>
                                   </Col>
                              )}
                              {fila.map((par, parIdx) => (
                                   <Col key={parIdx} xs={24} sm={24} md={12} lg={12}>
                                        {/* --- los dos bloques --- */}
                                        <Row gutter={16}>
                                             {par.map(b => (
                                                  <Col key={b.pref} xs={24} sm={24} lg={12}>
                                                       <BloqueEstandar pref={b.pref} titulo={b.titulo} />
                                                  </Col>
                                             ))}
                                        </Row>
                                        {/* --- radio del par --- */}
                                        <div 
                                             style={{
                                             border: "1px dashed #d9d9d9",
                                             borderRadius: 10,
                                             padding: 12,
                                             backgroundColor: "#fcfcfc",
                                             marginTop: 12,
                                             }}
                                                                                     >
                                             <Space direction="vertical" size={12} style={{ width: "100%" }}>
                                                  <div style={{
                                                  background: '#f9f9f9',
                                                  borderRadius: '8px',
                                                  padding: '12px',
                                                  border: '1px solid #e8e8e8'
                                                  }}>
                                                  <div style={{
                                                       fontSize: '13px',
                                                       fontWeight: 600,
                                                       color: '#595959',
                                                       marginBottom: '8px',
                                                       display: 'flex',
                                                       alignItems: 'center',
                                                       gap: '6px'
                                                  }}>
                                                       📋 Criterios de Aceptación
                                                  </div>
                                                  
                                                  <Space direction="vertical" size={6} style={{ width: "100%" }}>
                                                       <div style={{
                                                       padding: '8px 12px',
                                                       background: '#fff0f6',
                                                       border: '1px solid #ffadd6',
                                                       borderRadius: '6px',
                                                       fontSize: '12px',
                                                       lineHeight: '1.4'
                                                       }}>
                                                       <span style={{ fontWeight: 600, color: '#c41d7f' }}>Criterio de aceptación:</span> ± 0.05 UpH del valor nominal del Estándar
                                                       </div>
                                                       
                                                       <div style={{
                                                       padding: '8px 12px',
                                                       background: '#fff2f0',
                                                       border: '1px solid #ffccc7',
                                                       borderRadius: '6px',
                                                       fontSize: '12px',
                                                       lineHeight: '1.4'
                                                       }}>
                                                       <span style={{ fontWeight: 600, color: '#cf1322' }}>Criterio de aceptación:</span> ± 0.03 UpH entre lecturas independientes
                                                       </div>
                                                  </Space>
                                                  </div>
                                                  
                                                  <Alert
                                                  type="info"
                                                  showIcon
                                                  message="Verificación importante"
                                                  description="Confirma que todas las lecturas cumplan con las tolerancias antes de proceder."
                                                  style={{
                                                       fontSize: '13px',
                                                       borderRadius: '8px'
                                                  }}
                                                  />


                                        <Form.Item
                                             label="¿Aceptado?"
                                             name={`aceptacionPar${filaIdx * 2 + parIdx + 1}`}
                                             style={{ margin: "16px 0 24px" }}
                                        >
                                             <Radio.Group size="small">
                                                  <Radio value={true}>Sí</Radio>
                                                  <Radio value={false}>No</Radio>
                                             </Radio.Group>
                                        </Form.Item>
                                        </Space>
                                        </div>
                                        {/* Solo en el segundo punto de campo */}
                                        {/* {filaIdx === 1 && parIdx === 1 && (
                                             <>
                                                  <Form.Item
                                                       label="¿Se utilizó la tira pH?"
                                                       name="tiraPhUtilizada"
                                                       style={{ margin: "16px 0 8px" }}
                                                  >
                                                       <Radio.Group size="small">
                                                            <Radio value={true}>Sí</Radio>
                                                            <Radio value={false}>No</Radio>
                                                       </Radio.Group>
                                                  </Form.Item>
                                                  <Form.Item
                                                       label="Rango"
                                                       style={{ margin: "8px 0 24px" }}
                                                  >
                                                       <Input.Group compact>
                                                            <Form.Item
                                                                 name="rangoMin"
                                                                 noStyle
                                                            >
                                                                 <Input style={{ width: 100 }} placeholder="Mínimo" />
                                                            </Form.Item>
                                                            <span style={{ margin: "0 8px" }}>a</span>
                                                            <Form.Item
                                                                 name="rangoMax"
                                                                 noStyle
                                                            >
                                                                 <Input style={{ width: 100 }} placeholder="Máximo" />
                                                            </Form.Item>
                                                       </Input.Group>
                                                  </Form.Item>
                                             </>
                                        )} */}
                                   </Col>
                              ))}
                         </Row>
                    </Panel>
               ))}
          </Collapse>
          <div style={{ textAlign: "right", marginTop: 24 }}>
               <Button type="primary" htmlType="submit" size="large">
                    Guardar
               </Button>
          </div>
     </Form>
</Card>
);
}
