import React from "react";
import { Card, Form, Input, DatePicker, TimePicker, Typography, Row } from "antd";
import "./phBlock.css";            // importa tu CSS

const { Title, Text } = Typography;

function CeldaLabel({ children }) {
  return <Text className="ph-cell" style={{ fontSize: 12 }}>{children}</Text>;
}

function BloqueEstandar({ pref, titulo }) {
  return (
    <>
      <div className="ph-cell ph-header">{titulo}</div>
      <Form.Item name={`ph${pref}`} className="ph-cell" style={{ margin: 0 }}>
        <Input placeholder="pH =" />
      </Form.Item>
    </>
  );
}

export default function PhLabBlock() {
  return (
    <Card size="small" bordered={false}>
      <div className="ph-grid">
        {/* títulos principales */}
        <div className="ph-cell ph-header">
          <Title level={5} style={{ margin: 0 }}>Calibración en laboratorio</Title>
        </div>
        <div className="ph-separator" />
        <div className="ph-cell ph-header">
          <Title level={5} style={{ margin: 0 }}>Verificación en laboratorio</Title>
        </div>

        {/* sub‑títulos */}
        <BloqueEstandar pref="CertLab" titulo="Estándar Certificado" />
        <div className="ph-separator" />
        <BloqueEstandar pref="ComLab" titulo="Estándar Comercial" />

        {/* filas repetidas */}
        {["Hora","Marca","Lote","Caducidad","Lectura 1","Lectura 2","Lectura 3","Temp °C"].map((lb,i)=>(
          <React.Fragment key={i}>
            <CeldaLabel>{lb}</CeldaLabel>
            <Form.Item name={`${lb.replace(/ |°C/g,"") }CertLab`} className="ph-cell" style={{ margin: 0 }}>
              {lb==="Caducidad"
                ? <DatePicker style={{ width: "100%" }} />
                : <Input />}
            </Form.Item>

            <div className="ph-separator" />

            <CeldaLabel>{lb}</CeldaLabel>
            <Form.Item name={`${lb.replace(/ |°C/g,"") }ComLab`} className="ph-cell" style={{ margin: 0 }}>
              {lb==="Caducidad"
                ? <DatePicker style={{ width: "100%" }} />
                : <Input />}
            </Form.Item>
          </React.Fragment>
        ))}

        {/* Promedio */}
        <CeldaLabel>Promedio</CeldaLabel>
        <Form.Item name="promCertLab" className="ph-cell" style={{ margin: 0 }}>
          <Input disabled />
        </Form.Item>
        <div className="ph-separator" />
        <CeldaLabel>Promedio</CeldaLabel>
        <Form.Item name="promComLab" className="ph-cell" style={{ margin: 0 }}>
          <Input disabled />
        </Form.Item>
      </div>

      <Text type="secondary" style={{ fontSize: 12 }}>
        Criterio de aceptación: ±0.05 pH del valor nominal del estándar.<br/>
        Lecturas independientes &lt; 0.03 pH.
      </Text>
    </Card>
  );
}
