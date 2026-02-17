  export const colorEstado = (record) => {
    const code = record?.estado?.codigo ?? record?.estado?.id ?? record?.estado;
    const desc = record?.estado?.descripcion?.toLowerCase?.() || "";
    if (String(code) === "4" || desc.includes("final")) return "green";
    if (desc.includes("entreg")) return "geekblue";
    if (desc.includes("proceso")) return "processing";
    return "default";
  };

  export const colorPrioridad = (codigo) => ({ A:"red", B:"orange", C:"gold", 1:"red", 2:"orange", 3:"gold" }[codigo] || "blue");


  export const recordToSearchString = (record)=>{
    if(!record) return "";

    const parts = [];
     
    if(record.ordenTrabajo?.codigo){
      parts.push(record.ordenTrabajo.codigo);
    }

    if(record.empresa?.nombre){
      parts.push(record.empresa.nombre);
    }

    if(record.estdo?.descripcion){
      parts.push(record.estado.descrpcion);
    }

    if(record.prioridad?.codigo){
      parts.push(record.prioridad.codigo);
    }

    if(record.prioridad?.descripcion){
      parts.push(record.prioridad.descripcion);
    }

    if(record.custodiaExterna?.fechaFinal){
      parts.push(record.custodiaExterna.fechaFinal);
    }

    return parts.join(" ").toLowerCase();
  }

  export const filterData = (data, text) => {
    if (!Array.isArray(data)) return [];   // seguridad extra

    const lower = text.trim().toLowerCase();

    if (!lower) return data;

    return data.filter((record) => {
      const fullText = recordToSearchString(record);
      return fullText.includes(lower);
    });
  };

  export const handleSearch = 
    (value, data, setFiltered, setSearchText) => {
      setSearchText(value);
      if(!value){
        setFiltered(data || []);
        return;
      }
      const filtered = filterData(data,value);
      setFiltered(filtered);
    };