import React, {useMemo, useState} from "react";
import { Button, Modal, Select, Popconfirm, Descriptions, Typography, Divider, Space, Alert } from "antd";

const { Text } = Typography;

export function DataModalIluminacion({ ot_data,open, onOk, onCancel }) {
     const iluminaciones = ot_data?.iluminacion ?? [];
     const canCreateOT = Boolean(ot_data?.ot?.codigo);
    // console.log(ot_data);
     const optionsIlum = useMemo(()=>
       iluminaciones.map((item) => ({
       value: item.id, // o item.pk
       label: `Máquina # ${item.equipoId}` || `Máquina # ${item.id}`,
       })),
       [iluminaciones]

     );
    const [selectedIlumId, setSelectedIlumId] = useState(null);
    const canCreate = canCreateOT && Boolean(selectedIlumId);
    const handleConfirm = () => {
      // opcional: mandarle el id seleccionado al onOk
      onOk?.(selectedIlumId);
    };

     return (
    <Modal
      title="Crear Iluminación"
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      centered
      destroyOnClose
      // closable
      width={560}
      okButtonProps={{ disabled: !canCreate}}
      footer ={[
          <Button key="cancel" onClick={onCancel}>
            Cancel
          </Button>,
          <Popconfirm
            key="confirm"
            title="¿Confirmar la Creación?"
            onConfirm={handleConfirm}
            okText="Yes"
            cancelText="No"
            disabled={!canCreate}
          >
            <Button key="submit" type="primary" disabled={!canCreate}>
              Crear
            </Button>
          </Popconfirm>,
      ]}
    >
      <Space
      direction="vertical"
      size={"middle"}
      style={{width: "100%"}}>
        <Descriptions
        size="small"
        column={1}
        bordered
        labelStyle={{width:120}}>
          <Descriptions.Item label="OT">
            <Text strong> {ot_data?.ot?.codigo || "..."} </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Empresa">
            <Text strong> {ot_data?.ot?.empresa || "..."} </Text>
          </Descriptions.Item>
        </Descriptions>

        <Divider style={{ margin: "4px 0" }}/>
        {!canCreateOT && (
          <Alert
          type="warning"
          showIcon
          message="No hay OT válida para crear la iluminación."
          />
        )}

        <div>
          <Text strong>Seleccina máquina</Text>
          <div style={{ marginTop: 8 }}>
            <Select
                showSearch
                style={{ width: 300 }}
                placeholder="Select a person"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                filterSort={(optionA, optionB) =>
                  (optionA?.label ?? "")
                    .toLowerCase()
                    .localeCompare((optionB?.label ?? "").toLowerCase())
                }
                options={optionsIlum}
                onChange={(value) => setSelectedIlumId(value)} 
              />
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Debes selccionar una máquina para habilitar "Crear".
          </Text>
        </div>
      </Space>

    </Modal>
  );
}

export function ModalIluminacionOT({ ilum_data,open, onOk, onCancel }) {

// console.log(ilum_data);
     return (
    <Modal
      title="Resultado "
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      closable
      footer ={[
          <Button key="cancel" onClick={onCancel}>
            Cancel
          </Button>,
            <Button key="submit" type="primary" onClick={onOk}>
              Ver Iluminación
            </Button>,
      ]}
    >
      {/* <p> OT: {ilum_data?.data?.codigo || "No data"}</p>
      <p> EMPRESA: {ilum_data?.data?.empresa || "No data"}</p> */}

            <Space
      direction="vertical"
      size={"middle"}
      style={{width: "100%"}}>
        <Descriptions
        size="small"
        column={1}
        bordered
        labelStyle={{width:120}}>
          <Descriptions.Item label="OT">
            <Text strong> {ilum_data?.data?.codigo || "..."} </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Empresa">
            <Text strong> {ilum_data?.data?.empresa || "..."} </Text>
          </Descriptions.Item>
          <Descriptions.Item label="EquipoId">
            <Text strong> {ilum_data?.data?.machineId || "..."} </Text>
          </Descriptions.Item>
        </Descriptions>
        </Space>

    </Modal>
  );
}

