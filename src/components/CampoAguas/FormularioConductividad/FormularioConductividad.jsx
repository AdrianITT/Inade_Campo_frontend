import React from "react";
import { Form, Input, DatePicker, Divider, Typography, Row, Col, TimePicker, Radio, Button, Collapse, Modal } from "antd";
import { handleSubmitConductividad } from "./handleSubmitConductividad";
import { useParams, useNavigate } from "react-router-dom";

const { Title } = Typography;


const FormularioConductividad = () => {
     const { id } = useParams();
     const {Panel} =Collapse;
     const navigate = useNavigate();

     const confirmarEnvio = (values, id) => {
       Modal.confirm({
         title: "¿Estás seguro de enviar la verificación?",
         content: "Verifica que toda la información esté completa antes de continuar.",
         okText: "Sí, enviar",
         cancelText: "Cancelar",
         onOk: () => handleSubmitConductividad(values, id, navigate),  // llama a la función real de envío
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
    <Form layout="vertical" onFinish={(values) => confirmarEnvio(values, id)}>
      <Title level={4}>Calibración y Verificación de Equipo en Laboratorio y Campo</Title>

      {/* Datos generales */}
     <Collapse defaultActiveKey={['1']} style={{ marginBottom: 16 }}>
     <Panel header="Datos del equipo" key="1">
          <Row gutter={16}>
          <Col span={6}><Form.Item label="Equipo Utilizado" name ="equipoUtilizado"><Input /></Form.Item></Col>
          <Col span={6}><Form.Item label="ID" name="idEquipo"><Input /></Form.Item></Col>
          <Col span={6}><Form.Item label="Marca" name ="marcaEquipo"><Input /></Form.Item></Col>
          <Col span={6}><Form.Item label="Modelo" name = "modeloEquipo"><Input /></Form.Item></Col>
          <Col span={6}><Form.Item label="Serie" name="serialEquipo"><Input /></Form.Item></Col>
          </Row>
     </Panel>
     </Collapse>

      <Divider orientation="left">Calibración y Verificación en Laboratorio</Divider>

     <Collapse defaultActiveKey={['2']} style={{ marginBottom: 16 }}>
     <Panel header="Calibración y Verificación en Laboratorio" key="2">
       <Row gutter={16}>
        <Col span={6}><Form.Item label="(µS/cm)" name="usCmLaboratorio"><Input /></Form.Item></Col>
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

      <Row gutter={16}>
          <Form.Item label="Hora" name="horaMr">
            <TimePicker format="HH:mm" />
          </Form.Item>
        <Col span={12}><Form.Item label="L1 (μS/cm)" name = "l1Mr"><Input /></Form.Item></Col>
        <Col span={12}><Form.Item label="T1 (°C)" name="t1Mr"><Input /></Form.Item></Col>
        <Col span={12}><Form.Item label="L2 (μS/cm)" name = "l2Mr"><Input /></Form.Item></Col>
        <Col span={12}><Form.Item label="T2 (°C)" name="t2Mr"><Input /></Form.Item></Col>
        <Col span={12}><Form.Item label="L3 (μS/cm)" name = "l3Mr"><Input /></Form.Item></Col>
        <Col span={12}><Form.Item label="T3 (°C)" name="t3Mr"><Input /></Form.Item></Col>
        <Col span={12}><Form.Item label="Criterio de aceptación del MR" name="criterioMr"><Input /></Form.Item></Col>
        <Col span={12}><Form.Item label="Se Acepta:" name="seAceptaMr">
               <Radio.Group>
                    <Radio value={true}>Si</Radio>
                    <Radio value={false}>No</Radio>
               </Radio.Group>
          </Form.Item></Col>
      </Row>
            <Row gutter={16}>
          <Form.Item label="Hora" name="horaMc">
            <TimePicker format="HH:mm" />
          </Form.Item>
        <Col span={12}><Form.Item label="L1 (μS/cm)" name = "l1Mc"><Input /></Form.Item></Col>
        <Col span={12}><Form.Item label="T1 (°C)" name="t1Mc"><Input /></Form.Item></Col>
        <Col span={12}><Form.Item label="L2 (μS/cm)" name = "l2Mc"><Input /></Form.Item></Col>
        <Col span={12}><Form.Item label="T2 (°C)" name="t2Mc"><Input /></Form.Item></Col>
        <Col span={12}><Form.Item label="L3 (μS/cm)" name = "l3Mc"><Input /></Form.Item></Col>
        <Col span={12}><Form.Item label="T3 (°C)" name="t3Mc"><Input /></Form.Item></Col>
        <Col span={12}><Form.Item label="Criterio de aceptación del MC" name="criterioMcL"><Input /></Form.Item></Col>
        <Col span={12}><Form.Item label="Se Acepta:" name="seAceptaMcL">
               <Radio.Group>
                    <Radio value={true}>Si</Radio>
                    <Radio value={false}>No</Radio>
               </Radio.Group>
          </Form.Item></Col>
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

               <Row gutter={16}>
                    <Form.Item label="Hora" name="horaMrCampo">
                    <TimePicker format="HH:mm" />
                    </Form.Item>
               <Col span={12}><Form.Item label="L1 (μS/cm)" name = "l1MrCampo"><Input /></Form.Item></Col>
               <Col span={12}><Form.Item label="T1 (°C)" name="t1MrCampo"><Input /></Form.Item></Col>
               <Col span={12}><Form.Item label="L2 (μS/cm)" name = "l2MrCampo"><Input /></Form.Item></Col>
               <Col span={12}><Form.Item label="T2 (°C)" name="t2MrCampo"><Input /></Form.Item></Col>
               <Col span={12}><Form.Item label="L3 (μS/cm)" name = "l3MrCampo"><Input /></Form.Item></Col>
               <Col span={12}><Form.Item label="T3 (°C)" name="t3MrCampo"><Input /></Form.Item></Col>
               <Col span={12}><Form.Item label="Criterio de aceptación del MR" name="criterioMrCampo"><Input /></Form.Item></Col>
               <Col span={12}><Form.Item label="Se Acepta:" name="seAceptaMrCampo">
                         <Radio.Group>
                              <Radio value={true}>Si</Radio>
                              <Radio value={false}>No</Radio>
                         </Radio.Group>
                    </Form.Item></Col>
               </Row>

               <Row gutter={16}>
                    <Form.Item label="Hora" name="horaMcCampo">
                    <TimePicker format="HH:mm" />
                    </Form.Item>
               <Col span={12}><Form.Item label="L1 (μS/cm)" name = "l1McCampo"><Input /></Form.Item></Col>
               <Col span={12}><Form.Item label="T1 (°C)" name="t1McCampo"><Input /></Form.Item></Col>
               <Col span={12}><Form.Item label="L2 (μS/cm)" name = "l2McCampo"><Input /></Form.Item></Col>
               <Col span={12}><Form.Item label="T2 (°C)" name="t2McCampo"><Input /></Form.Item></Col>
               <Col span={12}><Form.Item label="L3 (μS/cm)" name = "l3McCampo"><Input /></Form.Item></Col>
               <Col span={12}><Form.Item label="T3 (°C)" name="t3McCampo"><Input /></Form.Item></Col>
               <Col span={12}><Form.Item label="Criterio de aceptación del MC" name="criterioMcCampo"><Input /></Form.Item></Col>
               <Col span={12}><Form.Item label="Se Acepta:" name="seAceptaMcCampo">
                         <Radio.Group>
                              <Radio value={true}>Si</Radio>
                              <Radio value={false}>No</Radio>
                         </Radio.Group>
                    </Form.Item></Col>
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
