import { Tabs, message, Button, Spin } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect,useMemo, useEffectEvent } from "react";
import { getDataAreaTrabajo } from "./hook/getData";
import { getExisces, getAllDataHojaIlum  } from '../../../apis/ApiCampo/IluminacionApi.js';
import FormHC from "./HOJACAMPO/FormHC.jsx";
import FormNAT from "./HOJACAMPO/FormNAT.jsx";
import { insertDataLuzART } from "./HOJACAMPO/insertDataART.jsx";
import { insertDataIluminacionNAT } from "./HOJACAMPO/insertDataNAT.jsx";

export default function CreateReconocomietoA() {
  const [areaOption, setAreaOptions] = useState([]);
  const [hojas, setHojas] = useState([]);
  const [hojasART, setHojasART] = useState([]);
  const [hojasNAT, setHojasNAT] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading]= useState(false);

  const [selectedHojaId, setSelectedHojaId] = useState(null);


  // ✅ bloqueo ART
  const [artSubmitting, setArtSubmitting] = useState(false);
  const [artSent, setArtSent] = useState(false);

  // ✅ bloqueo NAT
  const [natSubmitting, setNatSubmitting] = useState(false);
  const [natSent, setNatSent] = useState(false);


  // cuando llegue el fetch:
useEffect(() => {
  if (!Array.isArray(hojas) || hojas.length === 0) return;
  // si no hay seleccionada, por default la primera
  setSelectedHojaId((prev) => prev ?? hojas[0].id);
}, [hojas]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function fetchData() {
      try {
        const r = await getDataAreaTrabajo(id);
        const res = await getAllDataHojaIlum(id);

        // const c = await getExisces(id);
        setArtSubmitting(false);
        setNatSubmitting(false);

        const areas = Array.isArray(r?.data?.areas) ? r.data.areas : [];
        const hojaApi = Array.isArray(res?.data?.hojas) ? res.data.hojas : [];
        if (!cancelled){
          setHojas(hojaApi);
          setAreaOptions(areas);
          }
      } catch (error) {
        message.error("Error al cargar áreas");
        console.error(error);
      }finally{
        setLoading(false)
      }
    }

    if (id) {
      fetchData();
    }
    return () => { cancelled = true; };
  }, [id]);

  useEffect(()=>{
    function ciclanData(){
      setLoading(true);
      let dictnat = {};
      let dictart = {};
      for (const h of hojas){
        if(h.datamonitoreo.ART.length > 0){
          dictart[h.id] ={
            hojaId: h.id,
            observacion: h.observacion ?? "",
            influenciaLuz: h.influenciaLuz ?? false,
            bloques: h?.datamonitoreo?.ART ?? [],
          };
        }
         if (h.datamonitoreo.NAT.length > 0){
          dictnat[h.id] ={
            hojaId: h.id,
            observacion: h.observacion ?? "",
            influenciaLuz: h.influenciaLuz ?? false,
            bloques: h?.datamonitoreo?.NAT ?? [],
          };
        }
      };
      setHojasART(dictart);
      setHojasNAT(dictnat);
      setLoading(false);
    }
    ciclanData();
  },[hojas, selectedHojaId]);

  const NavigateTrue = ()=> {

    if (artSent && natSent) {
      message.warning("Espera a que termine el envío actual.");
      setTimeout(() => {
      navigate(`/DetallesIluminacion/${id}`);
      },1000);  
      
    }
  };
  useEffect(()=>{
    NavigateTrue();
  }, [artSent, natSent]);
  const Reconocimiento = [
    {
      key: 1,
      label: "Luz ART",
      children: (
        <FormHC
          initialData={hojasART}
          disabled={artSubmitting || artSent}
          loading={artSubmitting}
          onFinishOK={async (payload, saveDataInitial) => {
            if (artSubmitting) return;
            if (artSent) {
              message.warning("El formulario ART ya fue enviado y está bloqueado.");
              return;
            }

            try {
              setArtSubmitting(true);
              // ✅ importante: await
              const res = await insertDataLuzART({ payload, id, saveDataInitial });

              // si regresas algo, puedes validar aquí:
              // if (!res) throw new Error("No se pudo guardar");

              setArtSent(true);
              message.success("Formulario ART enviado correctamente. Quedó bloqueado.");
            } catch (err) {
              console.error(err);
              message.error("No se pudo enviar ART. Intenta de nuevo.");
            } finally {
              setArtSubmitting(false);
            }
          }}
          areasPorFila={areaOption}
        />
      ),
    },
    {
      key: 2,
      label: "Luz NAT",
      children: (
        <FormNAT
          initialData={hojasNAT}
          disabled={natSubmitting || natSent}
          loading={natSubmitting}
          onFinishOK={async (values,saveDataInitial) => {
            if (natSubmitting) return;
            if (natSent) {
              message.warning("El formulario NAT ya fue enviado y está bloqueado.");
              return;
            }

            try {
              setNatSubmitting(true);
              // console.log("hola");
              // ✅ importante: await
              const res = await insertDataIluminacionNAT({ values, id, saveDataInitial });

              // if (!res) throw new Error("No se pudo guardar");

              setNatSent(true);
              message.success("Formulario NAT enviado correctamente. Quedó bloqueado.");
              // NavigateTrue();
            } catch (err) {
              console.error(err);
              message.error("No se pudo enviar NAT. Intenta de nuevo.");
            } finally {
              setNatSubmitting(false);
            }
          }}
          areasPorFila={areaOption}
        />
      ),
    },
  ];

  const onclick = ( ) =>{
     navigate(`/DetallesIluminacion/${id}`);
  }

  return (
     <>
     <Spin spinning ={loading}>
          <Button onClick={()=>{onclick()}}>Regresar</Button>
          <Tabs defaultActiveKey="1" items={Reconocimiento} />
     </Spin>
     </>
     );
}
