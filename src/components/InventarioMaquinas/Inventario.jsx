import React, { useState, useEffect } from "react";
import { 
    Row, 
    Col, 
    Card, 
    Button, 
    Typography, 
    Space, 
    Modal, 
    Form, 
    Input, 
    message, 
    Popconfirm, 
    Tooltip 
} from "antd";
import { 
    PlusOutlined, 
    AppstoreOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    SettingOutlined, 
    EyeOutlined,
    BulbOutlined
} from "@ant-design/icons";
import ModalInventario from "./ModalInventarioMaquinas/ModalInventario";
import { 
    obtenerAreas, 
    crearArea, 
    actualizarArea, 
    eliminarArea,
    obtenerInventarioMaquinas 
} from "../../apis/ApiCampo/InventarioMaquinasApi";

import {
    getAllMachineLight
} from "../../apis/ApiCampo/IluminacionApi";
import { MachineLightManagerModal } from "../CampoIluminacion/ModalIluminacion/MachinaLightManagerModal";

const { Title, Text } = Typography;

/**
 * Componente Principal: Inventario
 * Muestra el catálogo de Áreas en formato de tarjetas interactivas (cards).
 * Permite agregar, editar y eliminar áreas de manera dinámica y abre el modal 
 * de administración de máquinas para el área seleccionada.
 */
const Inventario = () => {
    // -------------------------------------------------------------
    // ESTADOS LOCALES DE REACT
    // -------------------------------------------------------------
    const [cargando, setCargando] = useState(false);
    const [listaAreas, setListaAreas] = useState([]);
    
    // Almacena un mapa de { areaId: cantidadDeMaquinas } para mostrar contadores dinámicos en las tarjetas
    const [conteoMaquinas, setConteoMaquinas] = useState({});

    // Controla si se abre el modal principal de máquinas de un área
    const [modalInventarioVisible, setModalInventarioVisible] = useState(false);
    const [areaSeleccionada, setAreaSeleccionada] = useState(null);

    // Controla el modal de Iluminación (separado del inventario general)
    const [machineLightModalVisible, setMachineLightModalVisible] = useState(false);
    const [cantidadMachineLight, setCantidadMachineLight] = useState(0);

    // Controla el modal secundario para Crear o Editar un Área
    const [modalAreaVisible, setModalAreaVisible] = useState(false);
    const [areaEnEdicion, setAreaEnEdicion] = useState(null); // Si es null => Creando, si tiene datos => Editando
    
    // Instancia del formulario para gestionar el nombre de la nueva/editada Área
    const [formArea] = Form.useForm();

    // -------------------------------------------------------------
    // EFECTOS (Carga de datos al montar el componente)
    // -------------------------------------------------------------
    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    // -------------------------------------------------------------
    // FUNCIONES API Y LÓGICA DE NEGOCIO
    // -------------------------------------------------------------

    /**
     * Carga de manera paralela las Áreas y los registros de Inventario 
     * para calcular la cantidad de máquinas por área.
     */
    const cargarDatosIniciales = async () => {
        setCargando(true);
        try {
            // Hacemos las tres peticiones concurrentemente para mejorar la velocidad
            const [respuestaAreas, respuestaInventario, respuestaLight] = await Promise.all([
                obtenerAreas(),
                obtenerInventarioMaquinas(),
                getAllMachineLight()
            ]);

            const areas = respuestaAreas.data;
            const inventario = Array.isArray(respuestaInventario.data?.inventario_maquinas)
                ? respuestaInventario.data.inventario_maquinas
                : [];

            // Calculamos cuántas máquinas hay en cada área
            const mapaConteo = {};
            
            // Inicializamos todas las áreas en 0 máquinas
            areas.forEach(area => {
                mapaConteo[area.id] = 0;
            });

            // Sumamos las máquinas correspondientes a cada área en el inventario
            inventario.forEach(item => {
                if (item.area && mapaConteo[item.area] !== undefined) {
                    mapaConteo[item.area] += 1;
                }
            });
            // console.log("Mapa de conteo de máquinas por área:", mapaConteo);
            // console.log("Áreas obtenidas:", areas);
            setListaAreas(areas);
            setConteoMaquinas(mapaConteo);

            // Almacenamos el total de máquinas de luz
            const machinesLight = Array.isArray(respuestaLight.data?.machines)
                ? respuestaLight.data.machines
                : [];
            setCantidadMachineLight(machinesLight.length);
        } catch (error) {
            console.error("Error cargando los datos iniciales:", error);
            message.error("No se pudo obtener la información del servidor.");
        } finally {
            setCargando(false);
        }
    };

    /**
     * Abre el modal para crear una nueva área.
     */
    const iniciarCreacionArea = () => {
        setAreaEnEdicion(null);
        formArea.resetFields();
        setModalAreaVisible(true);
    };

    /**
     * Abre el modal para renombrar una área existente.
     */
    const iniciarEdicionArea = (e, area) => {
        // Evitamos que el clic se propague a la tarjeta (que abriría el modal de máquinas)
        e.stopPropagation();
        
        setAreaEnEdicion(area);
        formArea.setFieldsValue({ nombre: area.nombre });
        setModalAreaVisible(true);
    };

    /**
     * Envía los datos del formulario al servidor para crear o actualizar un Área.
     */
    const guardarArea = async (valores) => {
        try {
            if (areaEnEdicion) {
                // Modo Edición: Actualizar Área
                await actualizarArea(areaEnEdicion.id, { nombre: valores.nombre });
                message.success("Área renombrada con éxito.");
            } else {
                // Modo Creación: Crear Área
                await crearArea({ nombre: valores.nombre });
                message.success("Nueva área registrada.");
            }
            
            setModalAreaVisible(false);
            cargarDatosIniciales();
        } catch (error) {
            console.error("Error al guardar área:", error);
            message.error("No se pudo guardar el área. Verifica si ya existe.");
        }
    };

    /**
     * Elimina un área completa del servidor.
     */
    const confirmarEliminarArea = async (e, idArea) => {
        // Evitamos la propagación del evento para no abrir el inventario de máquinas
        e.stopPropagation();
        
        try {
            await eliminarArea(idArea);
            message.success("El área ha sido eliminada del sistema.");
            cargarDatosIniciales();
        } catch (error) {
            console.error("Error al eliminar área:", error);
            message.error("No se pudo eliminar el área. Es posible que tenga registros asociados.");
        }
    };

    /**
     * Abre el modal principal de máquinas al seleccionar una tarjeta.
     */
    const abrirInventarioDeArea = (area) => {
        setAreaSeleccionada(area);
        setModalInventarioVisible(true);
    };

    /**
     * Cierra el modal de máquinas y recarga los datos para actualizar los contadores.
     */
    const cerrarInventarioYRefrescar = () => {
        setModalInventarioVisible(false);
        setAreaSeleccionada(null);
        cargarDatosIniciales();
    };

    /**
     * Cierra el modal de Iluminación y recarga los datos.
     */
    const cerrarMachineLightModal = () => {
        setMachineLightModalVisible(false);
        cargarDatosIniciales();
    };

    // -------------------------------------------------------------
    // RENDERIZADO DE INTERFAZ (Aesthetics)
    // -------------------------------------------------------------
    return (
        <div style={{ padding: "32px", backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
            
            {/* Cabecera Principal */}
            <Row justify="space-between" align="middle" style={{ marginBottom: "32px" }}>
                <Col>
                    <Title level={2} style={{ margin: 0, color: "#141414", fontWeight: "700" }}>
                        Inventario de Máquinas por Áreas
                    </Title>
                    <Text type="secondary" style={{ fontSize: "14px" }}>
                        Selecciona un área para administrar sus equipos o agrega nuevas divisiones.
                    </Text>
                </Col>
                <Col>
                    {/* <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        size="large"
                        onClick={iniciarCreacionArea}
                        style={{ 
                            borderRadius: "8px", 
                            height: "46px", 
                            fontWeight: "600",
                            boxShadow: "0 4px 12px rgba(24, 144, 255, 0.25)"
                        }}
                    >
                        Agregar Área
                    </Button> */}
                </Col>
            </Row>

            {/* Grid de Tarjetas (Cards) */}
            <Row gutter={[24, 24]} loading={cargando}>
                
                {/* Mapeamos cada área obtenida del backend */}
                {listaAreas.map((area) => {
                    const totalMaquinas = conteoMaquinas[area.id] || 0;
                    
                    return (
                        <Col xs={24} sm={12} md={8} lg={6} key={area.id}>
                            <Card
                                hoverable
                                onClick={() => abrirInventarioDeArea(area)}
                                style={{
                                    borderRadius: "12px",
                                    border: "1px solid #e8e8e8",
                                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                                    transition: "all 0.3s ease",
                                    height: "100%"
                                }}
                                bodyStyle={{ padding: "24px" }}
                                actions={[
                                    <Tooltip title="Ver Máquinas">
                                        <EyeOutlined style={{ color: "#1890ff", fontSize: "16px" }} />
                                    </Tooltip>,
                                    <Tooltip title="Renombrar Área">
                                        <EditOutlined 
                                            style={{ color: "#faad14", fontSize: "16px" }} 
                                            onClick={(e) => iniciarEdicionArea(e, area)}
                                        />
                                    </Tooltip>,
                                    // <Popconfirm
                                    //     title="¿Eliminar esta área?"
                                    //     description="Esto borrará el área (los equipos quedarán sin área asociada)."
                                    //     okText="Sí, eliminar"
                                    //     cancelText="No"
                                    //     onConfirm={(e) => confirmarEliminarArea(e, area.id)}
                                    //     onCancel={(e) => e.stopPropagation()}
                                    // >
                                    //     <Tooltip title="Eliminar Área">
                                    //         <DeleteOutlined 
                                    //             style={{ color: "#ff4d4f", fontSize: "16px" }} 
                                    //             onClick={(e) => e.stopPropagation()} // Evita abrir el modal
                                    //         />
                                    //     </Tooltip>
                                    // </Popconfirm>
                                ]}
                            >
                                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                                    <div style={{
                                        width: "48px",
                                        height: "48px",
                                        borderRadius: "10px",
                                        backgroundColor: "#e6f7ff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                        <AppstoreOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
                                    </div>
                                    
                                    <div>
                                        <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: "600", color: "#262626" }}>
                                            {area.nombre}
                                        </h3>
                                        <Text type="secondary" style={{ fontSize: "13px" }}>
                                            {totalMaquinas === 1 
                                                ? "1 máquina registrada" 
                                                : `${totalMaquinas} máquinas registradas`}
                                        </Text>
                                    </div>
                                </Space>
                            </Card>
                        </Col>
                    );
                })}

                {/* Si no hay áreas registradas, mostramos un estado vacío */}
                {listaAreas.length === 0 && !cargando && (
                    <Col span={24}>
                        <Card 
                            style={{ 
                                borderRadius: "12px", 
                                textAlign: "center", 
                                padding: "48px",
                                borderStyle: "dashed" 
                            }}
                        >
                            <Space direction="vertical" size="middle">
                                <SettingOutlined style={{ fontSize: "48px", color: "#bfbfbf" }} />
                                <div>
                                    <h3>No se han creado áreas</h3>
                                    <Text type="secondary">
                                        Haz clic en "Agregar Área" para registrar tu primera sección de inventario.
                                    </Text>
                                </div>
                                <Button type="dashed" icon={<PlusOutlined />} onClick={iniciarCreacionArea}>
                                    Crear Área ahora
                                </Button>
                            </Space>
                        </Card>
                    </Col>
                )}

            </Row>

            {/* =======================================================
                TARJETA DEDICADA DE MÁQUINAS DE LUZ
                ======================================================= */}
            {listaAreas.length > 0 && (
                <Row gutter={[24, 24]} style={{ marginTop: "40px" }}>
                    <Col span={24}>
                        <Title level={4} style={{ margin: "0 0 16px 0", color: "#141414", fontWeight: "600" }}>
                            Máquinas de Luz
                        </Title>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card
                            hoverable
                            onClick={() => setMachineLightModalVisible(true)}
                            style={{
                                borderRadius: "12px",
                                border: "1px solid #e8e8e8",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                                transition: "all 0.3s ease",
                                height: "100%"
                            }}
                            bodyStyle={{ padding: "24px" }}
                        >
                            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                                <div style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "10px",
                                    backgroundColor: "#fff7e6",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <BulbOutlined style={{ fontSize: "24px", color: "#faad14" }} />
                                </div>
                                <div>
                                    <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: "600", color: "#262626" }}>
                                        Máquinas de Luz
                                    </h3>
                                    <Text type="secondary" style={{ fontSize: "13px" }}>
                                        {cantidadMachineLight === 1
                                            ? "1 máquina registrada"
                                            : `${cantidadMachineLight} máquinas registradas`}
                                    </Text>
                                </div>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* =======================================================
                MODAL DE GESTIÓN DE MÁQUINAS (CRUD de Máquinas de un Área)
                ======================================================= */}
            <ModalInventario 
                visible={modalInventarioVisible} 
                alCerrar={cerrarInventarioYRefrescar}
                areaSeleccionada={areaSeleccionada}
            />

            {/* =======================================================
                MODAL DE MÁQUINAS DE LUZ (separado del inventario general)
                ======================================================= */}
            <MachineLightManagerModal
                open={machineLightModalVisible}
                onCancel={cerrarMachineLightModal}
            />

            {/* =======================================================
                MODAL PARA CREAR / EDITAR ÁREA
                ======================================================= */}
            <Modal
                title={areaEnEdicion ? "Renombrar Área" : "Crear Nueva Área"}
                open={modalAreaVisible}
                onCancel={() => setModalAreaVisible(false)}
                okText={areaEnEdicion ? "Guardar Cambios" : "Crear Área"}
                cancelText="Cancelar"
                onOk={() => formArea.submit()}
                destroyOnClose
                centered
                style={{ borderRadius: "10px" }}
            >
                <Form
                    form={formArea}
                    layout="vertical"
                    onFinish={guardarArea}
                    style={{ marginTop: "16px" }}
                >
                    <Form.Item
                        label="Nombre del Área"
                        name="nombre"
                        rules={[
                            { required: true, message: "Por favor ingresa un nombre para el área." },
                            { max: 250, message: "El nombre no puede superar los 250 caracteres." }
                        ]}
                    >
                        <Input placeholder="Ej: Tierras Físicas, Calderas, Muestreo" style={{ borderRadius: "5px" }} />
                    </Form.Item>
                </Form>
            </Modal>

        </div>
    );
};

export default Inventario;