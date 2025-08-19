import React, { useEffect, useMemo, useState } from "react";
import {
  Table, Typography, message, Space, Button, Modal,
  Checkbox, Radio, Tabs, Tag, Grid, Tooltip, Card
} from "antd";
import { Link } from "react-router-dom";
import { ReloadOutlined, FileExcelOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getAllCustodiaExternaEntregados,
  getAllCustodiaExternaFinalizados,
  updateOneCustodiaExterna,
} from "../../apis/ApiCustodiaExterna/ApiCustodiaExtern";
import { getDataDisposicionFinal } from "../../apis/ApiCustodiaExterna/ApiDisposicionFinal";
import { getllenar_excel_custodia_interna } from "../../apis/ApiCustodiaExterna/ApiCustodiaInterna";
import { updateOrdenTrabajo } from "../../apis/ApisServicioCliente/OrdenTrabajoApi";

const { Title } = Typography;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

export default function CustodiasEntregadasTable({ organizacionId }) {
  const screens = useBreakpoint();
  const isMobile = !screens.md; // < md → móvil/tablet chica

  const [rows, setRows] = useState([]);
  const [cFinalizados, setCFinalizados] = useState([]);
  const [disposiciones, setDisposiciones] = useState([]);
  const [loading, setLoading] = useState(false);

  const [finishOpen, setFinishOpen] = useState(false);
  const [finishSubmitting, setFinishSubmitting] = useState(false);
  const [selectedDisps, setSelectedDisps] = useState([]); // múltiple (usa Checkbox más abajo)
  const [currentCustodiaId, setCurrentCustodiaId] = useState(null);
  const [currentOrdenTrabajoId, setCurrentOrdenTrabajoId] = useState(null);

  const [downloadingId, setDownloadingId] = useState(null);

  const colorEstado = (record) => {
    const code = record?.estado?.codigo ?? record?.estado?.id ?? record?.estado;
    const desc = record?.estado?.descripcion?.toLowerCase?.() || "";
    if (String(code) === "4" || desc.includes("final")) return "green";
    if (desc.includes("entreg")) return "geekblue";
    if (desc.includes("proceso")) return "processing";
    return "default";
  };

  const colorPrioridad = (codigo) => ({ A:"red", B:"orange", C:"gold", 1:"red", 2:"orange", 3:"gold" }[codigo] || "blue");

  const getDispDesc = (id) => {
    const found = disposiciones.find((d) => String(d.id) === String(id));
    return found?.descripcion ?? "";
  };

  const load = async () => {
    try {
      setLoading(true);
      const [entregadasRes, finalizadosRes, disposRes] = await Promise.all([
        getAllCustodiaExternaEntregados(organizacionId),
        getAllCustodiaExternaFinalizados(organizacionId),
        getDataDisposicionFinal(),
      ]);
      const listaDisps = Array.isArray(disposRes?.data) ? disposRes.data
                        : Array.isArray(disposRes) ? disposRes : [];
      setDisposiciones(listaDisps);
      console.log("Disposiciones:", listaDisps);
      setRows(entregadasRes?.data || []);
      console.log("Custodias entregadas:", entregadasRes?.data);
      setCFinalizados(finalizadosRes?.data || []);
      console.log("Custodias finalizadas:", finalizadosRes?.data);
    } catch (e) {
      console.error("Error cargando custodias:", e);
      message.error(e.message || "No se pudieron cargar las custodias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizacionId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizacionId]);

  const openFinishModal = (custodiaId, record) => {
    setCurrentCustodiaId(custodiaId);
    setCurrentOrdenTrabajoId(record?.ordenTrabajo?.id ?? null);
    setSelectedDisps([]);
    setFinishOpen(true);
  };
  const closeFinishModal = () => {
    setFinishOpen(false);
    setSelectedDisps([]);
    setCurrentCustodiaId(null);
  };

  const handleFinishSubmit = async () => {
    if (!currentCustodiaId) {
      message.error("No se encontró el ID de la custodia.");
      return;
    }
    if (selectedDisps.length === 0) {
      message.warning("Selecciona al menos una opción de disposición final.");
      return;
    }
    try {
      setFinishSubmitting(true);
      const payload = {
        custodiaExternaId: currentCustodiaId,
        disposicionFinal: selectedDisps, // múltiples IDs
        estado: 4,
      };
      const payloadOT = { estado: 3 };
      await updateOneCustodiaExterna(currentCustodiaId, payload);
      if (currentOrdenTrabajoId) {
        await updateOrdenTrabajo(currentOrdenTrabajoId, payloadOT);
      }
      message.success("Disposición final registrada.");
      closeFinishModal();
      load();
    } catch (e) {
      console.error("Error enviando disposición final:", e);
      message.error(e.response?.data?.detail || "No se pudo registrar la disposición final.");
    } finally {
      setFinishSubmitting(false);
    }
  };

  const downloadExcel = async (custodiaId, codigoOT) => {
    try {
      setDownloadingId(custodiaId);
      const res = await getllenar_excel_custodia_interna(custodiaId);
      const cd = res.headers?.["content-disposition"] || "";
      const m = /filename\*?=(?:UTF-8''|")?([^\";]+)"/i.exec(cd) || /filename=([^;]+)/i.exec(cd);
      const suggested = m ? decodeURIComponent(m[1].replace(/"/g, "")) : null;

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = suggested || `Excel_custodia_Interna_${codigoOT || custodiaId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      message.success("Excel generado.");
    } catch (e) {
      console.error("Error al descargar Excel:", e);
      message.error(e.response?.data?.detail || "No se pudo descargar el Excel.");
    } finally {
      setDownloadingId(null);
    }
  };

  // --- Columnas base (sin fixed aquí) ---
  const baseColumns = useMemo(() => [
    {
      title: "Código OT",
      dataIndex: ["ordenTrabajo", "codigo"],
      key: "codigo",
      width: isMobile ? undefined : 140,
      ellipsis: true,
      render: (val) => val ? <Tooltip title={val}>{val}</Tooltip> : "—",
    },
    {
      title: "Fecha final",
      dataIndex: ["custodiaExterna", "fechaFinal"],
      key: "fechaFinal",
      width: isMobile ? undefined : 130,
      // render: (v) => v ? dayjs(v).format("YYYY-MM-DD") : "—",
      responsive: ["md"], // oculta en xs/sm
    },
    {
      title: "Empresa",
      dataIndex: ["empresa", "nombre"],
      key: "empresa",
      width: isMobile ? undefined : 240,
      ellipsis: true,
      render: (v) => v ? <Tooltip title={v}>{v}</Tooltip> : "—",
      responsive: ["sm"], // oculta en xs
    },
    {
      title: "Prioridad",
      key: "prioridad",
      width: isMobile ? undefined : 160,
      render: (_, r) => {
        const cod = r?.prioridad?.codigo ?? "";
        const desc = r?.prioridad?.descripcion ?? "";
        return (
          <Tag color={colorPrioridad(cod)} style={{ marginInlineEnd: 0 }}>
            {[cod, desc].filter(Boolean).join(" — ") || "—"}
          </Tag>
        );
      },
      responsive: ["md"],
    },
    {
      title: "Estado",
      dataIndex: ["estado", "descripcion"],
      key: "estado",
      width: isMobile ? undefined : 160,
      render: (_, r) => (
        <Tag color={colorEstado(r)} style={{ marginInlineEnd: 0 }}>
          {r?.estado?.descripcion || "—"}
        </Tag>
      ),
    },
  ], [isMobile]);

  const accionesEntregadas = useMemo(() => ({
    title: "Acciones",
    key: "actions",
    width: isMobile ? undefined : 260,
    render: (_, record) => {
      const id = record?.custodiaExterna?.id ?? record?.id;
      return (
        <Space
          wrap
          size="small"
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(120px, 1fr))",
            gap: 8,
          }}
        >
          <Link to={`/insert_id_laboratorio/${id}`}>
            <Button block={isMobile} size="small" type="primary" disabled={!id}>
              Ingresar ID Laboratorio
            </Button>
          </Link>
          <Button block={isMobile} size="small" onClick={() => openFinishModal(id, record)} disabled={!id}>
            Finalizar
          </Button>
          <Button
            block={isMobile}
            icon={!isMobile ? <FileExcelOutlined /> : null}
            size="small"
            loading={downloadingId === id}
            onClick={() => downloadExcel(id, record?.ordenTrabajo?.codigo)}
            disabled={!id}
          >
            {isMobile ? "Excel" : "Descargar Excel"}
          </Button>
        </Space>
      );
    },
  }), [isMobile, downloadingId]);

  const dispFinalColumn = useMemo(() => ({
    title: "Disposición final",
    dataIndex: ["custodiaExterna", "disposicionFinal"],
    key: "dispFinal",
    width: isMobile ? undefined : 220,
    render: (val, record) => {
      const raw = record?.custodiaExterna?.disposicionFinal ?? record?.disposicionFinal ?? val;
      let id = null;
      if (typeof raw === "number") id = raw;
      else if (typeof raw === "string") {
        const n = parseInt(raw.split("-", 1)[0].trim(), 10);
        id = isNaN(n) ? null : n;
      } else if (raw && typeof raw === "object" && "id" in raw) id = raw.id;
      const desc = getDispDesc(id);
      if (!id && !desc) return "—";
      return `${id ?? ""}${id ? " - " : ""}${desc}`;
    },
  }), [isMobile, disposiciones]);

  const accionesFinalizados = useMemo(() => ({
    title: "Acciones",
    key: "actions_final",
    width: isMobile ? undefined : 180,
    render: (_, record) => {
      const id = record?.custodiaExterna?.id ?? record?.id;
      const codigoOT = record?.ordenTrabajo?.codigo;
      return (
        <Space wrap size="small" style={{ width: "100%" }}>
          <Button
            block={isMobile}
            size="small"
            loading={downloadingId === id}
            onClick={() => downloadExcel(id, codigoOT)}
            disabled={!id}
          >
            Descargar Excel
          </Button>
        </Space>
      );
    },
  }), [isMobile, downloadingId]);

  // Columnas por pestaña (condicionalmente fijas en desktop)
  const entregadasCols = useMemo(() => {
    const cols = [...baseColumns, accionesEntregadas];
    if (!isMobile) {
      return cols.map(c => {
        if (c.key === "codigo") return { ...c, fixed: "left" };
        if (c.key?.startsWith("actions")) return { ...c, fixed: "right" };
        return c;
      });
    }
    // móvil: sin fixed ni widths rígidos
    return cols.map(c => ({ ...c, fixed: undefined, width: c.responsive ? c.width : undefined }));
  }, [baseColumns, accionesEntregadas, isMobile]);

  const finalizadosCols = useMemo(() => {
    const cols = [...baseColumns, accionesFinalizados];
    if (!isMobile) {
      return cols.map(c => {
        if (c.key === "codigo") return { ...c, fixed: "left" };
        if (c.key?.startsWith("actions")) return { ...c, fixed: "right" };
        return c;
      });
    }
    return cols.map(c => ({ ...c, fixed: undefined, width: c.responsive ? c.width : undefined }));
  }, [baseColumns, accionesFinalizados, isMobile]);

  // expandible en móvil: mostramos datos que ocultamos en columnas
  const expandedRowRender = (record) => (
    <div style={{ fontSize: 12, lineHeight: 1.5 }}>
      <div><b>Empresa:</b> {record?.empresa?.nombre || "—"}</div>
      <div><b>Fecha final:</b> {record?.custodiaExterna?.fechaFinal ? dayjs(record.custodiaExterna.fechaFinal).format("YYYY-MM-DD") : "—"}</div>
      <div>
        <b>Prioridad:</b>{" "}
        <Tag color={colorPrioridad(record?.prioridad?.codigo)} style={{ marginInlineStart: 4 }}>
          {[record?.prioridad?.codigo, record?.prioridad?.descripcion].filter(Boolean).join(" — ") || "—"}
        </Tag>
      </div>
    </div>
  );

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="middle">
      <Space align="center" style={{ width: "100%", justifyContent: "space-between", gap: 8 }}>
        <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>
          Custodias externas — Entregadas
        </Title>
        <Button onClick={load} icon={<ReloadOutlined />} loading={loading} size={isMobile ? "small" : "middle"}>
          Actualizar
        </Button>
      </Space>

      <Card bordered={false} bodyStyle={{ padding: isMobile ? 8 : 16 }}>
        <Tabs
          defaultActiveKey="entregadas"
          type="card"
          destroyInactiveTabPane
          tabBarGutter={isMobile ? 8 : 16}
          size={isMobile ? "small" : "middle"}
        >
          <TabPane tab={`Entregadas (${rows.length})`} key="entregadas">
            <div style={{ width: "100%", overflowX: "auto" }}>
              <Table
                rowKey={(r) => r?.custodiaExterna?.id ?? r?.id ?? Math.random()}
                dataSource={rows}
                columns={entregadasCols}
                loading={loading}
                pagination={{
                  pageSize: isMobile ? 8 : 10,
                  showSizeChanger: !isMobile,
                  simple: isMobile,
                }}
                size={isMobile ? "small" : "middle"}
                bordered={!isMobile}
                sticky={!isMobile}
                scroll={{
                  x: isMobile ? "max-content" : 1000,
                  y: isMobile ? undefined : 520,
                }}
                expandable={isMobile ? { expandedRowRender } : undefined}
              />
            </div>
          </TabPane>

          <TabPane tab={`Finalizadas (${cFinalizados.length})`} key="finalizadas">
            <div style={{ width: "100%", overflowX: "auto" }}>
              <Table
                rowKey={(r) => r?.custodiaExterna?.id ?? r?.id ?? Math.random()}
                dataSource={cFinalizados}
                columns={finalizadosCols}
                loading={loading}
                pagination={{
                  pageSize: isMobile ? 8 : 10,
                  showSizeChanger: !isMobile,
                  simple: isMobile,
                }}
                size={isMobile ? "small" : "middle"}
                bordered={!isMobile}
                sticky={!isMobile}
                scroll={{
                  x: isMobile ? "max-content" : 1000,
                  y: isMobile ? undefined : 520,
                }}
                expandable={isMobile ? { expandedRowRender } : undefined}
              />
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal Finalizar */}
      <Modal
        title="Definir disposición final"
        open={finishOpen}
        onOk={handleFinishSubmit}
        confirmLoading={finishSubmitting}
        onCancel={closeFinishModal}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <p style={{ marginBottom: 12 }}>
          Selecciona una o varias opciones de disposición final:
        </p>

        {/* Usa Checkbox.Group para selección múltiple */}
        <Checkbox.Group
          value={selectedDisps}
          onChange={(vals) => setSelectedDisps(vals)}
          style={{ display: "grid", gap: 8 }}
        >
          {disposiciones.map((d) => (
            <Checkbox key={d.id} value={d.id}>
              {d.descripcion}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </Modal>
    </Space>
  );
}
