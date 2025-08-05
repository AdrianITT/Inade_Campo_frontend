import React, { useEffect, useState } from 'react';
import { Table, Button, Typography, Row, Col } from 'antd';
import { Link } from "react-router-dom";
import { getAllCustodiaExterna } from '../../apis/ApiCustodiaExterna/ApiCustodiaExtern';

const { Title } = Typography;

const CustodiasExterna = () => {
  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    getAllCustodiaExterna()
      .then((res) => {
        console.log("Datos recibidos:", res.data);
        setDataSource(res.data);
      })
      .catch((err) => console.error("Error al obtener datos:", err));
  }, []);

  // Función para obtener valores únicos a partir de una ruta de propiedades
  const getUniqueValues = (data, path) => {
    const values = data.map((item) => {
      return path.reduce((acc, curr) => acc && acc[curr], item);
    }).filter((v) => v != null);
    return [...new Set(values)];
  };

  // Creamos filtros dinámicos para cada columna
  const fechaFinalFilters = getUniqueValues(dataSource, ['custodiaExterna', 'fechaFinal']).map(v => ({
    text: v,
    value: v,
  }));
  const codigoOTFilters = getUniqueValues(dataSource, ['ordenTrabajo', 'codigo']).map(v => ({
    text: v,
    value: v,
  }));
  const empresaFilters = getUniqueValues(dataSource, ['empresa', 'nombre']).map(v => ({
    text: v,
    value: v,
  }));
  const prioridadFilters = getUniqueValues(dataSource, ['prioridad', 'codigo']).map(v => ({
    text: v,
    value: v,
  }));
  const estadoFilters = getUniqueValues(dataSource, ['estado', 'descripcion']).map(v => ({
    text: v,
    value: v,
  }));

  const columns = [
    {
      title: 'Código OT',
      dataIndex: ['ordenTrabajo', 'codigo'],
      key: 'codigoOT',
      filters: codigoOTFilters,
      filterSearch: true, // Permite buscar en el menú de filtros
      onFilter: (value, record) =>
        record.ordenTrabajo.codigo === value,
    },
    {
      title: 'Empresa',
      dataIndex: ['empresa', 'nombre'],
      key: 'empresa',
      filters: empresaFilters,
      filterSearch: true, // Permite buscar en el menú de filtros
      onFilter: (value, record) =>
        record.empresa.nombre === value,
    },
    {
      title: 'Fecha Final',
      dataIndex: ['custodiaExterna', 'fechaFinal'],
      key: 'fechaFinal',
      filters: fechaFinalFilters,
      onFilter: (value, record) =>
        record.custodiaExterna.fechaFinal === value,
    },
    {
      title: 'Prioridad',
      key: 'prioridad',
      filters: prioridadFilters,
      onFilter: (value, record) =>
        record.prioridad.codigo === value,
      render: (text, record) => {
        const { codigo, descripcion } = record.prioridad || {};
        return `${codigo} - ${descripcion}`;
      },
    },
    {
      title: 'Estado',
      dataIndex: ['estado', 'descripcion'],
      key: 'estado',
      filters: estadoFilters,
      onFilter: (value, record) =>
        record.estado.descripcion === value,
    },
    {
      title: "Acción",
      key: "action",
      render: (_, record) => (
        <Link to={`/DetallesCustodiaExternas/${record.custodiaExterna.id}`}>
          <Button>Detalles</Button>
        </Link>
      ),
    },
  ];
  

  return (
    <div style={{ padding: 32 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3}>Custodia Externas</Title>
        </Col>
        <Col>
          <Link to="/crearCustodiaExterna">
            <Button type="primary">Crear custodia externa</Button>
          </Link>
        </Col>
      </Row>

      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey={(record) => record.custodiaExterna.id}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
};

export default CustodiasExterna;
