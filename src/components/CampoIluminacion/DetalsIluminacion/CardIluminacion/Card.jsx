import { 
     Card,
     Typography,
     Button
 } from "antd";
 import { Link } from "react-router-dom";
export const CardIluminacion = ({rec, idIlum}) => {
  return (
    <div>
     <Card>
          <Typography.Title level={4}>Calculo de Zonas</Typography.Title>

          {rec === false ?(
               <div>
                    <Link to={`/CreateReconocimientoA/${idIlum}`}>
                         <Button type="primary" size="large">Crear</Button>
                    </Link>
               </div>

          ):(
               <div>
                    <Link to={`/EditarReconocimientoA/${idIlum}`}>
                    <Button color="cyan" variant="solid" size="large">Editar / Continuar</Button>
                    </Link>
                    {/* <Button color="danger" variant="solid" size="large">Eliminar</Button> */}
               </div>

          )}

     </Card>
      
    </div>
  );
}

export const CardIluminacionHojaCampo = ({hci,di,rI,rec, idIlum}) => {
  return (
    <div>
     <Card>
          <Typography.Title level={4}>Hojas de Campo Iluminación</Typography.Title>

          {hci === false ?(
               <div>
                    {di && rI && rec ?(

                    <Link to = {`/CreateHojaIluminacion/${idIlum}`}>
                    <Button type="primary" size="large">Crear</Button>
                    </Link>
                    ):(
                    <Button type="primary" size="large" disabled>Crear</Button>
                    )}
               </div>

          ):(
               <div>
                    <Link to={`/EditarHojaIluminacion/${idIlum}/`}>
                    <Button color="cyan" variant="solid" size="large">Editar / Continuar</Button>
                    </Link>
                    {/* <Button color="danger" variant="solid" size="large">Eliminar</Button> */}
               </div>

          )}

     </Card>
      
    </div>
  );
}

export const CardIluminacionReconocimiento = ({rI,rec, idIlum}) => {
     // console.log(rI);
  return (
    <div>
     <Card>
          <Typography.Title level={4}>Reconocimiento de Iluminación</Typography.Title>

          {rI === false ?(
               <div>
                    {rec === true ?(
                    <Link to={`/CreateReconocimientoB/${idIlum}`}>
                         <Button type="primary" size="large">Crear</Button>
                    </Link>

                    ):(
                                             
                         <Button type="primary" size="large" disabled>Crear</Button>

                    )}
               </div>

          ):(
               <div>
                    <Link to={`/EditarReconocimientoB/${idIlum}`}>
                    <Button color="cyan" variant="solid" size="large">Editar / Continuar</Button>
                    </Link>
                    {/* <Button color="danger" variant="solid" size="large">Eliminar</Button> */}
               </div>

          )}

     </Card>
      
    </div>
  );
}

export const CardLightingDistribution = ({di,rI,rec, idIlum}) => {
     // console.log(di);
  return (
    <div>
     <Card>
          <Typography.Title level={4}>Distribución de Iluminación</Typography.Title>

          {di === false ?(
               <div>
                    {rI && rec ?(
                    <Link to={`/CreateReconocimientoC/${idIlum}`}>
                         <Button type="primary" size="large">Crear</Button>
                    </Link>

                    ):(
                         <Button type="primary" size="large" disabled>Crear</Button>
                    )}
               </div>

          ):(
               <div>
                    <Link to={`/EditarReconocimientoC/${idIlum}`}>
                    <Button color="cyan" variant="solid" size="large">Editar / Continuar</Button>
                    </Link>
                    {/* <Button color="danger" variant="solid" size="large">Eliminar</Button> */}
               </div>

          )}

     </Card>
      
    </div>
  );
}