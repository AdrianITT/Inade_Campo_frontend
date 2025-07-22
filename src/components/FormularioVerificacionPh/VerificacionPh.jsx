
import {
     Card, Row, Col, Form, Input, DatePicker, TimePicker,
     Typography, Space, Radio, Button, Collapse
} from "antd";
const { Title } = Typography;
const { Panel } = Collapse;

/* ---------- Bloque individual ---------- */
function BloqueEstandar({ pref, titulo }) {
     const itemProps = { size: "small", style: { width: "100%" } };
     const cfg = { labelCol: { span: 9 }, wrapperCol: { span: 15 }, style: { marginBottom: 6 } };
     return (
          <Space direction="vertical" size={4} style={{ width: "100%" }}>
               <Title level={5} style={{ margin: 0 }}>{titulo}</Title>
               <Form.Item label="pH" name={`ph${pref}`} {...cfg}><Input {...itemProps} /></Form.Item>
               <Form.Item label="Hora" name={`hora${pref}`} {...cfg}>
                    <TimePicker format="HH:mm" style={{ width: "100%" }} {...itemProps} />
               </Form.Item>
               <Form.Item label="Marca" name={`marca${pref}`} {...cfg}><Input {...itemProps} /></Form.Item>
               <Form.Item label="Lote" name={`lote${pref}`} {...cfg}><Input {...itemProps} /></Form.Item>
               <Form.Item label="Caducidad" name={`caducidad${pref}`} {...cfg}>
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
     );
}
const onFinish = (values) => {
     console.log(values);
}

/* ---------- Componente principal ---------- */
export default function CalibracionLab() {
     const [form] = Form.useForm();
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
          onFinish={onFinish}
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
                              <Title level={4} style={{ marginBottom: 0, color: "#1890ff" }}>
                                   {filaIdx === 0
                                        ? "Calibración y Verificación en laboratorio"
                                        : "Calibración y Verificación en campo"}
                              </Title>
                         }
                         key={filaIdx}
                         style={{
                              background: "#fff",
                              borderRadius: 8,
                              marginBottom: 16,
                              border: "1px solid #e6e6e6",
                              boxShadow: "0 2px 8px #f0f1f2"
                         }}
                    >
                         <Row gutter={[24, 32]}>
                              {fila.map((par, parIdx) => (
                                   <Col key={parIdx} xs={24} md={12} lg={12}>
                                        {/* --- los dos bloques --- */}
                                        <Row gutter={16}>
                                             {par.map(b => (
                                                  <Col key={b.pref} xs={24} lg={12}>
                                                       <BloqueEstandar pref={b.pref} titulo={b.titulo} />
                                                  </Col>
                                             ))}
                                        </Row>
                                        {/* --- radio del par --- */}
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
                                        {/* Solo en el segundo punto de campo */}
                                        {filaIdx === 1 && parIdx === 1 && (
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
                                        )}
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
