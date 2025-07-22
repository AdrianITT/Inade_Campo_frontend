import React, {useEffect, useState} from "react";
import { Form, Input, DatePicker, Divider, Typography, Row, Col, TimePicker, Radio, message, Collapse, Button } from "antd";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import {conductividadInfoData} from "../../apis/ApiCampo/VerificacionConductividad"
import { useActualizarConductividad } from "./useConductividadForm";
const { Title } = Typography;

function isoToDayjs(dateStr) {
  return dateStr ? dayjs(dateStr) : undefined;
}

const EditarConductividad = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const {Panel} =Collapse;
 const save= useActualizarConductividad(id);
  const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
      try {
        await save(values);
        message.success("Datos actualizados");
      } catch (err) {
        console.error(err);
        message.error("Error al actualizar");
      }
    };

  /* 1️⃣  traer datos al montar */
  useEffect(() => {
    async function cargar() {
      try {
        const { data } = await conductividadInfoData(id);
        console.log("data: ",data)
        /* 2️⃣  mapa JSON → campos del formulario */
        form.setFieldsValue({
          /* --- cabecera --- */
          verifId:    data.calibracionVerificacion?.id,
          equipoUtilizado: data.calibracionVerificacion?.equipoUtilizado,
          idEquipo:        data.calibracionVerificacion?.idEquipo,
          marcaEquipo:     data.calibracionVerificacion?.marcaEquipo,
          modeloEquipo:    data.calibracionVerificacion?.modeloEquipo,
          serialEquipo:    data.calibracionVerificacion?.serialEquipo,

          /* --- laboratorio general --- */
          labId:data.laboratorio.id,
          usCmLaboratorio: data.laboratorio?.usCmLaboratorio,

          /* MR Lab */
          estandarMr:      data.laboratorio?.estandarMr,
          marcaMr:         data.laboratorio?.marcaMr,
          loteMr:          data.laboratorio?.loteMr,
          fechaMrCaducidad: isoToDayjs(data.laboratorio?.fechaMrCaducidad),

          /* MC Lab */
          estandarMc:      data.laboratorio?.estandarMc,
          marcaMc:         data.laboratorio?.marcaMc,
          loteMc:          data.laboratorio?.loteMc,
          fechaMcCaducidad: isoToDayjs(data.laboratorio?.fechaMcCaducidad),

          /* Aceptación MR Lab */
          mrLabId:data.laboratorio.aceptacionMr.id,
          horaMr:   isoToDayjs(`1970-01-01T${data.laboratorio?.aceptacionMr?.horaMr || "00:00"}`),
          l1Mr:     data.laboratorio?.aceptacionMr?.l1Mr,
          t1Mr:     data.laboratorio?.aceptacionMr?.t1Mr,
          l2Mr:     data.laboratorio?.aceptacionMr?.l2Mr,
          t2Mr:     data.laboratorio?.aceptacionMr?.t2Mr,
          l3Mr:     data.laboratorio?.aceptacionMr?.l3Mr,
          t3Mr:     data.laboratorio?.aceptacionMr?.t3Mr,
          criterioMr:  data.laboratorio?.aceptacionMr?.criterioMr,
          seAceptaMr:  data.laboratorio?.aceptacionMr?.seAceptaMr,
          /*Aceptacion MC */
          /* Aceptación MR Lab */
          mcLabId:data.laboratorio.aceptacionMc.id,
          horaMc:   isoToDayjs(`1970-01-01T${data.laboratorio?.aceptacionMc?.horaMc || "00:00"}`),
          l1Mc:     data.laboratorio?.aceptacionMc?.l1Mc,
          t1Mc:     data.laboratorio?.aceptacionMc?.t1Mc,
          l2Mc:     data.laboratorio?.aceptacionMc?.l2Mc,
          t2Mc:     data.laboratorio?.aceptacionMc?.t2Mc,
          l3Mc:     data.laboratorio?.aceptacionMc?.l3Mc,
          t3Mc:     data.laboratorio?.aceptacionMc?.t3Mc,
          criterioMcL:  data.laboratorio?.aceptacionMc?.criterioMc,
          seAceptaMcL:  data.laboratorio?.aceptacionMc?.seAceptaMc,


           /* Aceptación MR Lab */
          mrCampoId:data.campo.aceptacionMr.id,
          horaMrCampo:   isoToDayjs(`1970-01-01T${data.campo?.aceptacionMr?.horaMr || "00:00"}`),
          l1MrCampo:     data.campo?.aceptacionMr?.l1Mr,
          t1MrCampo:     data.campo?.aceptacionMr?.t1Mr,
          l2MrCampo:     data.campo?.aceptacionMr?.l2Mr,
          t2MrCampo:     data.campo?.aceptacionMr?.t2Mr,
          l3MrCampo:     data.campo?.aceptacionMr?.l3Mr,
          t3MrCampo:     data.campo?.aceptacionMr?.t3Mr,
          criterioMrCampo:  data.campo?.aceptacionMr?.criterioMr,
          seAceptaMrCampo:  data.campo?.aceptacionMr?.seAceptaMr,
          /*Aceptacion MC */
          /* Aceptación MR Lab */
          mcCampoId:data.campo.aceptacionMc.id,
          horaMcCampo:   isoToDayjs(`1970-01-01T${data.campo?.aceptacionMc?.horaMc || "00:00"}`),
          l1McCampo:     data.campo?.aceptacionMc?.l1Mc,
          t1McCampo:     data.campo?.aceptacionMc?.t1Mc,
          l2McCampo:     data.campo?.aceptacionMc?.l2Mc,
          t2McCampo:     data.campo?.aceptacionMc?.t2Mc,
          l3McCampo:     data.campo?.aceptacionMc?.l3Mc,
          t3McCampo:     data.campo?.aceptacionMc?.t3Mc,
          criterioMcCampo:  data.campo?.aceptacionMc?.criterioMc,
          seAceptaMcCampo:  data.campo?.aceptacionMc?.seAceptaMc,
          /* ...continúa para MC Lab, MR Campo, MC Campo... */

          /* Campo general */
          campoId:        data.campo.id,
          usCmCampo:       data.campo?.usCmCampo,
          usCmCampoRango:  data.campo?.usCmCampoRango,
          /* y así sucesivamente */
          conducid:data.calibracionConductiva.id,
          observacion: data.calibracionConductiva.observacion,
          realizado: data.calibracionConductiva.realizo,
          supervisor: data.calibracionConductiva.supervisor,
        });
      } catch (err) {
        message.error("No se pudieron cargar los datos");
        console.error(err);
      }
    }
    cargar();
  }, [id, form]);

  /* 3️⃣  opcional: al enviar */
  // const onFinish = (values) => {
  //   console.log("payload a guardar:", values);
  //   // formatea dayjs → cadena y haz PUT/POST
  // };
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
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Title level={4}>Calibración y Verificación de Equipo en Laboratorio y Campo</Title>
      <Form.Item name="verifId"     hidden><Input /></Form.Item>
      <Form.Item name="conducid"    hidden><Input/></Form.Item>
      <Form.Item name="labId"       hidden><Input /></Form.Item>
      <Form.Item name="campoId"     hidden><Input /></Form.Item>
      <Form.Item name="mrLabId"     hidden><Input /></Form.Item>
      <Form.Item name="mcLabId"     hidden><Input /></Form.Item>
      <Form.Item name="mrCampoId"   hidden><Input /></Form.Item>
      <Form.Item name="mcCampoId"   hidden><Input /></Form.Item>

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
     <p>Criterios MR</p>
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
      <p>Criterios criterioMc</p>
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
                <p>Criterios MR</p>
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
                <p>Criterios Mc</p>
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

export default EditarConductividad;
