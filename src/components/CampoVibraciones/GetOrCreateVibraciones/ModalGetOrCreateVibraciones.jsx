import React, { useState } from "react";
import {
  Button,
  Modal,
  Popconfirm,
  Descriptions,
  Typography,
  Divider,
  Space,
  Alert,
  DatePicker,
} from "antd";

const { Text } = Typography;

export function DataModalVibraciones({ ot_data, open, onOk, onCancel }) {
  const canCreateOT = Boolean(ot_data?.ot?.codigo);
  const [dateTime, setDateTime] = useState(null);

  const handleConfirm = () => {
    const value =
      typeof dateTime?.toISOString === "function" ? dateTime.toISOString() : dateTime;
    onOk?.(value);
  };

  const canCreate = canCreateOT && Boolean(dateTime);

  return (
    <Modal
      title="Crear Vibraciones"
      open={open}
      onCancel={onCancel}
      centered
      destroyOnClose
      width={560}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Popconfirm
          key="confirm"
          title="¿Confirmar la creación?"
          onConfirm={handleConfirm}
          okText="Sí"
          cancelText="No"
          disabled={!canCreate}
        >
          <Button key="submit" type="primary" disabled={!canCreate}>
            Crear
          </Button>
        </Popconfirm>,
      ]}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Descriptions size="small" column={1} bordered labelStyle={{ width: 120 }}>
          <Descriptions.Item label="OT">
            <Text strong>{ot_data?.ot?.codigo || "..."}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Empresa">
            <Text strong>{ot_data?.ot?.empresa || "..."}</Text>
          </Descriptions.Item>
        </Descriptions>

        <Divider style={{ margin: "4px 0" }} />
        {!canCreateOT && (
          <Alert
            type="warning"
            showIcon
            message="No hay OT válida para crear el registro de vibraciones."
          />
        )}

        <div>
          <Text strong>Fecha y hora</Text>
          <div style={{ marginTop: 8 }}>
            <DatePicker
              showTime
              style={{ width: "100%", maxWidth: 360 }}
              placeholder="Selecciona fecha y hora"
              value={dateTime}
              onChange={(value) => setDateTime(value)}
            />
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Selecciona una fecha y hora para habilitar &quot;Crear&quot;.
          </Text>
        </div>
      </Space>
    </Modal>
  );
}

export function ModalVibracionesOT({ vibracion_data, open, onOk, onCancel }) {
  return (
    <Modal
      title="Resultado"
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      closable
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={onOk}>
          Ver Vibraciones
        </Button>,
      ]}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Descriptions size="small" column={1} bordered labelStyle={{ width: 120 }}>
          <Descriptions.Item label="OT">
            <Text strong>{vibracion_data?.data?.codigo || "..."}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Empresa">
            <Text strong>{vibracion_data?.data?.empresa || "..."}</Text>
          </Descriptions.Item>
        </Descriptions>
      </Space>
    </Modal>
  );
}
