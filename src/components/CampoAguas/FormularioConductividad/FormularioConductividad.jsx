import React,{useState, useEffect} from "react";
import { 
     Form,
     Input, 
     DatePicker, 
     Divider, 
     Typography, 
     Row, 
     Col, 
     TimePicker, 
     Radio, 
     Button, 
     Collapse, 
     Modal,
     AutoComplete,
} from "antd";
import { handleSubmitConductividad } from "./handleSubmitConductividad";
import { useParams, useNavigate } from "react-router-dom";
import { useBeforeUnload, useNavigationPrompt} from "../../hooks/DetectTabClosure";
import { useBlocker } from "react-router-dom";

const { Title } = Typography;


const FormularioConductividad = () => {
     const { id } = useParams();
     const {Panel} =Collapse;
     const navigate = useNavigate();
     const [isDirty, setIsDirty] = useState(false);
     const [form] = Form.useForm();
     useBeforeUnload(isDirty);

     useNavigationPrompt(isDirty);

     const confirmarEnvio = (values, id) => {
       Modal.confirm({
         title: "¿Estás seguro de enviar la verificación?",
         content: "Verifica que toda la información esté completa antes de continuar.",
         okText: "Sí, enviar",
         cancelText: "Cancelar",
         onOk: () => {handleSubmitConductividad(values, id, navigate);
          setIsDirty(false);
         },  // llama a la función real de envío
       });
       };

     const coloseLog=(values)=>{
          console.log(values);
     }
     //onFinish={(values) => handleSubmitConductividad(values, id)}
  return (
     <div
     style={{
    maxWidth: 1200,
    margin: "0 auto",
    padding: "24px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
     }}
     >
    <Form form={form} layout="vertical" onValuesChange={()=> setIsDirty(true)} onFinish={(values) => confirmarEnvio(values, id)}>
      <Title level={4}>Calibración y Verificación de Equipo en Laboratorio y Campo</Title>

      {/* Datos generales */}
     <Collapse defaultActiveKey={['1']} style={{ marginBottom: 16 }}>
     <Panel header="Datos del equipo" key="1">
          <Row gutter={16}>
          <Col span={6}><Form.Item label="Equipo Utilizado" name ="equipoUtilizado">
               {/* <Input /> */}
               <AutoComplete
                    options={[
                         { value: 'Multiparámetro' },
                    ]}
                    placeholder="Selecciona o ingresa el equipo"
               />
          </Form.Item></Col>
          <Col span={6}><Form.Item label="ID" name="idEquipo">
               {/* <Input /> */}
               <AutoComplete
                    options={[
                         { value: 'PA-05' },
                         { value: 'PA-04' },
                    ]}
                    placeholder="Selecciona o ingresa el ID"
               />
          </Form.Item></Col>
          <Col span={6}><Form.Item label="Marca" name ="marcaEquipo">
               {/* <Input /> */}
               <AutoComplete
                    options={[
                         { value: 'Conductonic' },
                    ]}
                    placeholder="Selecciona o ingresa la marca"
               />
          </Form.Item></Col>
          <Col span={6}><Form.Item label="Modelo" name = "modeloEquipo">
               {/* <Input /> */}
               <AutoComplete
                    options={[
                         { value: 'PC-18' },
                    ]}
                    placeholder="Selecciona o ingresa el modelo"
               />
          </Form.Item></Col>
          <Col span={6}><Form.Item label="Serie" name="serialEquipo">
               {/* <Input /> */}
               <AutoComplete
                    options={[
                         { value: '7300' },
                         { value: 'S/N' },
                    ]}
                    placeholder="Selecciona o ingresa el serial"
               />
          </Form.Item></Col>
          </Row>
     </Panel>
     </Collapse>

      <Divider orientation="left">Calibración y Verificación en Laboratorio</Divider>

     <Collapse defaultActiveKey={['2']} style={{ marginBottom: 16 }}>
     <Panel header="Calibración y Verificación en Laboratorio" key="2">
       <Row gutter={16}>
        <Col span={6}>
          <Form.Item label="(µS/cm)" name="usCmLaboratorio">
               <Input 
               onChange={(e) => {
                    const value = e.target.value;
                    if(value ==="1413"){
                         form.setFieldsValue({
                              estandarMr: "SIn KCI",
                              marcaMr: "Supelco",
                              // loteMr: "LRAD2327",
                              estandarMc: "1413 Us/cm",
                              marcaMc: "Control Company",
                              // loteMc: "CC27851",
                              usCmCampo:"1413",
                              usCmCampoRango:"10000",
                              criterioMr:"6.75",
                              criterioMcL:"4.60",
                              criterioMrCampo:"6.75",
                              criterioMcCampo:"30.00"
                         })
                    }else{
                         form.setFieldsValue({
                              usCmCampo:value
                         })
                    }
               }}/>
          </Form.Item>
          </Col>
      </Row>

     <Row gutter={16}>
     <Col span={6}><Form.Item label="Estándar utilizado (MR)" name="estandarMr"><Input /></Form.Item></Col>
     <Col span={6}><Form.Item label="Marca" name="marcaMr"><Input /></Form.Item></Col>
     <Col span={6}><Form.Item label="Lote" name="loteMr"><Input /></Form.Item></Col>
     <Col span={6}><Form.Item label="Fecha de caducidad" name="fechaMrCaducidad"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
     </Row>

     <Row gutter={16}>
          <Col span={6}><Form.Item label="Estándar utilizado (MC)" name="estandarMc"><Input/></Form.Item></Col>
          <Col span={6}><Form.Item label="Marca" name="marcaMc"><Input/></Form.Item></Col>
          <Col span={6}><Form.Item label="Lote" name="loteMc"><Input/></Form.Item></Col>
          <Col span={6}><Form.Item label="Fecha de caducidad" name="fechaMcCaducidad"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
     </Row>

     <Row gutter={24}>
     {/* COLUMNA MR */}
     <Col span={12}>
     <div
     style={{
          border:"1px solid #ccc",
          padding:16,
          borderRadius:8,
          marginBottom:16,
          textAlign: "center",
     }}>
          
     <h3 style ={{textAlign: "center", marginBoottom:16}}>MR</h3>

     <Form.Item label="Hora" name="horaMr">
          <TimePicker format="HH:mm" style={{ width: "100%" }} />
     </Form.Item>

     <Row gutter={8}>
          <Col span={12}>
          <Form.Item label="L1 (μS/cm)" name="l1Mr">
               <Input />
          </Form.Item>
          </Col>
          <Col span={12}>
          <Form.Item label="T1 (°C)" name="t1Mr">
               <Input />
          </Form.Item>
          </Col>

          <Col span={12}>
          <Form.Item label="L2 (μS/cm)" name="l2Mr">
               <Input />
          </Form.Item>
          </Col>
          <Col span={12}>
          <Form.Item label="T2 (°C)" name="t2Mr">
               <Input />
          </Form.Item>
          </Col>

          <Col span={12}>
          <Form.Item label="L3 (μS/cm)" name="l3Mr">
               <Input />
          </Form.Item>
          </Col>
          <Col span={12}>
          <Form.Item label="T3 (°C)" name="t3Mr">
               <Input />
          </Form.Item>
          </Col>
     </Row>

     <Form.Item label="Criterio de aceptación del MR" name="criterioMr">
          <Input />
     </Form.Item>

     <Form.Item label="Se Acepta:" name="seAceptaMr">
          <Radio.Group>
          <Radio value={true}>Si</Radio>
          <Radio value={false}>No</Radio>
          </Radio.Group>
     </Form.Item>
     </div>
     </Col>

     {/* COLUMNA MC */}
     <Col span={12}>
     <div
     style={{
          border:"1px solid #ccc",
          padding:16,
          borderRadius:8,
          marginBottom:16,
          textAlign: "center",
     }}>
          
     <h3 style ={{textAlign: "center", marginBoottom:16}}>MC</h3>
     <Form.Item label="Hora" name="horaMc">
          <TimePicker format="HH:mm" style={{ width: "100%" }} />
     </Form.Item>

     <Row gutter={8}>
          <Col span={12}>
          <Form.Item label="L1 (μS/cm)" name="l1Mc">
               <Input />
          </Form.Item>
          </Col>
          <Col span={12}>
          <Form.Item label="T1 (°C)" name="t1Mc">
               <Input />
          </Form.Item>
          </Col>

          <Col span={12}>
          <Form.Item label="L2 (μS/cm)" name="l2Mc">
               <Input />
          </Form.Item>
          </Col>
          <Col span={12}>
          <Form.Item label="T2 (°C)" name="t2Mc">
               <Input />
          </Form.Item>
          </Col>

          <Col span={12}>
          <Form.Item label="L3 (μS/cm)" name="l3Mc">
               <Input />
          </Form.Item>
          </Col>
          <Col span={12}>
          <Form.Item label="T3 (°C)" name="t3Mc">
               <Input />
          </Form.Item>
          </Col>
     </Row>

     <Form.Item label="Criterio de aceptación del MC" name="criterioMcL">
          <Input />
     </Form.Item>

     <Form.Item label="Se Acepta:" name="seAceptaMcL">
          <Radio.Group>
          <Radio value={true}>Si</Radio>
          <Radio value={false}>No</Radio>
          </Radio.Group>
     </Form.Item>
     
     </div>

     </Col>
     </Row>


     </Panel>
     </Collapse>

      <Divider orientation="left">Calibración y Verificación en Campo</Divider>
     <Collapse style={{ marginBottom: 16 }}>
          <Panel header="Calibración y Verificación en Campo" key="3">
               <Row gutter={16}>
               <Col span={6}><Form.Item label="(µS/cm)" name="usCmCampo"><Input /></Form.Item></Col>
               <Col span={6}><Form.Item label="(µS/cm)" name="usCmCampoRango"><Input /></Form.Item></Col>
               </Row>

          <Row gutter={24}>
          {/* COLUMNA MR CAMPO */}
          <Col span={12}>
          <div
          style={{
               border:"1px solid #ccc",
               padding:16,
               borderRadius:8,
               marginBottom:16,
               textAlign: "center",
          }}>
               
          <h3 style ={{textAlign: "center", marginBoottom:16}}>MR Campo</h3>
          <Form.Item label="Hora" name="horaMrCampo">
               <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Row gutter={8}>
               <Col span={12}>
               <Form.Item label="L1 (μS/cm)" name="l1MrCampo">
                    <Input />
               </Form.Item>
               </Col>
               <Col span={12}>
               <Form.Item label="T1 (°C)" name="t1MrCampo">
                    <Input />
               </Form.Item>
               </Col>

               <Col span={12}>
               <Form.Item label="L2 (μS/cm)" name="l2MrCampo">
                    <Input />
               </Form.Item>
               </Col>
               <Col span={12}>
               <Form.Item label="T2 (°C)" name="t2MrCampo">
                    <Input />
               </Form.Item>
               </Col>

               <Col span={12}>
               <Form.Item label="L3 (μS/cm)" name="l3MrCampo">
                    <Input />
               </Form.Item>
               </Col>
               <Col span={12}>
               <Form.Item label="T3 (°C)" name="t3MrCampo">
                    <Input />
               </Form.Item>
               </Col>
          </Row>

          <Form.Item
               label="Criterio de aceptación del MR"
               name="criterioMrCampo"
          >
               <Input />
          </Form.Item>

          <Form.Item label="Se Acepta:" name="seAceptaMrCampo">
               <Radio.Group>
               <Radio value={true}>Si</Radio>
               <Radio value={false}>No</Radio>
               </Radio.Group>
          </Form.Item>
          
          </div>

          </Col>

          {/* COLUMNA MC CAMPO */}
          <Col span={12}>
          <div
          style={{
               border:"1px solid #ccc",
               padding:16,
               borderRadius:8,
               marginBottom:16,
               textAlign: "center",
          }}>
               
          <h3 style ={{textAlign: "center", marginBoottom:16}}>MC Campo</h3>
          <Form.Item label="Hora" name="horaMcCampo">
               <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Row gutter={8}>
               <Col span={12}>
               <Form.Item label="L1 (μS/cm)" name="l1McCampo">
                    <Input />
               </Form.Item>
               </Col>
               <Col span={12}>
               <Form.Item label="T1 (°C)" name="t1McCampo">
                    <Input />
               </Form.Item>
               </Col>

               <Col span={12}>
               <Form.Item label="L2 (μS/cm)" name="l2McCampo">
                    <Input />
               </Form.Item>
               </Col>
               <Col span={12}>
               <Form.Item label="T2 (°C)" name="t2McCampo">
                    <Input />
               </Form.Item>
               </Col>

               <Col span={12}>
               <Form.Item label="L3 (μS/cm)" name="l3McCampo">
                    <Input />
               </Form.Item>
               </Col>
               <Col span={12}>
               <Form.Item label="T3 (°C)" name="t3McCampo">
                    <Input />
               </Form.Item>
               </Col>
          </Row>

          <Form.Item
               label="Criterio de aceptación del MC"
               name="criterioMcCampo"
          >
               <Input />
          </Form.Item>

          <Form.Item label="Se Acepta:" name="seAceptaMcCampo">
               <Radio.Group>
               <Radio value={true}>Si</Radio>
               <Radio value={false}>No</Radio>
               </Radio.Group>
          </Form.Item>
          
          </div>

          </Col>
          </Row>

               
          </Panel>
     </Collapse>




      <Form.Item label="Observaciones" name="observacion">
        <Input.TextArea rows={4} />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}><Form.Item label="Realizó" name="realizado"><Input /></Form.Item></Col>
        <Col span={12}><Form.Item label="Supervisó" name="supervisor"><Input /></Form.Item></Col>
      </Row>
      <Form.Item>
        <Button type="primary" htmlType="submit">Guardar Verificación y salir</Button>
      </Form.Item>
    </Form>
    </div>
  );
};

export default FormularioConductividad;
