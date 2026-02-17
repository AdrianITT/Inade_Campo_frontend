import { Tabs, message } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormatoC from "./FOR-M-001C/FORC";
import {getDataAreaTrabajo} from "./hook/getData"
import { useParams } from "react-router-dom";
import { insertDataC } from "./FOR-M-001C/insertDataC";

export default function CreateReconocomietoB(){
     const [activeKey, setActiveKey] = useState("1");
     const [ aDone, setADone ] = useState(false);
     const [areaOption  , setAreaOptions ] = useState(null);
     const [areaPunto  , setAreaPuntos ] = useState(null);
     const {id} = useParams();
     const navigate = useNavigate();
     useEffect( () => {
          async function fetchData (){

               try{
                    let r = await getDataAreaTrabajo(id);
                    setAreaOptions(r.data.areas || []);
                    setAreaPuntos(r.data.punto || []);
                    // console.log("data1: ",r.data);
               }catch(error){
                    message.error("error: ",error);
               }
          }
          if (id ) fetchData();
     }, [id]);
     // console.log(areaOption);
     const onChange=key=>{
          // console.log("key: ",key);
          if(!aDone && key !== "1"){
               message.warning("Primero temine el formulario FOR-M-001A");
               setActiveKey("1");
               return;
          }
          setActiveKey(key);
     }
     const Reconocimiento =[
          {    
               key:1,
               label:'FOR-M-001C',
               children:(
               <FormatoC
               onFinishOK={(rows, observacion)=>{
                    console.log("onFinishok : ", rows);
                    console.log("observacion", observacion);
                    const r = insertDataC({rows,id, observacion});
                    if (r) {
                         navigate(`/DetallesIluminacion/${id}`);
                    }
                    setADone(true);
                    setActiveKey("2");
               }}
               areasPorFila={areaOption}
               areasPunto={areaPunto}
               />
          )
          },
     ]
     return(
          <>
          <Tabs defaultActiveKey="1" items={Reconocimiento} onChange={onChange}></Tabs>
          </>
     );
}