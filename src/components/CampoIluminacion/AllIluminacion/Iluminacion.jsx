import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Input,
  Button,
  Typography,
  Card,
  Space,
  Row,
  Col,
  Flex,
  Divider,
  Tag,
  message,
} from "antd";

import { DataModalIluminacion, ModalIluminacionOT } from "../ModalIluminacion/Modal.jsx";
import { searchOTData, getAllIluminacion } from "../hook/stateOT.jsx";
import { createIlum,existe } from "../../../apis/ApiCampo/IluminacionApi.js";
import { MachineLightManagerModal } from "../ModalIluminacion/MachinaLightManagerModal.jsx";

const { Search } = Input;

function IluminacionGate() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenIlum, setIsModalOpenIlum] = useState(false);
  const [ilumData, setIlumData] = useState(null);
  const [otData, setOtData] = useState(null);
  const [otCode, setOtCode] = useState("");
  const navigate = useNavigate();

  // Modal de MachineLight
  const [openMachineModal, setOpenMachineModal] = useState(false);
  const [machineLightSelecdId, setMachineLightSelectedId] = useState(null);

  const showModal = async (values) => {
    const t = await searchOTData(values);
    setOtData(t);
    setIsModalOpen(true);
  };

  const handleOk = async (values) => {
    try {
      const data = {
        OrdenTrabajo: otData.ot.orden_trabajo_id,
        machineLight: values,
        estado: 2,
      };

      const responseOk = await existe(otData.ot.orden_trabajo_id);
      if(responseOk.data.ok === false){
          message.error("Ya existe, No se Creo.")
      }
      else{

           const r = await createIlum(data);
           
          setTimeout(() => {
          navigate(`/DetallesIluminacion/${r.data.id}`);
          }, 600);
      }
    } catch (error) {
      console.error("error: ", error);
      message.error("No se pudo crear la iluminación");
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => setIsModalOpen(false);

  const showModalIluminacion = async (values) => {
    const t = await getAllIluminacion(values);
    setIlumData(t);
    setIsModalOpenIlum(true);
  };

  const handleOkIlum = () => {
    setIsModalOpenIlum(false);
    if (!ilumData?.data?.iluminacion_id) return;
    navigate(`/DetallesIluminacion/${ilumData.data.iluminacion_id}`);
  };

  const handleCancelIlum = () => setIsModalOpenIlum(false);

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
        <div>
          <Typography.Title level={2} style={{ marginBottom: 0 }}>
            Iluminación
          </Typography.Title>
          <Typography.Text type="secondary">
            Crea una iluminación desde una OT o busca una existente.
          </Typography.Text>
        </div>

        <Space>
          {/* {machineLightSelecdId ? (
            <Tag color="blue" style={{ marginInlineEnd: 0 }}>
              Máquina: #{machineLightSelecdId}
            </Tag>
          ) : (
            <Tag color="default" style={{ marginInlineEnd: 0 }}>
              Sin máquina seleccionada
            </Tag>
          )} */}

          <Button type="primary" onClick={() => setOpenMachineModal(true)}>
            Máquinas
          </Button>
        </Space>
      </Flex>

      <Divider style={{ margin: "16px 0 20px" }} />

      {/* Body */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            title="Crear Iluminación"
            bordered={false}
            style={{ height: "100%" }}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Typography.Text type="secondary">
                Ingresa el código de OT para crear una nueva iluminación.
              </Typography.Text>

              <Search
                value={otCode}
                onChange={(e) => setOtCode(e.target.value)}
                placeholder="Ej: OT-000123"
                enterButton="Buscar OT"
                size="large"
                allowClear
                onSearch={(value) => {
                  if (!value) return;
                  showModal(value);
                }}
              />

              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Tip: puedes pegar el código completo.
              </Typography.Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title="Buscar Iluminación"
            bordered={false}
            style={{ height: "100%" }}
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Typography.Text type="secondary">
                Encuentra una iluminación existente por OT.
              </Typography.Text>

              <Search
                placeholder="Ej: OT-000123"
                enterButton="Buscar"
                size="large"
                allowClear
                onSearch={(value) => {
                  if (!value) return;
                  showModalIluminacion(value);
                }}
              />
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Modales */}
      <DataModalIluminacion
        ot_data={otData}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      />

      <ModalIluminacionOT
        ilum_data={ilumData}
        open={isModalOpenIlum}
        onOk={handleOkIlum}
        onCancel={handleCancelIlum}
      />

      <MachineLightManagerModal
        open={openMachineModal}
        onCancel={() => setOpenMachineModal(false)}
        onOk={(machineId) => {
          setMachineLightSelectedId(machineId);
          setOpenMachineModal(false);
          message.success("Máquina seleccionada");
        }}
      />
    </div>
  );
}

export default IluminacionGate;
