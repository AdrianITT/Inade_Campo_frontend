import React from "react";
import { 
     Card,
     Button,
     Tag,
     Space,
     Typography,
     Tooltip,
 } from "antd";
 import { 
     CheckCircleOutlined,
     ClockCircleOutlined, 
     LockOutlined 
} from "@ant-design/icons";
 import { Link } from "react-router-dom";
 const { Text, Paragraph } = Typography;
const ModuleCard = ({
  created = false,
  canCreate = true,
  createTo,
  editTo,
  blockedReason,
  createLabel = "Crear",
  editLabel = "Editar / Continuar",
}) => {
  if (created) {
    return (
      <Link to={editTo} style={{ width: "100%" }}>
        <Button type="primary" size="large" block>
          {editLabel}
        </Button>
      </Link>
    );
  }

  if (canCreate) {
    return (
      <Link to={createTo} style={{ width: "100%" }}>
        <Button type="primary" size="large" block>
          {createLabel}
        </Button>
      </Link>
    );
  }

  return (
    <Space direction="vertical" size={8} style={{ width: "100%" }}>
      <Tooltip title={blockedReason || "Completa los módulos requeridos primero"}>
        <Button size="large" block disabled icon={<LockOutlined />}>
          {createLabel}
        </Button>
      </Tooltip>

      {blockedReason && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {blockedReason}
        </Text>
      )}
    </Space>
  );
};

export const CardIluminacion = ({rec, idIlum}) => {
  return (
     <ModuleCard
     // title="Cálculo de Zonas"
     created={rec}
     canCreate={true}
     createTo={`/CreateReconocimientoA/${idIlum}`}
     editTo={`/EditarReconocimientoA/${idIlum}`}
     blockedReason="Define zonas y criterios iniciales para el análisis de iluminación."
     />
//     <div>
//      <Card>
//           {/* <Typography.Title level={4}>Calculo de Zonas</Typography.Title> */}

//           {rec === false ?(
//                <div>
//                     <Link to={`/CreateReconocimientoA/${idIlum}`}>
//                          <Button type="primary" size="large">Crear</Button>
//                     </Link>
//                </div>

//           ):(
//                <div>
//                     <Link to={`/EditarReconocimientoA/${idIlum}`}>
//                     <Button color="cyan" variant="solid" size="large">Editar / Continuar</Button>
//                     </Link>
//                     {/* <Button color="danger" variant="solid" size="large">Eliminar</Button> */}
//                </div>

//           )}

//      </Card>
      
//     </div>
  );
}

export const CardIluminacionHojaCampo = ({hci,di,rI,rec, idIlum}) => {
 const canCreate = di && rI && rec; 
     return (
     <ModuleCard
     //  title="Hojas de Campo"
      created={hci}
      canCreate={canCreate}
      createTo={`/CreateHojaIluminacion/${idIlum}`}
      editTo={`/EditarHojaIluminacion/${idIlum}/`}
     //  description="Captura datos de campo necesarios para el cálculo y validación."
      blockedReason="Debes completar Zonas, Reconocimiento y Distribución antes de crear la Hoja de Campo."
    />
//     <div>
//      <Card>
//           {/* <Typography.Title level={4}>Hojas de Campo Iluminación</Typography.Title> */}

//           {hci === false ?(
//                <div>
//                     {di && rI && rec ?(

//                     <Link to = {`/CreateHojaIluminacion/${idIlum}`}>
//                     <Button type="primary" size="large">Crear</Button>
//                     </Link>
//                     ):(
//                     <Button type="primary" size="large" disabled>Crear</Button>
//                     )}
//                </div>

//           ):(
//                <div>
//                     <Link to={`/EditarHojaIluminacion/${idIlum}/`}>
//                     <Button color="cyan" variant="solid" size="large">Editar / Continuar</Button>
//                     </Link>
//                     {/* <Button color="danger" variant="solid" size="large">Eliminar</Button> */}
//                </div>

//           )}

//      </Card>
      
//     </div>
  );
}

export const CardIluminacionReconocimiento = ({rI,rec, idIlum}) => {
     // console.log(rI);
     const canCreate = rec === true;
  return (
     <ModuleCard
     //  title="Reconocimiento de Iluminación"
      created={rI}
      canCreate={canCreate}
      createTo={`/CreateReconocimientoB/${idIlum}`}
      editTo={`/EditarReconocimientoB/${idIlum}`}
     //  description="Registra el reconocimiento del área y condiciones de iluminación."
      blockedReason="Primero debes completar Cálculo de Zonas."
    />
//     <div>
//      <Card>
//           {/* <Typography.Title level={4}>Reconocimiento de Iluminación</Typography.Title> */}

//           {rI === false ?(
//                <div>
//                     {rec === true ?(
//                     <Link to={`/CreateReconocimientoB/${idIlum}`}>
//                          <Button type="primary" size="large">Crear</Button>
//                     </Link>

//                     ):(
                                             
//                          <Button type="primary" size="large" disabled>Crear</Button>

//                     )}
//                </div>

//           ):(
//                <div>
//                     <Link to={`/EditarReconocimientoB/${idIlum}`}>
//                     <Button color="cyan" variant="solid" size="large">Editar / Continuar</Button>
//                     </Link>
//                     {/* <Button color="danger" variant="solid" size="large">Eliminar</Button> */}
//                </div>

//           )}

//      </Card>
      
//     </div>
  );
}

export const CardLightingDistribution = ({di,rI,rec, idIlum}) => {
     // console.log(di);
     const canCreate = rI && rec;
  return (
     <ModuleCard
     // title="Distribución de Lámparas"
     created={di}
     canCreate={canCreate}
     createTo={`/CreateReconocimientoC/${idIlum}`}
     editTo={`/EditarReconocimientoC/${idIlum}`}
     // description="Captura la distribución de luminarias en el área evaluada."
     blockedReason="Primero debes completar Cálculo de Zonas y Reconocimiento."
    />
//     <div>
//      <Card>
//           {/* <Typography.Title level={4}>Distribución de Iluminación</Typography.Title> */}

//           {di === false ?(
//                <div>
//                     {rI && rec ?(
//                     <Link to={`/CreateReconocimientoC/${idIlum}`}>
//                          <Button type="primary" size="large">Crear</Button>
//                     </Link>

//                     ):(
//                          <Button type="primary" size="large" disabled>Crear</Button>
//                     )}
//                </div>

//           ):(
//                <div>
//                     <Link to={`/EditarReconocimientoC/${idIlum}`}>
//                     <Button color="cyan" variant="solid" size="large">Editar / Continuar</Button>
//                     </Link>
//                     {/* <Button color="danger" variant="solid" size="large">Eliminar</Button> */}
//                </div>

//           )}

//      </Card>
      
//     </div>
  );
}