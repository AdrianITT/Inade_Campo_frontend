import React, { useState, useEffect } from "react";
import {
  Upload,
  Button,
  Card,
  Typography,
  message,
  Form,
  Input,
  InputNumber,
  Radio,
  Space,
  Divider,
  Row,
  Col,
  Grid,
  Tag,
  Alert,
  Tooltip,
  Badge,
  Modal,
} from "antd";
import {
  UploadOutlined,
  HolderOutlined,
  DeleteOutlined,
  PlusOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { uploadExcels, getVibracionesPuntos, deleteVibracionPunto } from "../../apis/ApiCampo/ApiVibraciones";

const { Title, Text } = Typography;
const { TextArea } = Input;

const normFile = (e) => {
  if (Array.isArray(e)) return e;
  return e?.fileList ?? [];
};

const SortablePointCard = ({ id, title, onRemove, isMobile, isPersisted, fileCount = 0, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: 18,
    opacity: isDragging ? 0.8 : 1,
    cursor: "default",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: isDragging
      ? "0 12px 30px rgba(0,0,0,0.12)"
      : "0 6px 18px rgba(15, 23, 42, 0.06)",
  };

  return (
    <Card
      ref={setNodeRef}
      type="inner"
      style={style}
      bodyStyle={{
        touchAction: "auto",
        background: "#fff",
      }}
      title={
        <Space wrap>
          <Text strong>{title}</Text>
          <Tag color={isPersisted ? "green" : "blue"}>
            {isPersisted ? "Guardado" : "Nuevo"}
          </Tag>
          {fileCount > 0 && <Badge count={fileCount} showZero={false} />}
        </Space>
      }
      extra={
        <Space direction={isMobile ? "vertical" : "horizontal"} size={8}>
          <span
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            style={{
              display: isMobile ? "block" : "inline-flex",
              width: isMobile ? "100%" : "auto",
              touchAction: "none",
              WebkitUserSelect: "none",
              userSelect: "none",
            }}
          >
            <Button htmlType="button" icon={<HolderOutlined />} block={isMobile}>
              Arrastrar
            </Button>
          </span>

          <Button
            htmlType="button"
            icon={<DeleteOutlined />}
            danger
            onClick={onRemove}
            block={isMobile}
          >
            Eliminar
          </Button>
        </Space>
      }
    >
      {children}
    </Card>
  );
};

const FileVibraciones = ({dataCliente, idVibracion, onUploadSuccess}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [loadingReconocimiento, setLoadingReconocimiento] = useState(false);

  useEffect(() => {
  const cargarPuntosReconocimiento = async () => {
    if (!dataCliente) return;

    // Si NO tiene reconocimiento, dejar formulario vacío
    if (!dataCliente?.tieneReconocimiento) {
      form.resetFields();
      form.setFieldsValue({ puntos: [{}] });
      return;
    }

    try {
      setLoadingReconocimiento(true);
      // la constante res recive el id de cada punto
      const res = await getVibracionesPuntos(idVibracion);
      console.log("Respuesta del backend para puntos de reconocimiento:", res);
      const puntosBackend = res?.data?.reconocimiento_id ?? [];

      if (!Array.isArray(puntosBackend) || puntosBackend.length === 0) {
        form.resetFields();
        form.setFieldsValue({ puntos: [{}] });
        return;
      }

      const puntosForm = puntosBackend.map((item) => ({
        puntoId:item?.id ?? null,
        punto: item?.punto ?? "",
        area: item?.area ?? "",
        proceso: item?.proceso ?? "",
        poe: item?.poe ?? "",
        horasTrabajoDia:
          item?.horaTrabajoDia !== undefined && item?.horaTrabajoDia !== null
            ? Number(item.horaTrabajoDia)
            : null,
        // horasExposicionDia:
        //   item?.horaExposicion !== undefined && item?.horaExposicion !== null
        //     ? Number(item.horaExposicion)
        //     : null,
        metodoEvaluar:
          item?.metodoAEvaluar !== undefined && item?.metodoAEvaluar !== null
            ? Number(item.metodoAEvaluar)
            : null,
        actividad: item?.actividad ?? "",
        maquina: item?.maquina ?? "",
        nombreTrabajador: item?.nombreTrabajo ?? "",
        ciclos: item?.ciclo ?? "",
        duracionCiclo: item?.duracionCiclo ?? "",
        excels: [],
      }));

      form.resetFields();
      form.setFieldsValue({
        puntos: puntosForm.length ? puntosForm : [{}],
      });
    } catch (error) {
      console.error("Error al cargar reconocimiento:", error);
      message.error("No se pudieron cargar los puntos del reconocimiento");
      form.resetFields();
      form.setFieldsValue({ puntos: [{}] });
    } finally {
      setLoadingReconocimiento(false);
    }
  };

  cargarPuntosReconocimiento();
}, [dataCliente, idVibracion, form]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 8 },
    })
  );

  const onFinish = async (values) => {
    const direccion = `${dataCliente?.calle ?? ""} ${dataCliente?.numero ?? ""} ${dataCliente?.colonia ?? ""} ${dataCliente?.divicion ?? ""} ${dataCliente?.codigoPostal ?? ""}, ${dataCliente?.ciudad ?? ""} ${dataCliente?.estado ?? ""}`;
    const nombre = `${dataCliente?.clientenombre ?? ""} ${dataCliente?.clienteapPaterno ?? ""} ${dataCliente?.clienteapMaterno ?? ""}`;
    const puntos = (values?.puntos ?? []).map((p, idx) => ({
      punto: p?.punto ?? null,
      area: p?.area ?? "",
      proceso: p?.proceso ?? "",
      poe: p?.poe ?? "",
      // horasExposicionDia: p?.horasExposicionDia ?? null,
      horasTrabajoDia: p?.horasTrabajoDia ?? null,
      metodoEvaluar: p?.metodoEvaluar ?? null,
      actividad: p?.actividad ?? "",
      maquina: p?.maquina ?? "",
      nombreTrabajador: p?.nombreTrabajador ?? "",
      direccion: direccion,
      ciudad: dataCliente?.ciudad ?? "",
      nombreCliente: nombre,
      ot: dataCliente?.codigo ?? "",
      ciclo: p?.ciclos ?? "",
      duracionCiclo: p?.duracionCiclo ?? "",
      idVibracion: idVibracion,
      tieneReconocimiento: dataCliente?.tieneReconocimiento ?? false,
      order: idx,
    }));

    const hasAnyExcel = (values?.puntos ?? []).some(
      (p) => (p?.excels?.length ?? 0) > 0
    );

    if (!hasAnyExcel) {
      message.warning("Agrega al menos un archivo Excel en algún punto");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      // SOLO datos del formulario
      formData.append("data", JSON.stringify({ puntos }));

      // Archivos reales, separados por índice del punto
      (values?.puntos ?? []).forEach((p, idx) => {
        (p?.excels ?? []).forEach((file) => {
          if (file?.originFileObj) {
            formData.append(`files__${idx}`, file.originFileObj, file.name);
          }
        });
      });

      // Depuración de FormData
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log("FormData file:", key, value.name, value.size, value.type);
        } else {
          console.log("FormData field:", key, value);
        }
      }
      console.log("Enviando FormData al backend...");
      console.log("Puntos enviados:", puntos);
      console.log("Archivos enviados:",formData);
      const response = await uploadExcels(formData);

      const contentType = response.headers["content-type"] || "";
      let fileName = `${dataCliente.codigo ?? "OT"}_vibracion_${idVibracion}_resultado.xlsx`;

      if (contentType.includes("application/zip")) {
        fileName = `${dataCliente.codigo ?? "OT"}.zip`;
      } else if (
        contentType.includes(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
      ) {
        fileName = `${dataCliente.codigo ?? "OT"}_vibracion_${idVibracion}_resultado.xlsx`;
      }

      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      message.success("Formulario enviado correctamente");
      form.resetFields();
      if (onUploadSuccess) {
        await onUploadSuccess();
      }
    } catch (error) {
      console.error("Error completo:", error);

      try {
        const data = error?.response?.data;

        if (data instanceof Blob) {
          const texto = await data.text();

          try {
            const json = JSON.parse(texto);
            console.error("Error backend:", json.error);
            console.error("Trace backend:", json.trace);
            message.error(json.error || "No se pudo enviar el formulario");
            return;
          } catch {
            message.error(texto || "No se pudo enviar el formulario");
            return;
          }
        }

        message.error("No se pudo enviar el formulario");
      } catch {
        message.error("No se pudo enviar el formulario");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemovePoint = async (fieldName, remove) => {
  try {
    const puntosActuales = form.getFieldValue("puntos") || [];
    const puntoActual = puntosActuales[fieldName];
    const puntoId = puntoActual?.puntoId;

    console.log("Punto actual:", puntoActual);
    console.log("ID a eliminar:", puntoId);

    // Si el punto viene del backend, primero bórralo en API
    if (puntoId) {
      await deleteVibracionPunto(puntoId);
      message.success("Punto eliminado correctamente");
    }

    // Luego lo quitas del formulario
    remove(fieldName);

    // Si se quedan sin puntos, dejar uno vacío
    const nuevosPuntos = form.getFieldValue("puntos") || [];
    if (nuevosPuntos.length === 0) {
      form.setFieldsValue({ puntos: [{}] });
    }
  } catch (error) {
    console.error("Error al eliminar punto:", error);
    message.error("No se pudo eliminar el punto");
  }
};

  return (
  <Card
    loading={loadingReconocimiento}
    style={{
      maxWidth: 1100,
      margin: isMobile ? "16px 12px" : "32px auto",
      borderRadius: 16,
      boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
      border: "1px solid #f0f0f0",
    }}
    bodyStyle={{ padding: isMobile ? 14 : 24 }}
  >
    <Space direction="vertical" size={6} style={{ width: "100%" }}>
      <Title level={isMobile ? 4 : 3} style={{ marginBottom: 0 }}>
        Formulario Campo Vibraciones
      </Title>

      <Text type="secondary">
        Captura, edita, reordena y adjunta archivos Excel por cada punto evaluado.
      </Text>

      <Space wrap style={{ marginTop: 8 }}>
        <Tag color="blue">OT: {dataCliente?.codigo || "Sin OT"}</Tag>
        <Tag color="purple">Vibración ID: {idVibracion}</Tag>
        <Tag color={dataCliente?.tieneReconocimiento ? "green" : "gold"}>
          {dataCliente?.tieneReconocimiento ? "Reconocimiento cargado" : "Nuevo reconocimiento"}
        </Tag>
        {!!dataCliente?.empresa && <Tag>{dataCliente.empresa}</Tag>}
        {!!dataCliente?.clientenombre && (
          <Tag color="cyan">
            {`${dataCliente?.clientenombre ?? ""} ${dataCliente?.clienteapPaterno ?? ""} ${dataCliente?.clienteapMaterno ?? ""}`.trim()}
          </Tag>
        )}
      </Space>
    </Space>

    <Divider />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ puntos: [{}] }}
      >
        <Form.List name="puntos">
          {(fields, { add, remove, move }) => (
            <>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={({ active, over }) => {
                  if (!over || active.id === over.id) return;

                  const ids = fields.map((f) => String(f.key));
                  const oldIndex = ids.indexOf(String(active.id));
                  const newIndex = ids.indexOf(String(over.id));

                  if (oldIndex !== -1 && newIndex !== -1) {
                    move(oldIndex, newIndex);
                  }
                }}
              >
                <SortableContext
                  items={fields.map((field) => String(field.key))}
                  strategy={verticalListSortingStrategy}
                >
                  {fields.map((field, index) => (
                  <SortablePointCard
                    key={field.key}
                    id={String(field.key)}
                    title={`Punto ${index + 1}`}
                    onRemove={() => handleRemovePoint(field.name, remove)}
                    isMobile={isMobile}
                    isPersisted={!!form.getFieldValue(["puntos", field.name, "puntoId"])}
                    fileCount={(form.getFieldValue(["puntos", field.name, "excels"]) || []).length}
                  >
                      <Form.Item name={[field.name, "puntoId"]} hidden>
                        <Input/>
                      </Form.Item>

                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label="Punto"
                            name={[field.name, "punto"]}
                            rules={[{ required: true, message: "Campo obligatorio" }]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item
                            label="Area"
                            name={[field.name, "area"]}
                            rules={[{ required: true, message: "Campo obligatorio" }]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item
                            label="Proceso"
                            name={[field.name, "proceso"]}
                            rules={[{ required: true, message: "Campo obligatorio" }]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item
                            label="POE"
                            name={[field.name, "poe"]}
                            rules={[{ required: true, message: "Campo obligatorio" }]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item
                            label="Horas de Trabajo por día"
                            name={[field.name, "horasTrabajoDia"]}
                            rules={[{ required: true, message: "Campo obligatorio" }]}
                          >
                            <InputNumber min={0} style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>

                        {/* <Col xs={24} md={12}>
                          <Form.Item
                            label="Hora de exposición al día"
                            name={[field.name, "horasExposicionDia"]}
                            rules={[{ required: true, message: "Campo obligatorio" }]}
                          >
                            <InputNumber min={0} style={{ width: "100%" }} />
                          </Form.Item>
                        </Col> */}
                      </Row>

                      <Form.Item
                        label="Método a Evaluar"
                        name={[field.name, "metodoEvaluar"]}
                        rules={[{ required: true, message: "Campo obligatorio" }]}
                      >
                        <Radio.Group
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          <Radio value={1}>Cuerpo completo (1)</Radio>
                          <Radio value={0}>Mano brazo (0)</Radio>
                        </Radio.Group>
                      </Form.Item>

                      <Form.Item 
                        label = "Actividad"
                        name={[field.name, "actividad"]}
                        rules={[{required:true, message: "Campo obligatorio"}]}
                      >
                        <TextArea rows={1} />
                      </Form.Item>

                      <Form.Item
                        label="Maquina"
                        name={[field.name, "maquina"]}
                        rules={[{ required: true, message: "Campo obligatorio" }]}
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item
                        label="Nombre del trabajador"
                        name={[field.name, "nombreTrabajador"]}
                        rules={[{ required: true, message: "Campo obligatorio" }]}
                      >
                        <Input />
                      </Form.Item>

                        <Form.Item
                        label="Ciclos"
                        name={[field.name, "ciclos"]}
                        rules={[{ required: true, message: "Campo obligatorio" }]}
                      >
                        <Input />
                      </Form.Item>
                        <Form.Item
                        label="Duración de cada ciclo (hrs)"
                        name={[field.name, "duracionCiclo"]}
                        rules={[{ required: true, message: "Campo obligatorio" }]}
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item
                        label="Archivos Excel (uno o muchos)"
                        name={[field.name, "excels"]}
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                      >
                        <Upload
                          multiple
                          accept=".xls,.xlsx"
                          beforeUpload={() => false}
                        >
                          <Button icon={<UploadOutlined />}>
                            Seleccionar archivos
                          </Button>
                        </Upload>
                      </Form.Item>
                    </SortablePointCard>
                  ))}
                </SortableContext>
              </DndContext>

              <Space
                direction={isMobile ? "vertical" : "horizontal"}
                style={{ width: "100%", justifyContent: "space-between" }}
              >
                <Button
                  htmlType="button"
                  icon={<PlusOutlined />}
                  onClick={() => add({})}
                  block={isMobile}
                >
                  Agregar otro punto
                </Button>

                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  htmlType="submit"
                  loading={submitting}
                  block={isMobile}
                >
                  Enviar formulario
                </Button>
              </Space>
            </>
          )}
        </Form.List>
      </Form>
    </Card>
  );
};

export default FileVibraciones;