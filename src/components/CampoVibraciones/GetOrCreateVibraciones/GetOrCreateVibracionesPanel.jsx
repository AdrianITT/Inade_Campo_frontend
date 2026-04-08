import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Input,
  Typography,
  Card,
  Space,
  Row,
  Col,
  Divider,
  Flex,
  message,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
  DataModalVibraciones,
  ModalVibracionesOT,
} from "./ModalGetOrCreateVibraciones";
import { searchOTDataVibraciones, getRegistroVibracionesPorOT } from "../hook/stateOTVibraciones";
import {
  existeOTparaVibraciones,
  createVibracionesCampo,
} from "../../../apis/ApiCampo/ApiVibraciones";

const { Search } = Input;

function GetOrCreateVibracionesPanel() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenSearch, setIsModalOpenSearch] = useState(false);
  const [vibracionData, setVibracionData] = useState(null);
  const [otData, setOtData] = useState(null);
  const [otCodeCreate, setOtCodeCreate] = useState("");
  const navigate = useNavigate();

  const showModal = async (values) => {
    const t = await searchOTDataVibraciones(values);
    setOtData(t);
    setIsModalOpen(true);
  };

  const handleOk = async (values) => {
    try {
      if (!otData?.ot?.orden_trabajo_id) {
        message.error("OT no válida");
        setIsModalOpen(false);
        return;
      }

      const data = {
        OrdenTrabajo: otData.ot.orden_trabajo_id,
        fecha: values,
        // estado: 2,
      };

      const responseOk = await existeOTparaVibraciones(otData.ot.orden_trabajo_id);
      if (responseOk.data.ok === false) {
        message.error("Ya existe, no se creó.");
      } else {
        const r = await createVibracionesCampo(data);
        setTimeout(() => {
          navigate(`/DetallesVibracion/${r.data.id}`);
        }, 600);
      }
    } catch (error) {
      console.error("error: ", error);
      message.error("No se pudo crear el registro de vibraciones");
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => setIsModalOpen(false);

  const showModalVibraciones = async (values) => {
    const t = await getRegistroVibracionesPorOT(values);
    // console.log("Datos de vibraciones obtenidos: ", t);
    setVibracionData(t);
    setIsModalOpenSearch(true);
  };

  const handleOkSearch = () => {
    setIsModalOpenSearch(false);
    const id = vibracionData?.data?.vibracion_id;
    if (!id) return;
    // console.log("ID para navegar: ", id);
    navigate(`/DetallesVibracion/${id}`);
  };

  const handleCancelSearch = () => setIsModalOpenSearch(false);

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
        <div>
          <Typography.Title level={2} style={{ marginBottom: 0 }}>
            Vibraciones
          </Typography.Title>
          <Typography.Text type="secondary">
            Crea un registro desde una OT o busca uno existente.
          </Typography.Text>
        </div>
      </Flex>

      <Divider style={{ margin: "16px 0 20px" }} />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Crear Vibraciones" bordered={false} style={{ height: "100%" }}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Typography.Text type="secondary">
                Ingresa el código de OT para crear un nuevo registro de vibraciones.
              </Typography.Text>

              <Search
                value={otCodeCreate}
                onChange={(e) => setOtCodeCreate(e.target.value)}
                placeholder="Ej: OT-000123"
                enterButton="Buscar OT"
                size="large"
                allowClear
                prefix={<SearchOutlined />}
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
          <Card title="Buscar Vibraciones" bordered={false} style={{ height: "100%" }}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Typography.Text type="secondary">
                Encuentra un registro existente por OT.
              </Typography.Text>

              <Search
                placeholder="Ej: OT-000123"
                enterButton="Buscar"
                size="large"
                allowClear
                prefix={<SearchOutlined />}
                onSearch={(value) => {
                  if (!value) return;
                  showModalVibraciones(value);
                }}
              />
            </Space>
          </Card>
        </Col>
      </Row>

      <DataModalVibraciones
        ot_data={otData}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      />

      <ModalVibracionesOT
        vibracion_data={vibracionData}
        open={isModalOpenSearch}
        onOk={handleOkSearch}
        onCancel={handleCancelSearch}
      />
    </div>
  );
}

export default GetOrCreateVibracionesPanel;
