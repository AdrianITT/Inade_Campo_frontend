import React, { useState, useEffect, useCallback } from "react";
import { 
    Modal, 
    Table, 
    Button, 
    Form, 
    Input, 
    Switch, 
    DatePicker, 
    Space, 
    Popconfirm, 
    message, 
    Divider, 
    Tag
} from "antd";
import { 
    PlusOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    ArrowLeftOutlined, 
    SaveOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from "@ant-design/icons";
import moment from "moment";
import { 
    crearMaquina, 
    actualizarMaquina, 
    crearInventarioMaquina, 
    actualizarInventarioMaquina, 
    eliminarInventarioMaquina,
    obtenerInventarioMaquinas 
} from "../../../apis/ApiCampo/InventarioMaquinasApi";

/**
 * Componente ModalInventario
 * Este componente maneja todo el flujo de visualizar, crear, editar y eliminar 
 * las máquinas asignadas a un área específica.
 * 
 * Props:
 * - visible: booleano para controlar si el modal está abierto o cerrado.
 * - alCerrar: función para cerrar el modal desde el componente padre.
 * - areaSeleccionada: objeto del área activa seleccionada ({ id, nombre }).
 */
const ModalInventario = ({ visible, alCerrar, areaSeleccionada }) => {
    // -------------------------------------------------------------
    // ESTADOS LOCALES DE REACT (Manejo de datos y vistas)
    // -------------------------------------------------------------
    const [cargando, setCargando] = useState(false);
    const [maquinasInventario, setMaquinasInventario] = useState([]);
    
    // Controla si estamos viendo la Tabla de Máquinas (false) o el Formulario de Crear/Editar (true)
    const [verFormulario, setVerFormulario] = useState(false);
    
    // Guarda el registro que estamos editando. Si es null, significa que estamos Creando.
    const [registroEnEdicion, setRegistroEnEdicion] = useState(null);
    
    // Instancia del formulario de Ant Design para controlar valores y validaciones
    const [formulario] = Form.useForm();

    // -------------------------------------------------------------
    // FUNCIONES API Y LÓGICA DE NEGOCIO
    // -------------------------------------------------------------

    /**
     * Carga todos los registros del inventario del servidor y filtra por el área seleccionada.
     * 
     * NOTA PARA JUNIORS: Usamos useCallback para evitar que React recree esta función en cada render.
     * Esto previene bucles de renderizado infinito al usarla en el useEffect de abajo.
     */
    const cargarMaquinasPorArea = useCallback(async () => {
        if (!areaSeleccionada) return;
        setCargando(true);
        try {
            const respuesta = await obtenerInventarioMaquinas();
            // console.log("Respuesta completa del inventario:", respuesta);
            // Adaptado para la nueva vista del backend que devuelve { inventario_maquinas: [...] }
            const listado = Array.isArray(respuesta.data?.inventario_maquinas) 
                ? respuesta.data.inventario_maquinas 
                : [];

            // Filtramos los registros de inventario cuya área coincida con la que abrimos
            const datosFiltrados = listado.filter(
                (item) => item.area === areaSeleccionada.id
            );
            
            setMaquinasInventario(datosFiltrados);
        } catch (error) {
            console.error("Error cargando inventario:", error);
            message.error("No se pudieron cargar las máquinas del área seleccionada.");
        } finally {
            setCargando(false);
        }
    }, [areaSeleccionada]);

    // -------------------------------------------------------------
    // EFECTOS (Carga inicial de datos al abrir el modal o cambiar de área)
    // -------------------------------------------------------------
    useEffect(() => {
        if (visible && areaSeleccionada) {
            cargarMaquinasPorArea();
            // Reseteamos la vista al abrir el modal para que siempre comience en la tabla
            setVerFormulario(false);
            setRegistroEnEdicion(null);
        }
    }, [visible, areaSeleccionada, cargarMaquinasPorArea]);

    /**
     * Prepara el formulario para CREAR una nueva máquina.
     */
    const iniciarCreacion = () => {
        setRegistroEnEdicion(null);
        formulario.resetFields();
        setVerFormulario(true);
    };

    /**
     * Prepara el formulario para EDITAR una máquina existente y rellena los datos correspondientes.
     */
    const iniciarEdicion = (registro) => {
        // console.log("Registro seleccionado para edición:", registro);
        setRegistroEnEdicion(registro);
        
        // Rellenamos el formulario de Ant Design. 
        // Si el registro tiene maquina, extraemos los datos de la maquina física.
        // NOTA: Soportamos tanto 'nombre' (devuelto por get_inventario_maquinas) como 'equipoId'.
        formulario.setFieldsValue({
            equipoId: registro.maquina?.nombre || registro.maquina?.equipoId || "",
            marca: registro.maquina?.marca || "",
            modelo: registro.maquina?.modelo || "",
            serie: registro.maquina?.serie || "",
            estado: registro.maquina?.estado || false,
            noCertificado: registro.noCertificado || "",
            fechaCertificado: registro.fechaCertificado ? moment(registro.fechaCertificado) : null,
            provedor: registro.provedor || ""
        });
        
        setVerFormulario(true);
    };

    /**
     * Guarda la información del formulario (Soporta Crear y Editar).
     */
    const guardarDatos = async (valores) => {
        setCargando(true);
        try {
            // Estructuramos los datos para enviar a la API de la máquina física
            const datosMaquina = {
                equipoId: valores.equipoId,
                marca: valores.marca,
                modelo: valores.modelo,
                serie: valores.serie,
                estado: valores.estado
            };

            // Estructuramos los datos para la API de Inventario
            const datosInventario = {
                fechaCertificado: valores.fechaCertificado ? valores.fechaCertificado.format("YYYY-MM-DD") : null,
                noCertificado: valores.noCertificado,
                provedor: valores.provedor,
                area: areaSeleccionada.id
            };

            if (registroEnEdicion) {
                // ==========================================
                // CASO: EDITANDO REGISTRO EXISTENTE
                // ==========================================
                
                // 1. Actualizamos la máquina física si existe relación
                const maquinaId = registroEnEdicion.maquina?.id;
                if (maquinaId) {
                    await actualizarMaquina(maquinaId, datosMaquina);
                }

                // 2. Actualizamos el registro en InventarioMaquinas
                datosInventario.maquina = maquinaId; // Mantenemos la relación de llave foránea
                await actualizarInventarioMaquina(registroEnEdicion.id, datosInventario);

                message.success("Registro de máquina actualizado correctamente.");
            } else {
                // ==========================================
                // CASO: CREANDO NUEVA MÁQUINA
                // ==========================================
                
                // 1. Creamos primero la máquina física en la base de datos
                const respuestaMaquina = await crearMaquina(datosMaquina);
                const nuevaMaquinaId = respuestaMaquina.data.id;

                // 2. Asociamos esa nueva máquina al área actual mediante InventarioMaquinas
                datosInventario.maquina = nuevaMaquinaId; // Asignamos la llave foránea
                await crearInventarioMaquina(datosInventario);

                message.success("Máquina agregada y registrada en el inventario con éxito.");
            }

            // Refrescamos la lista y volvemos a la vista de tabla
            setVerFormulario(false);
            setRegistroEnEdicion(null);
            cargarMaquinasPorArea();
        } catch (error) {
            console.error("Error al guardar datos:", error);
            const mensajeError = error.response?.data?.error || "Ocurrió un error al procesar la solicitud.";
            message.error(mensajeError);
        } finally {
            setCargando(false);
        }
    };

    /**
     * Elimina el registro del inventario (quita la máquina de esta área).
     */
    const confirmarEliminacion = async (idInventario) => {
        setCargando(true);
        try {
            await eliminarInventarioMaquina(idInventario);
            message.success("Máquina eliminada del inventario del área.");
            cargarMaquinasPorArea();
        } catch (error) {
            console.error("Error al eliminar del inventario:", error);
            message.error("No se pudo eliminar la máquina del inventario.");
        } finally {
            setCargando(false);
        }
    };

    // -------------------------------------------------------------
    // DEFINICIÓN DE COLUMNAS DE LA TABLA (Ant Design)
    // -------------------------------------------------------------
    const columnas = [
        {
            title: "Equipo ID",
            key: "equipoId",
            render: (_, registro) => <strong>{registro.maquina?.nombre || registro.maquina?.equipoId || "N/A"}</strong>
        },
        {
            title: "Marca / Modelo",
            key: "marcaModelo",
            render: (_, registro) => (
                <span>
                    {registro.maquina?.marca || "N/A"} / {registro.maquina?.modelo || "N/A"}
                </span>
            )
        },
        {
            title: "Serie",
            dataIndex: ["maquina", "serie"],
            key: "serie"
        },
        {
            title: "Estado",
            dataIndex: ["maquina", "estado"],
            key: "estado",
            render: (estado) => (
                estado ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>Activo</Tag>
                ) : (
                    <Tag color="error" icon={<CloseCircleOutlined />}>Inactivo</Tag>
                )
            )
        },
        {
            title: "Certificado",
            dataIndex: "noCertificado",
            key: "noCertificado",
            render: (text) => text || <span style={{ color: "#bfbfbf" }}>Sin Certificado</span>
        },
        {
            title: "Fecha Cert.",
            dataIndex: "fechaCertificado",
            key: "fechaCertificado",
            render: (fecha) => fecha ? moment(fecha).format("DD/MM/YYYY") : "-"
        },
        {
            title: "Proveedor",
            dataIndex: "provedor",
            key: "provedor",
            render: (text) => text || "-"
        },
        {
            title: "Acciones",
            key: "acciones",
            width: 120,
            fixed: 'right',
            render: (_, registro) => (
                <Space size="middle">
                    <Button 
                        type="text" 
                        icon={<EditOutlined style={{ color: "#1890ff" }} />} 
                        onClick={() => iniciarEdicion(registro)}
                    />
                    <Popconfirm
                        title="¿Estás seguro de eliminar esta máquina del inventario?"
                        description="Esta acción desvinculará la máquina de esta área."
                        okText="Sí, eliminar"
                        cancelText="No"
                        onConfirm={() => confirmarEliminacion(registro.id)}
                    >
                        <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />} 
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // -------------------------------------------------------------
    // RENDERIZADO DEL COMPONENTE
    // -------------------------------------------------------------
    return (
        <Modal
            title={
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "#1f1f1f" }}>
                    {areaSeleccionada ? `Área: ${areaSeleccionada.nombre}` : "Inventario de Máquinas"}
                </div>
            }
            open={visible}
            onCancel={alCerrar}
            footer={null} // Ocultamos el pie de página predeterminado porque manejamos el flujo adentro
            width={1000}
            centered
            destroyOnClose
            style={{ borderRadius: "12px", overflow: "hidden" }}
        >
            {/* Si no estamos viendo el formulario, mostramos la TABLA con las máquinas */}
            {!verFormulario ? (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <span style={{ fontSize: "15px", color: "#8c8c8c" }}>
                            Lista de máquinas registradas en este sector
                        </span>
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            onClick={iniciarCreacion}
                            style={{ borderRadius: "6px" }}
                        >
                            Agregar Máquina
                        </Button>
                    </div>

                    <Table 
                        dataSource={maquinasInventario} 
                        columns={columnas}
                        rowKey="id" 
                        loading={cargando}
                        pagination={{ pageSize: 5 }}
                        scroll={{ x: 800 }}
                        bordered
                        locale={{ emptyText: "No hay máquinas asignadas a este área todavía." }}
                    />
                </div>
            ) : (
                // Si verFormulario es TRUE, mostramos el Formulario de Creación/Edición
                <div>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                        <Button 
                            icon={<ArrowLeftOutlined />} 
                            onClick={() => setVerFormulario(false)}
                            style={{ marginRight: "12px", borderRadius: "5px" }}
                        >
                            Regresar
                        </Button>
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
                            {registroEnEdicion ? "Editar Datos de Máquina" : "Registrar Nueva Máquina en Área"}
                        </h3>
                    </div>

                    <Form
                        form={formulario}
                        layout="vertical"
                        onFinish={guardarDatos}
                        initialValues={{ estado: true }}
                    >
                        {/* 1. Datos Generales de la Máquina Física */}
                        <Divider orientation="left" style={{ margin: "10px 0" }}>
                            <span style={{ fontSize: "14px", color: "#1890ff" }}>Datos Físicos del Equipo</span>
                        </Divider>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                            <Form.Item
                                label="ID del Equipo"
                                name="equipoId"
                                rules={[{ required: true, message: "Por favor ingresa el ID único del equipo." }]}
                            >
                                <Input placeholder="Ej: MQ-TF-01" style={{ borderRadius: "5px" }} />
                            </Form.Item>

                            <Form.Item
                                label="Marca"
                                name="marca"
                                rules={[{ required: true, message: "Por favor ingresa la marca." }]}
                            >
                                <Input placeholder="Ej: Fluke" style={{ borderRadius: "5px" }} />
                            </Form.Item>

                            <Form.Item
                                label="Modelo"
                                name="modelo"
                                rules={[{ required: true, message: "Por favor ingresa el modelo." }]}
                            >
                                <Input placeholder="Ej: 1625-2" style={{ borderRadius: "5px" }} />
                            </Form.Item>

                            <Form.Item
                                label="Número de Serie"
                                name="serie"
                                rules={[{ required: true, message: "Por favor ingresa el número de serie." }]}
                            >
                                <Input placeholder="Ej: SN-872364" style={{ borderRadius: "5px" }} />
                            </Form.Item>
                        </div>

                        <Form.Item
                            label="Estado del Equipo"
                            name="estado"
                            valuePropName="checked"
                            style={{ marginTop: "8px" }}
                        >
                            <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
                        </Form.Item>
                        <div
                            style={{
                                color: "#8c8c8c",
                                fontSize: "12px",
                                marginTop: "-12px",
                                marginBottom: "16px",
                            }}
                        >
                            (Determina si la máquina está operativa y disponible para uso)
                        </div>

                        {/* 2. Datos de Certificación y Proveedor */}
                        <Divider orientation="left" style={{ margin: "20px 0 10px 0" }}>
                            <span style={{ fontSize: "14px", color: "#1890ff" }}>Certificado e Inventario</span>
                        </Divider>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                            <Form.Item
                                label="Número de Certificado"
                                name="noCertificado"
                            >
                                <Input placeholder="Ej: CERT-2026-981" style={{ borderRadius: "5px" }} />
                            </Form.Item>

                            <Form.Item
                                label="Fecha de Certificado"
                                name="fechaCertificado"
                            >
                                <DatePicker 
                                    style={{ width: "100%", borderRadius: "5px" }} 
                                    placeholder="Selecciona la fecha"
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Proveedor"
                                name="provedor"
                            >
                                <Input placeholder="Ej: Laboratorio Metrológico S.A." style={{ borderRadius: "5px" }} />
                            </Form.Item>
                        </div>

                        {/* Botones de Envío */}
                        <Form.Item style={{ marginTop: "24px", textAlign: "right" }}>
                            <Space>
                                <Button 
                                    onClick={() => setVerFormulario(false)}
                                    style={{ borderRadius: "5px" }}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    icon={<SaveOutlined />}
                                    loading={cargando}
                                    style={{ borderRadius: "5px" }}
                                >
                                    Guardar Máquina
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </div>
            )}
        </Modal>
    );
};

export default ModalInventario;