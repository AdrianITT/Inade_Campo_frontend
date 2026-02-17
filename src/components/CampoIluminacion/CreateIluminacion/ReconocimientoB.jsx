import { Tabs, message } from "antd";
import { useState, useEffect, use } from "react";
import FormatoB from "./FOR-M-001B/FORB"
import {getDataAreaTrabajo} from "./hook/getData"
import { useParams, useNavigate } from "react-router-dom";
import { insertDataB } from "./FOR-M-001B/insertDateB";

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
               label:'FOR-M-001B',
               children:(
               <FormatoB
               onFinishOK={(rows, observacion)=>{
                    console.log("onFinishok : ", rows);
                    const r = insertDataB({rows,id, observacion});
                    if (r){
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