import {getDetallesIluminacion, downloadExcel} from "../../../apis/ApiCampo/IluminacionApi"
export const DataDetailsIlum=async(data)=>{
     try{
          const i = await getDetallesIluminacion(data);
          return i;

     }catch(error){
          console.error("error");
     }
}

export const download = async(id) => {
     const res = await downloadExcel(id);
     return res;
}