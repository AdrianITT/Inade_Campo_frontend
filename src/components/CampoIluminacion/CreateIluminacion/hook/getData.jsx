import { message } from "antd"
import { getAreaTrabajo } from "../../../../apis/ApiCampo/IluminacionApi"

export const getDataAreaTrabajo= async (id)=>{
try{
     const r = await getAreaTrabajo(id);

     // console.log("Data: ", r);
     return r
}catch(error){
     message.error("error: ", error );
}
}