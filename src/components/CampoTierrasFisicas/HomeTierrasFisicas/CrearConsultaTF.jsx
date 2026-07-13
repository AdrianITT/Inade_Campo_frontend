import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Typography,
  Modal,
  Descriptions,
  Select,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
} from "@ant-design/icons";

import {
  getCreateTierrasFisicas,
  getEditTierrasFisicas,
  getMaquinasTF,
  createTierrasFisicas
} from "../../../apis/ApiCampo/TierrasFisicasApi.js";

const { Title, Text } = Typography;

const CrearConsultaTF = () => {

  const [otCrear, setOtCrear] = useState("");
  const [otEditar, setOtEditar] = useState("");
  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState({
    crear: false,
    editar: false,
  });

  const [modal, setModal] = useState({
    open: false,
    title: "",
    error: false,
    data: null,
    message: "",
  });

  const validarOT = (ot) => {
    return /^\d{6}-\d{2}$/.test(ot);
  };

  const openModal = ({
    title,
    error = false,
    data = null,
    message = "",
  }) => {

    setModal({
      open: true,
      title,
      error,
      data,
      message,
    });

  };

  // CREAR
  const handleCrear = async () => {

    if (!validarOT(otCrear)) {

      return openModal({
        title: "Formato inválido",
        error: true,
        message: "La OT debe tener formato 243546-10",
      });

    }

    try {

      setLoading((prev) => ({
        ...prev,
        crear: true,
      }));
      

      const response =
        await getCreateTierrasFisicas(otCrear);
      // console.log(response);
      const maquinadata = 
      await getMaquinasTF();
      // console.log("maquinadata: ",maquinadata);


      const mq = maquinadata.data.machines.map((mtf)=>({
        value: mtf.id,
        label: `Máquina # ${mtf.equipoId}`,
        disabled: !mtf.estado,
      }));
      console.log("maquinas", mq);
      openModal({
        title: "Crear Tierra Física",
        data: {
          ...response.data,
          maquinas:mq,
        },
      });

    } catch (error) {

      openModal({
        title: "Error",
        error: true,
        message:
          error?.response?.data?.error ||
          "Ocurrió un error",
      });

    } finally {

      setLoading((prev) => ({
        ...prev,
        crear: false,
      }));

    }
  };

  // EDITAR
  const handleEditar = async () => {

    if (!validarOT(otEditar)) {

      return openModal({
        title: "Formato inválido",
        error: true,
        message: "La OT debe tener formato 243546-10",
      });

    }

    try {

      setLoading((prev) => ({
        ...prev,
        editar: true,
      }));

      const response =
        await getEditTierrasFisicas(otEditar);

      openModal({
        title: "Editar Tierra Física",
        data: response.data,
      });

    } catch (error) {

      openModal({
        title: "Error",
        error: true,
        message:
          error?.response?.data?.error ||
          "Ocurrió un error",
      });

    } finally {

      setLoading((prev) => ({
        ...prev,
        editar: false,
      }));

    }
  };

  const handleCreateTF = async () =>{
    try{
      const payload ={
        ordenTrabajo: modal.data.id,
        maquinaTF: maquinaSeleccionada,
        estado: 2,
        fecha: new Date().toISOString(),
      };
      
      console.log(payload);
      const dataTF = await createTierrasFisicas(payload);

      openModal({
        title: "Correcto",
        message: "Tierras Fisicas creada correctamente",
        error: false,
      });
      setTimeout(()=>{
        navigate(`/DetallesTierrasFisicas/${dataTF.data.id}`)
      },600);
    }catch(error){
          
      openModal({
      title: "Error",
      message:
        error?.response?.data?.error ||
        "Ocurrió un error",
      error: true,
    });

    }
  };

  const handleEditTF = async () => {
    try{
      console.log("data", modal.data.idtf);
      setTimeout(()=>{
      navigate(`/DetallesTierrasFisicas/${modal.data.idtf}`)
      },600);
    }catch(error){
      console.log(error);
    }
  };

  return (
    <div
      style={{
        padding: 30,
        background: "#f5f7fb",
        minHeight: "100vh",
      }}
    >

      <Card
        style={{
          borderRadius: 16,
        }}
      >

        <Title level={2}>
          Tierras Físicas
        </Title>

        <Text type="secondary">
          Ingresa una OT válida
        </Text>

        <Row
          gutter={[24, 24]}
          style={{ marginTop: 30 }}
        >

          {/* CREAR */}
          <Col xs={24} md={12}>

            <Card>

              <Title level={4}>
                Crear
              </Title>

              <Input
                size="large"
                placeholder="243546-10"
                value={otCrear}
                onChange={(e) =>
                  setOtCrear(e.target.value)
                }
                style={{ marginBottom: 15 }}
              />

              <Button
                type="primary"
                icon={<PlusOutlined />}
                loading={loading.crear}
                onClick={handleCrear}
                block
              >
                Buscar para Crear
              </Button>

            </Card>

          </Col>

          {/* EDITAR */}
          <Col xs={24} md={12}>

            <Card>

              <Title level={4}>
                Editar
              </Title>

              <Input
                size="large"
                placeholder="243546-10"
                value={otEditar}
                onChange={(e) =>
                  setOtEditar(e.target.value)
                }
                style={{ marginBottom: 15 }}
              />

              <Button
                icon={<EditOutlined />}
                loading={loading.editar}
                onClick={handleEditar}
                block
              >
                Buscar para Editar
              </Button>

            </Card>

          </Col>

        </Row>

      </Card>

      {/* MODAL */}
      <Modal
        open={modal.open}
        footer={null}
        centered
        onCancel={() =>
          setModal((prev) => ({
            ...prev,
            open: false,
          }))
        }
      >

        <Title
          level={4}
          style={{
            color: modal.error
              ? "#ff4d4f"
              : "#1677ff",
          }}
        >
          {modal.title}
        </Title>

        {/* ERROR */}
        {modal.error && (
          <Text>
            {modal.message}
          </Text>
        )}

        {/* DATA */}
        {!modal.error && modal.data && (
          <>
          <Descriptions
            bordered
            column={1}
            size="small"
          >

            {modal.data.id && (
              <Descriptions.Item label="ID">
                {modal.data.id}
              </Descriptions.Item>
            )}

            {modal.data.idtf && (
              <Descriptions.Item label="ID Tierra Física">
                {modal.data.idtf}
              </Descriptions.Item>
            )}

            <Descriptions.Item label="OT">
              {modal.data.OT}
            </Descriptions.Item>

            <Descriptions.Item label="Receptor">
              {modal.data.receptor || "Sin receptor"}
            </Descriptions.Item>

            {modal.data.maquina && (
              <Descriptions.Item label="Máquina">
                {JSON.stringify(
                  modal.data.maquina.idMaquina
                )}
              </Descriptions.Item>
            )}

            {modal.data.maquinas && (
              <Descriptions.Item label="Maquinas">
                <Select
                style={{ width: "100%"}}
                options={modal.data.maquinas}
                placeholder="Selecciona una máquina"
                onChange={(value) =>
                  setMaquinaSeleccionada(value)
                }
                />
              </Descriptions.Item>
            )}

          </Descriptions>

            {modal.data.maquinas ? (
              <Button
              type="primary"
              style={{ marginTop: 20 }}
              block
              disabled={!maquinaSeleccionada}
              onClick={handleCreateTF}>Crear Tierra Fisica</Button>
            ):(
              <Button
              type="primary"
              style={{ marginTop: 20}}
              block
              onClick={handleEditTF}
              >
                Continuar
                </Button>
            )}
          </>
          
        )}

      </Modal>

    </div>
  );
};

export default CrearConsultaTF;