import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

const SUPABASE_URL = "https://tnspshptvqvhhwwckzcc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuc3BzaHB0dnF2aGh3d2NremNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTE4MzYsImV4cCI6MjA4Nzg2NzgzNn0.VYO6LMiRfv9pTCO-jRrz4ph2S_uKgX-kqYRCyVKCwdU";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const ROSA="#E8175D",ROSA_DARK="#C0134E",ROSA_BG="#FFF5F8",BLANCO="#FFFFFF";
const GRIS_DARK="#1A1A1A",GRIS_MED="#4A4A4A",GRIS_LIGHT="#F5F5F5",GRIS_TEXT="#888";
const VERDE="#2E7D32",VERDE_BG="#E8F5E9",AMBAR="#F57F17",AMBAR_BG="#FFF8E1";
const AZUL="#1565C0",AZUL_BG="#E3F2FD";

const CATS=[
  {id:"fruta",label:"Fruta Fresca",emoji:"🍓",color:"#E8175D"},
  {id:"lacteos",label:"Lácteos y Cremas",emoji:"🥛",color:"#1565C0"},
  {id:"chocolate",label:"Chocolate",emoji:"🍫",color:"#4E342E"},
  {id:"toppings",label:"Toppings / Compl.",emoji:"🍯",color:"#E65100"},
  {id:"torani",label:"Jarabes Torani",emoji:"🧃",color:"#00796B"},
  {id:"azucar",label:"Azúcar / Endulz.",emoji:"🍬",color:"#F57F17"},
  {id:"bebidas",label:"Bebidas y Varios",emoji:"☕",color:"#5D4037"},
  {id:"desechables",label:"Desechables",emoji:"🥤",color:"#6A1B9A"},
  {id:"publicidad",label:"Publicidad",emoji:"📢",color:"#C62828"},
  {id:"limpieza",label:"Limpieza",emoji:"🧹",color:"#2E7D32"},
  {id:"otros",label:"Otros",emoji:"📦",color:"#546E7A"},
];
const EQUIPO=["Hugo","Sofía","Nueva","José Luis","Jefeson","Andres"];
const FORMA_OPTS=["Efectivo","Mercado Pago","Transfer BBVA","Tarjeta Santander","Otro"];

const todayISO=()=>new Date().toISOString().slice(0,10);
const fmtMXN=(n)=>n!=null?`$${Number(n).toLocaleString("es-MX")}`:"—";
const monthKey=(d)=>d?.slice(0,7)??"";
const monthLabel=(k)=>{
  if(!k)return"";
  const[y,m]=k.split("-");
  const ns=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  return`${ns[+m-1]} ${y}`;
};
const addDays=(iso,n)=>{const d=new Date(iso);d.setDate(d.getDate()+n);return d.toISOString().slice(0,10);};
const lsLoad=(k)=>{try{return JSON.parse(localStorage.getItem(k)||"[]");}catch{return[];}};
const lsSave=(k,d)=>{try{localStorage.setItem(k,JSON.stringify(d));}catch{}};

const exportExcel=(gastos,ventas,recolecciones,mk)=>{
  const cl=(id)=>CATS.find(c=>c.id===id)?.label??id;
  const lista=gastos.filter(g=>!mk||monthKey(g.fecha)===mk).sort((a,b)=>a.fecha.localeCompare(b.fecha));
  const wsD=XLSX.utils.json_to_sheet(lista.map(g=>({
    "Fecha":g.fecha,"Concepto":g.concepto,"Categoría":cl(g.cat),
    "Monto ($)":g.monto,"Forma de Pago":g.forma,"Tipo de Pago":g.tipo_pago||"",
    "Días Crédito":g.dias_credito||"","Vence":g.fecha_vencimiento||"","Pagado":g.pagado?"Sí":"No",
    "Fecha Pago":g.fecha_pago||"","Quién":g.quien||"","Nota":g.nota||"",
  })));
  wsD["!cols"]=[{wch:12},{wch:28},{wch:20},{wch:11},{wch:18},{wch:14},{wch:12},{wch:12},{wch:8},{wch:12},{wch:14},{wch:22}];
  const totC={},totG=lista.reduce((s,g)=>s+g.monto,0);
  lista.forEach(g=>{totC[g.cat]=(totC[g.cat]||0)+g.monto;});
  const rRows=CATS.filter(c=>totC[c.id]).sort((a,b)=>totC[b.id]-totC[a.id])
    .map(c=>({Categoría:c.label,"Monto ($)":totC[c.id],"% del Total":totG?+((totC[c.id]/totG)*100).toFixed(1):0}));
  rRows.push({Categoría:"TOTAL","Monto ($)":totG,"% del Total":100});
  const wsR=XLSX.utils.json_to_sheet(rRows);
  const vLista=ventas.filter(v=>!mk||monthKey(v.fecha)===mk).sort((a,b)=>a.fecha.localeCompare(b.fecha));
  const wsV=XLSX.utils.json_to_sheet(vLista.map(v=>({"Fecha":v.fecha,"Efectivo ($)":v.efectivo,"Registró":v.quien||"","Nota":v.nota||""})));
  const wsC=XLSX.utils.json_to_sheet(recolecciones.map(r=>({"Fecha":r.fecha_recoleccion,"Monto ($)":r.monto_total,"Quién":r.quien||"","Nota":r.nota||""})));
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,wsD,"Gastos");
  XLSX.utils.book_append_sheet(wb,wsR,"Por Categoría");
  XLSX.utils.book_append_sheet(wb,wsV,"Ventas");
  XLSX.utils.book_append_sheet(wb,wsC,"Recolecciones");
  XLSX.writeFile(wb,`LadyFresa_${mk?monthLabel(mk).replace(" ","_"):"Todos"}.xlsx`);
};

const FORM0={fecha:todayISO(),cat:"",monto:"",concepto:"",forma:"Efectivo",tipo_pago:"contado",dias_credito:"",quien:"",nota:"",foto:null};
const VFORM0={fecha:todayISO(),efectivo:"",quien:"",nota:""};
const RFORM0={fecha_recoleccion:todayISO(),quien:"",nota:"",selDias:[],monto_fisico:"",quien_faltante:""};

export default function App(){
  const[view,setView]=useState("inicio");
  const[gastos,setGastos]=useState([]);
  const[ventas,setVentas]=useState([]);
  const[recolecciones,setRecolecciones]=useState([]);
  const[loading,setLoading]=useState(true);
  const[selMonth,setSelMonth]=useState(null);
  const[selRec,setSelRec]=useState(null);
  const[selVentaDia,setSelVentaDia]=useState(null);
  const[filtroQ,setFiltroQ]=useState("todos");
  const[error,setError]=useState(null);
  const[form,setForm]=useState(FORM0);
  const[editandoId,setEditandoId]=useState(null);
  const[vForm,setVForm]=useState(VFORM0);
  const[rForm,setRForm]=useState(RFORM0);
  const[editRecForm,setEditRecForm]=useState(null);
  const[comentario,setComentario]=useState("");
  const[saved,setSaved]=useState(false);
  const[vSaved,setVSaved]=useState(false);
  const[rSaved,setRSaved]=useState(false);
  const[catErr,setCatErr]=useState(false);
  const[uploadingFoto,setUploadingFoto]=useState(false);
  const[pagoForm,setPagoForm]=useState(null); // {id, forma, fecha, nota}
  const fileRef=useRef();

  // ── SUPABASE ─────────────────────────────────────────────────────────────
  const fetchG=async()=>{const{data}=await sb.from("gastos").select("*").order("fecha",{ascending:false});if(data)setGastos(data);};
  const fetchV=async()=>{const{data}=await sb.from("ventas").select("*").order("fecha",{ascending:false});if(data)setVentas(data);};
  const fetchR=async()=>{const{data}=await sb.from("recolecciones").select("*").order("created_at",{ascending:false});if(data)setRecolecciones(data);};

  useEffect(()=>{
    (async()=>{setLoading(true);await Promise.all([fetchG(),fetchV(),fetchR()]);setLoading(false);})();
    const uid=Math.random().toString(36).slice(2);
    const chG=sb.channel("g-"+uid).on("postgres_changes",{event:"*",schema:"public",table:"gastos"},fetchG).subscribe();
    const chV=sb.channel("v-"+uid).on("postgres_changes",{event:"*",schema:"public",table:"ventas"},fetchV).subscribe();
    const chR=sb.channel("r-"+uid).on("postgres_changes",{event:"*",schema:"public",table:"recolecciones"},fetchR).subscribe();
    return()=>{sb.removeChannel(chG);sb.removeChannel(chV);sb.removeChannel(chR);};
  },[]);

  // ── FOTO UPLOAD ───────────────────────────────────────────────────────────
  const handleFoto=async(e)=>{
    const file=e.target.files[0];if(!file)return;
    setUploadingFoto(true);
    const path=`tickets/${Date.now()}.${file.name.split(".").pop()}`;
    const{error:ue}=await sb.storage.from("tickets").upload(path,file,{contentType:file.type});
    if(ue){setError("Error foto: "+ue.message);setUploadingFoto(false);return;}
    const{data}=sb.storage.from("tickets").getPublicUrl(path);
    setForm(f=>({...f,foto:data.publicUrl}));
    setUploadingFoto(false);
  };

  // ── GASTOS ────────────────────────────────────────────────────────────────
  const promedios={};
  CATS.forEach(c=>{const ms=gastos.filter(g=>g.cat===c.id).map(g=>g.monto);if(ms.length>1)promedios[c.id]=ms.reduce((s,m)=>s+m,0)/ms.length;});
  const esInusual=(cat,monto)=>promedios[cat]&&monto>promedios[cat]*2.5;

  const saveGasto=async()=>{
    if(!form.cat){setCatErr(true);setTimeout(()=>setCatErr(false),2000);return;}
    if(!form.monto||!form.concepto)return;
    const dias=parseInt(form.dias_credito)||0;
    const payload={
      fecha:form.fecha,concepto:form.concepto,cat:form.cat,
      monto:parseFloat(form.monto),forma:form.forma,tipo_pago:form.tipo_pago,
      dias_credito:dias||null,
      fecha_vencimiento:form.tipo_pago==="credito"&&dias?addDays(form.fecha,dias):null,
      pagado:form.tipo_pago==="contado",
      quien:form.quien,nota:form.nota,foto:form.foto,
    };
    let e;
    if(editandoId){({error:e}=await sb.from("gastos").update(payload).eq("id",editandoId));}
    else{({error:e}=await sb.from("gastos").insert([payload]));}
    if(e){setError("Error: "+e.message);return;}
    await fetchG();
    setSaved(true);
    setTimeout(()=>{setSaved(false);setEditandoId(null);setForm(FORM0);setView("inicio");},1200);
  };

  const startEdit=(g)=>{
    setForm({fecha:g.fecha,cat:g.cat,monto:String(g.monto),concepto:g.concepto,
      forma:g.forma||"Efectivo",tipo_pago:g.tipo_pago||"contado",
      dias_credito:g.dias_credito?String(g.dias_credito):"",
      quien:g.quien||"",nota:g.nota||"",foto:g.foto||null});
    setEditandoId(g.id);
    setView("nuevo");
  };

  const deleteGasto=async(id)=>{
    await sb.from("gastos").delete().eq("id",id);
    const{data}=await sb.from("gastos").select("*").order("fecha",{ascending:false});
    if(data)setGastos(data);
  };

  const marcarPagado=async()=>{
    if(!pagoForm)return;
    await sb.from("gastos").update({
      pagado:true,tipo_pago:"contado",
      fecha_pago:pagoForm.fecha,
      forma:pagoForm.forma,
      nota:(gastos.find(g=>g.id===pagoForm.id)?.nota||"")+(pagoForm.nota?"\nPago: "+pagoForm.nota:""),
    }).eq("id",pagoForm.id);
    await fetchG();
    setPagoForm(null);
  };

  // ── VENTAS ────────────────────────────────────────────────────────────────
  const saveVenta=async()=>{
    if(!vForm.efectivo)return;
    const payload={efectivo:parseFloat(vForm.efectivo),quien:vForm.quien,nota:vForm.nota};
    // Buscar si ya existe por fecha
    const{data:existing}=await sb.from("ventas").select("id").eq("fecha",vForm.fecha).limit(1);
    let err;
    if(existing&&existing.length>0){
      // Actualizar el existente
      const{error:e}=await sb.from("ventas").update(payload).eq("id",existing[0].id);
      err=e;
    } else {
      // Insertar nuevo
      const{error:e}=await sb.from("ventas").insert([{...payload,fecha:vForm.fecha}]);
      err=e;
    }
    if(err){setError("Error: "+err.message);return;}
    const{data}=await sb.from("ventas").select("*").order("fecha",{ascending:false});
    if(data)setVentas(data);
    setVSaved(true);
    setTimeout(()=>{setVSaved(false);setVForm(VFORM0);setView("inicio");},1200);
  };

  // ── RECOLECCIONES ─────────────────────────────────────────────────────────
  const saveRecoleccion=async()=>{
    if(!rForm.selDias.length||!rForm.quien)return;
    const montoTotal=rForm.selDias.reduce((s,f)=>{const v=ventas.find(v=>v.fecha===f);return s+(v?.efectivo||0);},0);
    const montoFisico=rForm.monto_fisico?parseFloat(rForm.monto_fisico):null;
    const faltante=montoFisico!=null?Math.max(0,montoTotal-montoFisico):0;
    const payload={
      fecha_recoleccion:rForm.fecha_recoleccion,
      fechas_cubiertas:rForm.selDias,
      monto_total:montoTotal,
      monto_fisico:montoFisico,
      faltante:faltante||null,
      quien:rForm.quien,
      quien_faltante:faltante>0?(rForm.quien_faltante||rForm.quien):null,
      nota:rForm.nota,
    };
    const{error:e}=await sb.from("recolecciones").insert([payload]);
    if(e){setError("Error: "+e.message);return;}
    const{data}=await sb.from("recolecciones").select("*").order("created_at",{ascending:false});
    if(data)setRecolecciones(data);
    setRSaved(true);
    setTimeout(()=>{setRSaved(false);setRForm(RFORM0);},1200);
  };

  const updateRecoleccion=async(id,updates)=>{
    const{error:e}=await sb.from("recolecciones").update(updates).eq("id",id);
    if(e){setError("Error: "+e.message);return;}
    const{data}=await sb.from("recolecciones").select("*").order("created_at",{ascending:false});
    if(data){
      setRecolecciones(data);
      const updated=data.find(r=>r.id===id);
      if(updated)setSelRec(updated);
    }
    setEditRecForm(null);
  };
  const deleteRecoleccion=async(id)=>{
    const{error:e}=await sb.from("recolecciones").delete().eq("id",id);
    if(e){setError("Error: "+e.message);return;}
    const{data}=await sb.from("recolecciones").select("*").order("created_at",{ascending:false});
    if(data)setRecolecciones(data);
    setSelRec(null);
    setView("recoleccion");
  };
  const agregarComentario=async(id,notaActual)=>{
    const nueva=(notaActual?notaActual+"\n":"")+comentario;
    await sb.from("recolecciones").update({nota:nueva}).eq("id",id);
    await new Promise(r=>setTimeout(r,300));
    const{data}=await sb.from("recolecciones").select("*").order("created_at",{ascending:false});
    if(data){setRecolecciones(data);const updated=data.find(r=>r.id===id);if(updated)setSelRec(updated);}
    setComentario("");
  };

  // ── DATOS DERIVADOS ───────────────────────────────────────────────────────
  const currentMK=monthKey(todayISO());
  const months=[...new Set(gastos.map(g=>monthKey(g.fecha)))].filter(Boolean).sort().reverse();
  const gMes=(mk)=>gastos.filter(g=>monthKey(g.fecha)===mk);
  const totG=(mk)=>gMes(mk).reduce((s,g)=>s+g.monto,0);
  const porCat=(mk)=>{const m={};gMes(mk).forEach(g=>{m[g.cat]=(m[g.cat]||0)+g.monto;});return m;};
  const porQuien=(mk)=>{
    const m={};
    gMes(mk).filter(g=>filtroQ==="todos"||g.quien===filtroQ).forEach(g=>{const k=g.quien||"Sin asignar";m[k]=(m[k]||0)+g.monto;});
    return m;
  };
  const diasConVenta=ventas.map(v=>v.fecha);
  const diasRecolectados=recolecciones.flatMap(r=>r.fechas_cubiertas||[]);
  const diasPendientes=diasConVenta.filter(d=>!diasRecolectados.includes(d)).sort();
  const montoPendiente=diasPendientes.reduce((s,d)=>{const v=ventas.find(v=>v.fecha===d);return s+(v?.efectivo||0);},0);
  const todayG=gastos.filter(g=>g.fecha===todayISO());
  const todayTG=todayG.reduce((s,g)=>s+g.monto,0);
  const todayV=ventas.find(v=>v.fecha===todayISO());
  const creditosPendientes=gastos.filter(g=>g.tipo_pago==="credito"&&!g.pagado);
  const vencidos=creditosPendientes.filter(g=>g.fecha_vencimiento&&g.fecha_vencimiento<todayISO());

  if(loading)return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:ROSA}}>
      <div style={{fontSize:56,marginBottom:16}}>🍓</div>
      <div style={{fontSize:22,fontWeight:900,color:BLANCO}}>Lady Fresa</div>
      <div style={{fontSize:13,color:"rgba(255,255,255,0.7)",marginTop:8}}>Conectando…</div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // VISTA: NUEVO / EDITAR GASTO
  // ══════════════════════════════════════════════════════════════════════════
  if(view==="nuevo")return(
    <Screen title={editandoId?"Editar Gasto":"Nuevo Gasto"}
      onBack={()=>{setEditandoId(null);setForm(FORM0);setView("inicio");}}>

      <FL>Fecha</FL>
      <input type="date" style={S.input} value={form.fecha} onChange={e=>setForm(f=>({...f,fecha:e.target.value}))}/>

      <FL>{catErr?<span style={{color:"#E53935"}}>Categoría * ← elige una</span>:"Categoría *"}</FL>
      <div style={{...S.catGrid,border:catErr?"2px solid #E53935":"none",borderRadius:14,padding:catErr?6:0}}>
        {CATS.map(c=>(
          <button key={c.id} onClick={()=>{setForm(f=>({...f,cat:c.id}));setCatErr(false);}}
            style={{...S.catBtn,background:form.cat===c.id?c.color:GRIS_LIGHT,
              color:form.cat===c.id?BLANCO:GRIS_MED,
              border:`2px solid ${form.cat===c.id?c.color:"#E0E0E0"}`,
              transform:form.cat===c.id?"scale(1.06)":"scale(1)"}}>
            <span style={{fontSize:22}}>{c.emoji}</span>
            <span style={{fontSize:9,marginTop:3,textAlign:"center",lineHeight:1.2,fontWeight:600}}>{c.label}</span>
          </button>
        ))}
      </div>

      <FL>Proveedor / Concepto *</FL>
      {(()=>{
        const sugs=[...new Set(gastos.map(g=>g.concepto))].filter(c=>c&&form.concepto&&c.toLowerCase().includes(form.concepto.toLowerCase())&&c!==form.concepto).slice(0,4);
        return(
          <div style={{position:"relative"}}>
            <input style={S.input} placeholder="Ej: Fresa mx, Central Abastos…" value={form.concepto}
              onChange={e=>setForm(f=>({...f,concepto:e.target.value}))}/>
            {sugs.length>0&&(
              <div style={{position:"absolute",top:"100%",left:0,right:0,background:BLANCO,borderRadius:10,
                boxShadow:"0 4px 16px rgba(0,0,0,0.12)",zIndex:50,overflow:"hidden"}}>
                {sugs.map(s=>(
                  <button key={s} onClick={()=>setForm(f=>({...f,concepto:s}))}
                    style={{display:"block",width:"100%",textAlign:"left",padding:"11px 14px",
                      border:"none",borderBottom:"1px solid #F5F5F5",background:BLANCO,
                      cursor:"pointer",fontSize:14,color:GRIS_DARK,fontFamily:"inherit"}}>
                    🔍 {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      <FL>Monto ($) *</FL>
      <div style={{position:"relative"}}>
        <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:20,fontWeight:800,color:form.monto?ROSA:"#CCC"}}>$</span>
        <input type="number" inputMode="decimal"
          style={{...S.input,paddingLeft:32,fontSize:26,fontWeight:800,color:ROSA}}
          placeholder="0" value={form.monto} onChange={e=>setForm(f=>({...f,monto:e.target.value}))}/>
      </div>
      {form.cat&&form.monto&&esInusual(form.cat,parseFloat(form.monto))&&(
        <div style={S.alertaBanner}>⚠️ Monto inusualmente alto para esta categoría</div>
      )}

      <FL>Tipo de pago *</FL>
      <div style={{display:"flex",gap:8,marginBottom:4}}>
        {[
          {id:"contado",label:"Contado",emoji:"✅",color:VERDE,desc:"Pago inmediato"},
          {id:"credito",label:"Crédito",emoji:"⏳",color:AMBAR,desc:"Se paga después"},
          {id:"cuenta",label:"A cuenta",emoji:"🔄",color:AZUL,desc:"Reembolso pendiente"},
        ].map(t=>(
          <button key={t.id} onClick={()=>setForm(f=>({...f,tipo_pago:t.id}))}
            style={{flex:1,padding:"10px 4px",borderRadius:12,cursor:"pointer",fontFamily:"inherit",
              border:`2px solid ${form.tipo_pago===t.id?t.color:"#E0E0E0"}`,
              background:form.tipo_pago===t.id?t.color+"18":GRIS_LIGHT,textAlign:"center"}}>
            <div style={{fontSize:20}}>{t.emoji}</div>
            <div style={{fontSize:10,fontWeight:800,color:form.tipo_pago===t.id?t.color:GRIS_MED,marginTop:2}}>{t.label}</div>
            <div style={{fontSize:9,color:GRIS_TEXT}}>{t.desc}</div>
          </button>
        ))}
      </div>

      {form.tipo_pago==="credito"&&(
        <>
          <FL>Días de crédito</FL>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:4}}>
            {["7","14","30","60"].map(d=>(
              <Chip key={d} active={form.dias_credito===d} color={AMBAR}
                onClick={()=>setForm(f=>({...f,dias_credito:d}))}>{d} días</Chip>
            ))}
          </div>
          <input type="number" inputMode="numeric" style={S.input}
            placeholder="O escribe los días…" value={form.dias_credito}
            onChange={e=>setForm(f=>({...f,dias_credito:e.target.value}))}/>
          {form.dias_credito&&form.fecha&&(
            <div style={{...S.infoBox,marginTop:6}}>
              📅 Vence el: <strong>{addDays(form.fecha,parseInt(form.dias_credito)||0)}</strong>
            </div>
          )}
        </>
      )}

      <FL>Forma de pago</FL>
      <div style={S.chipRow}>{FORMA_OPTS.map(o=><Chip key={o} active={form.forma===o} color={ROSA} onClick={()=>setForm(f=>({...f,forma:o}))}>{o}</Chip>)}</div>

      <FL>¿Quién pagó?</FL>
      <div style={S.chipRow}>{EQUIPO.map(o=><Chip key={o} active={form.quien===o} color={GRIS_MED} onClick={()=>setForm(f=>({...f,quien:o}))}>{o}</Chip>)}</div>

      <FL>Nota (opcional)</FL>
      <textarea style={{...S.input,height:60,resize:"none"}} placeholder="Observación…"
        value={form.nota} onChange={e=>setForm(f=>({...f,nota:e.target.value}))}/>

      <FL>📷 Foto del ticket</FL>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleFoto}/>
      {form.foto
        ?<div style={{position:"relative",marginBottom:8}}>
           <img src={form.foto} alt="ticket" style={{width:"100%",borderRadius:12,objectFit:"cover",maxHeight:160}}/>
           <button onClick={()=>setForm(f=>({...f,foto:null}))} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.5)",border:"none",borderRadius:20,color:BLANCO,padding:"4px 10px",cursor:"pointer",fontSize:12}}>✕</button>
         </div>
        :<button onClick={()=>fileRef.current.click()} disabled={uploadingFoto} style={{...S.btnSec,marginBottom:8,opacity:uploadingFoto?0.6:1}}>
           {uploadingFoto?"⏳ Subiendo…":"📷 Foto del ticket"}
         </button>
      }
      {error&&<div style={S.errorBanner}>{error}</div>}
      <button onClick={saveGasto} disabled={!form.monto||!form.concepto}
        style={{...S.btnPri,opacity:(!form.monto||!form.concepto)?0.4:1,background:saved?VERDE:ROSA}}>
        {saved?"✅ ¡Guardado!":editandoId?"💾 Guardar cambios":"Guardar Gasto"}
      </button>
    </Screen>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // VISTA: VENTA DEL DÍA
  // ══════════════════════════════════════════════════════════════════════════
  if(view==="ventas")return(
    <Screen title="Venta de Efectivo" onBack={()=>{setVForm(VFORM0);setView("inicio");}}>
      <div style={{...S.infoBox,marginBottom:16}}>💵 Registra el efectivo del día para cuadrar la recolección.</div>
      <FL>Fecha</FL>
      <input type="date" style={S.input} value={vForm.fecha} onChange={e=>setVForm(f=>({...f,fecha:e.target.value}))}/>
      {ventas.find(v=>v.fecha===vForm.fecha)&&(
        <div style={{...S.alertaBanner,background:AZUL_BG,color:AZUL,border:`1px solid ${AZUL}`,marginBottom:4}}>⚠️ Ya existe — se sobreescribirá</div>
      )}
      <FL>Efectivo del día ($) *</FL>
      <div style={{position:"relative"}}>
        <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:20,fontWeight:800,color:VERDE}}>$</span>
        <input type="number" inputMode="decimal"
          style={{...S.input,paddingLeft:32,fontSize:28,fontWeight:800,color:VERDE}}
          placeholder="0" value={vForm.efectivo} onChange={e=>setVForm(f=>({...f,efectivo:e.target.value}))}/>
      </div>
      <FL>¿Quién registra?</FL>
      <div style={S.chipRow}>{EQUIPO.map(o=><Chip key={o} active={vForm.quien===o} color={VERDE} onClick={()=>setVForm(f=>({...f,quien:o}))}>{o}</Chip>)}</div>
      <FL>Nota</FL>
      <textarea style={{...S.input,height:56,resize:"none"}} value={vForm.nota} onChange={e=>setVForm(f=>({...f,nota:e.target.value}))}/>
      {error&&<div style={S.errorBanner}>{error}</div>}
      <button onClick={saveVenta} disabled={!vForm.efectivo}
        style={{...S.btnPri,opacity:!vForm.efectivo?0.4:1,background:vSaved?VERDE:ROSA}}>
        {vSaved?"✅ ¡Guardado!":"Guardar Venta"}
      </button>
    </Screen>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // VISTA: RECOLECCIÓN
  // ══════════════════════════════════════════════════════════════════════════
  if(view==="recoleccion")return(
    <Screen title="Recolección de Efectivo" onBack={()=>setView("inicio")}>
      <div style={{background:`linear-gradient(135deg,${VERDE},#1B5E20)`,borderRadius:18,padding:"20px",color:BLANCO,marginBottom:20,boxShadow:"0 6px 20px rgba(46,125,50,0.25)"}}>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.7)"}}>Efectivo pendiente</div>
        <div style={{fontSize:38,fontWeight:900,letterSpacing:-1.5}}>{fmtMXN(montoPendiente)}</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.65)",marginTop:4}}>{diasPendientes.length} días sin recolectar</div>
      </div>

      {diasPendientes.length===0?<Empty>✅ Todo recolectado</Empty>:(
        <>
          <ST>Selecciona días a recolectar</ST>
          <EditableVentasDias diasPendientes={diasPendientes} ventas={ventas} rForm={rForm} setRForm={setRForm} setSelVentaDia={setSelVentaDia} setView={setView} onVentaUpdated={fetchV}/>

          {rForm.selDias.length>0&&(
            <div style={{background:VERDE_BG,borderRadius:12,padding:"14px 16px",marginTop:4,border:"1px solid #A5D6A7",marginBottom:4}}>
              <div style={{fontSize:12,color:VERDE,fontWeight:700}}>Total a recolectar</div>
              <div style={{fontSize:28,fontWeight:900,color:VERDE}}>{fmtMXN(rForm.selDias.reduce((s,d)=>{const v=ventas.find(v=>v.fecha===d);return s+(v?.efectivo||0);},0))}</div>
            </div>
          )}

          <FL>Fecha de recolección</FL>
          <input type="date" style={S.input} value={rForm.fecha_recoleccion} onChange={e=>setRForm(f=>({...f,fecha_recoleccion:e.target.value}))}/>
          <FL>¿Quién recolecta? *</FL>
          <div style={S.chipRow}>{["José Luis","Jefeson"].map(o=><Chip key={o} active={rForm.quien===o} color={VERDE} onClick={()=>setRForm(f=>({...f,quien:o}))}>{o}</Chip>)}</div>

          {/* ── MONTO FÍSICO ── */}
          {(()=>{
            const montoDeclarado=rForm.selDias.reduce((s,d)=>{const v=ventas.find(v=>v.fecha===d);return s+(v?.efectivo||0);},0);
            const montoFisico=rForm.monto_fisico?parseFloat(rForm.monto_fisico):null;
            const faltante=montoFisico!=null?Math.max(0,montoDeclarado-montoFisico):0;
            const sobra=montoFisico!=null?Math.max(0,montoFisico-montoDeclarado):0;
            return(
              <div style={{background:BLANCO,borderRadius:14,padding:"14px",marginTop:12,border:"1.5px solid #E0E0E0"}}>
                <div style={{fontSize:12,fontWeight:800,color:GRIS_MED,marginBottom:10,textTransform:"uppercase",letterSpacing:0.6}}>
                  💵 Cuadre de efectivo
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{textAlign:"center",flex:1}}>
                    <div style={{fontSize:10,color:GRIS_TEXT,fontWeight:700,marginBottom:3}}>DECLARADO</div>
                    <div style={{fontSize:20,fontWeight:900,color:VERDE}}>{fmtMXN(montoDeclarado)}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",fontSize:18,color:"#CCC"}}>≠</div>
                  <div style={{textAlign:"center",flex:1}}>
                    <div style={{fontSize:10,color:GRIS_TEXT,fontWeight:700,marginBottom:3}}>FÍSICO</div>
                    <div style={{fontSize:20,fontWeight:900,color:montoFisico!=null?(faltante>0?"#E53935":sobra>0?AMBAR:VERDE):GRIS_TEXT}}>
                      {montoFisico!=null?fmtMXN(montoFisico):"—"}
                    </div>
                  </div>
                </div>
                <div style={{position:"relative",marginBottom:8}}>
                  <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:16,fontWeight:900,color:VERDE}}>$</span>
                  <input type="number" inputMode="decimal"
                    style={{...S.input,paddingLeft:28,fontSize:20,fontWeight:900,color:VERDE}}
                    placeholder="Monto físico entregado (opcional)"
                    value={rForm.monto_fisico}
                    onChange={e=>setRForm(f=>({...f,monto_fisico:e.target.value}))}/>
                </div>
                {faltante>0&&(
                  <div style={{background:"#FFEBEE",borderRadius:10,padding:"12px 14px",border:"1.5px solid #EF9A9A"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <span style={{fontSize:13,fontWeight:800,color:"#E53935"}}>🔴 Faltante</span>
                      <span style={{fontSize:20,fontWeight:900,color:"#E53935"}}>{fmtMXN(faltante)}</span>
                    </div>
                    <div style={{fontSize:11,color:"#C62828",marginBottom:8}}>¿Quién tiene el faltante?</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {EQUIPO.map(p=>(
                        <button key={p} onClick={()=>setRForm(f=>({...f,quien_faltante:p}))}
                          style={{padding:"6px 12px",borderRadius:16,border:"none",
                            background:rForm.quien_faltante===p?"#E53935":"#FFCDD2",
                            color:rForm.quien_faltante===p?BLANCO:"#C62828",
                            fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                          {p}
                        </button>
                      ))}
                    </div>
                    {rForm.quien_faltante&&(
                      <div style={{marginTop:8,fontSize:12,color:"#C62828",fontWeight:600}}>
                        📋 Se registrará deuda de {fmtMXN(faltante)} a cargo de {rForm.quien_faltante}
                      </div>
                    )}
                  </div>
                )}
                {sobra>0&&(
                  <div style={{background:AMBAR_BG,borderRadius:10,padding:"10px 14px",border:`1.5px solid ${AMBAR}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:13,fontWeight:800,color:AMBAR}}>⚠️ Sobrante</span>
                      <span style={{fontSize:18,fontWeight:900,color:AMBAR}}>{fmtMXN(sobra)}</span>
                    </div>
                    <div style={{fontSize:11,color:AMBAR,marginTop:4}}>Hay más efectivo del declarado — anota en la nota.</div>
                  </div>
                )}
                {montoFisico!=null&&faltante===0&&sobra===0&&(
                  <div style={{background:VERDE_BG,borderRadius:10,padding:"10px 14px",border:"1.5px solid #A5D6A7",textAlign:"center"}}>
                    <span style={{fontSize:13,fontWeight:800,color:VERDE}}>✅ Cuadre perfecto</span>
                  </div>
                )}
              </div>
            );
          })()}

          <FL>Nota</FL>
          <textarea style={{...S.input,height:56,resize:"none"}} value={rForm.nota} onChange={e=>setRForm(f=>({...f,nota:e.target.value}))}/>
          {error&&<div style={S.errorBanner}>{error}</div>}
          <button onClick={saveRecoleccion} disabled={!rForm.selDias.length||!rForm.quien}
            style={{...S.btnPri,opacity:(!rForm.selDias.length||!rForm.quien)?0.4:1,background:rSaved?VERDE:ROSA}}>
            {rSaved?"✅ ¡Recolectado!":"Confirmar Recolección"}
          </button>
        </>
      )}

      {recolecciones.length>0&&(
        <>
          <ST>Historial de recolecciones</ST>
          {(()=>{
            const totalFaltantes=recolecciones.reduce((s,r)=>s+(r.faltante||0),0);
            return(
              <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:120,background:VERDE_BG,borderRadius:14,padding:"12px",border:"1.5px solid #A5D6A7",textAlign:"center"}}>
                  <div style={{fontSize:10,color:VERDE,fontWeight:700}}>Total recolectado</div>
                  <div style={{fontSize:18,fontWeight:900,color:VERDE}}>{fmtMXN(recolecciones.reduce((s,r)=>s+(r.monto_fisico??r.monto_total)||0,0))}</div>
                </div>
                <div style={{flex:1,minWidth:120,background:AZUL_BG,borderRadius:14,padding:"12px",border:"1.5px solid #90CAF9",textAlign:"center"}}>
                  <div style={{fontSize:10,color:AZUL,fontWeight:700}}>Recolecciones</div>
                  <div style={{fontSize:18,fontWeight:900,color:AZUL}}>{recolecciones.length}</div>
                </div>
                {totalFaltantes>0&&(
                  <div style={{flex:1,minWidth:120,background:"#FFEBEE",borderRadius:14,padding:"12px",border:"1.5px solid #EF9A9A",textAlign:"center"}}>
                    <div style={{fontSize:10,color:"#E53935",fontWeight:700}}>Faltantes</div>
                    <div style={{fontSize:18,fontWeight:900,color:"#E53935"}}>{fmtMXN(totalFaltantes)}</div>
                  </div>
                )}
              </div>
            );
          })()}
          {recolecciones.map(r=>(
            <button key={r.id} onClick={()=>{setSelRec(r);setView("detalle-recoleccion");}}
              style={{...S.card,display:"flex",alignItems:"center",gap:12,width:"100%",
                border:r.faltante>0?"1.5px solid #EF9A9A":"1.5px solid transparent",
                cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
              <div style={{...S.catEmoji,background:r.faltante>0?"#FFEBEE":VERDE_BG,color:r.faltante>0?"#E53935":VERDE}}>
                {r.faltante>0?"⚠️":"💰"}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14}}>{r.fecha_recoleccion}</div>
                <div style={{fontSize:11,color:GRIS_TEXT,marginTop:2}}>{r.quien||"—"} · {(r.fechas_cubiertas||[]).length} días</div>
                {r.faltante>0&&<div style={{fontSize:11,color:"#E53935",fontWeight:700,marginTop:2}}>🔴 Faltante: {fmtMXN(r.faltante)}{r.quien_faltante?` · ${r.quien_faltante}`:""}</div>}
                {r.nota&&<div style={{fontSize:11,color:"#C0C0C0",fontStyle:"italic",marginTop:2}}>{r.nota}</div>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{fontWeight:900,color:r.faltante>0?"#E53935":VERDE,fontSize:15}}>{fmtMXN(r.monto_fisico??r.monto_total)}</div>
                <span style={{color:"#CCC",fontSize:18}}>›</span>
              </div>
            </button>
          ))}
        </>
      )}
    </Screen>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // VISTA: DETALLE RECOLECCIÓN
  // ══════════════════════════════════════════════════════════════════════════
  if(view==="detalle-recoleccion"&&selRec){
    const r=recolecciones.find(x=>x.id===selRec.id)||selRec;
    const dias=r.fechas_cubiertas||[];
    return(
      <Screen title="Detalle Recolección" onBack={()=>{setView("recoleccion");setSelRec(null);setEditRecForm(null);}}>
        <div style={{background:r.faltante>0?`linear-gradient(135deg,#C62828,#B71C1C)`:`linear-gradient(135deg,${VERDE},#1B5E20)`,borderRadius:18,padding:"22px 20px",color:BLANCO,marginBottom:12,boxShadow:"0 8px 24px rgba(46,125,50,0.25)"}}>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginBottom:4}}>💰 {r.fecha_recoleccion}</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginBottom:2}}>Declarado</div>
          <div style={{fontSize:36,fontWeight:900,letterSpacing:-1.5}}>{fmtMXN(r.monto_total)}</div>
          {r.monto_fisico!=null&&(
            <div style={{marginTop:8,display:"flex",gap:20}}>
              <div><div style={{fontSize:10,color:"rgba(255,255,255,0.6)"}}>Físico entregado</div><div style={{fontSize:18,fontWeight:900}}>{fmtMXN(r.monto_fisico)}</div></div>
              {r.faltante>0&&<div><div style={{fontSize:10,color:"rgba(255,255,255,0.6)"}}>Faltante</div><div style={{fontSize:18,fontWeight:900,color:"#FFB3B3"}}>{fmtMXN(r.faltante)}</div></div>}
            </div>
          )}
          <div style={{fontSize:13,color:"rgba(255,255,255,0.7)",marginTop:8}}>Recolectó: <strong>{r.quien||"—"}</strong> · {dias.length} días</div>
          {r.faltante>0&&r.quien_faltante&&<div style={{fontSize:12,color:"#FFB3B3",marginTop:4}}>⚠️ Faltante a cargo de: <strong>{r.quien_faltante}</strong></div>}
        </div>
        {r.faltante>0&&(
          <div style={{background:"#FFEBEE",borderRadius:12,padding:"12px 16px",marginBottom:16,border:"1.5px solid #EF9A9A"}}>
            <div style={{fontSize:13,fontWeight:800,color:"#E53935",marginBottom:4}}>🔴 Deuda pendiente: {fmtMXN(r.faltante)}</div>
            <div style={{fontSize:12,color:"#C62828"}}>
              {r.quien_faltante?`${r.quien_faltante} debe entregar este monto en el siguiente corte.`:"Asigna a quién corresponde el faltante editando esta recolección."}
            </div>
          </div>
        )}

        {!editRecForm?(
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            <button onClick={()=>setEditRecForm({quien:r.quien,nota:r.nota||"",fecha_recoleccion:r.fecha_recoleccion,quien_faltante:r.quien_faltante||""})}
              style={{flex:1,...S.actionBtn,color:AZUL,borderColor:AZUL,background:AZUL_BG}}>✏️ Editar</button>
            <button onClick={()=>{if(window.confirm("¿Cancelar esta recolección?"))deleteRecoleccion(r.id);}}
              style={{flex:1,...S.actionBtn,color:"#E53935",borderColor:"#EF9A9A",background:"#FFEBEE"}}>🗑 Cancelar</button>
          </div>
        ):(
          <div style={{background:AZUL_BG,borderRadius:14,padding:16,marginBottom:16,border:"1.5px solid #90CAF9"}}>
            <div style={{fontWeight:800,fontSize:13,color:AZUL,marginBottom:12}}>✏️ Editar</div>
            <FL>Fecha</FL>
            <input type="date" style={S.input} value={editRecForm.fecha_recoleccion} onChange={e=>setEditRecForm(f=>({...f,fecha_recoleccion:e.target.value}))}/>
            <FL>¿Quién recolectó?</FL>
            <div style={S.chipRow}>{["José Luis","Jefeson"].map(o=><Chip key={o} active={editRecForm.quien===o} color={VERDE} onClick={()=>setEditRecForm(f=>({...f,quien:o}))}>{o}</Chip>)}</div>
            <FL>Nota</FL>
            <textarea style={{...S.input,height:56,resize:"none"}} value={editRecForm.nota} onChange={e=>setEditRecForm(f=>({...f,nota:e.target.value}))}/>
            {r.faltante>0&&(
              <>
                <FL>¿Quién tiene el faltante? ({fmtMXN(r.faltante)})</FL>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {EQUIPO.map(p=>(
                    <button key={p} onClick={()=>setEditRecForm(f=>({...f,quien_faltante:p}))}
                      style={{padding:"7px 13px",borderRadius:16,border:"none",
                        background:editRecForm.quien_faltante===p?"#E53935":"#FFCDD2",
                        color:editRecForm.quien_faltante===p?BLANCO:"#C62828",
                        fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                      {p}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button onClick={()=>setEditRecForm(null)} style={{flex:1,...S.btnSec,marginTop:0,padding:"12px 0"}}>Cancelar</button>
              <button onClick={()=>updateRecoleccion(r.id,editRecForm)} style={{flex:1,...S.btnPri,marginTop:0,padding:"12px 0",background:AZUL}}>Guardar</button>
            </div>
          </div>
        )}

        <ST>Días cubiertos</ST>
        {dias.sort().map(fecha=>{
          const v=ventas.find(v=>v.fecha===fecha);
          return(
            <button key={fecha} onClick={()=>{setSelVentaDia(fecha);setView("detalle-venta");}}
              style={{...S.card,display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",border:"none",cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:8}}>
              <div>
                <div style={{fontWeight:700,fontSize:14}}>{fecha}</div>
                <div style={{fontSize:11,color:GRIS_TEXT,marginTop:2}}>Registró: {v?.quien||"—"}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{fontWeight:900,color:VERDE,fontSize:16}}>{fmtMXN(v?.efectivo)}</div>
                <span style={{fontSize:11,background:VERDE_BG,color:VERDE,borderRadius:6,padding:"2px 7px",fontWeight:700}}>✓</span>
                <span style={{color:"#CCC",fontSize:18}}>›</span>
              </div>
            </button>
          );
        })}

        <ST>Comentarios</ST>
        {r.nota&&<div style={{background:GRIS_LIGHT,borderRadius:12,padding:"12px 14px",marginBottom:12,fontSize:13,color:GRIS_DARK}}>{r.nota}</div>}
        <textarea style={{...S.input,height:72,resize:"none"}} placeholder="Agregar comentario…" value={comentario} onChange={e=>setComentario(e.target.value)}/>
        <button onClick={()=>agregarComentario(r.id,r.nota)} disabled={!comentario.trim()}
          style={{...S.btnPri,opacity:!comentario.trim()?0.4:1,background:AZUL,boxShadow:"0 6px 20px rgba(21,101,192,0.25)"}}>
          💬 Agregar comentario
        </button>
      </Screen>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VISTA: DETALLE VENTA DÍA
  // ══════════════════════════════════════════════════════════════════════════
  if(view==="detalle-venta"&&selVentaDia){
    const v=ventas.find(v=>v.fecha===selVentaDia);
    const recol=recolecciones.find(r=>(r.fechas_cubiertas||[]).includes(selVentaDia));
    const gastosDia=gastos.filter(g=>g.fecha===selVentaDia);
    const totalGDia=gastosDia.reduce((s,g)=>s+g.monto,0);
    const backView=selRec?"detalle-recoleccion":"recoleccion";
    return(
      <Screen title={`Día · ${selVentaDia}`} onBack={()=>setView(backView)}>
        <div style={{background:`linear-gradient(135deg,${v?VERDE:"#546E7A"},${v?"#1B5E20":"#37474F"})`,borderRadius:18,padding:"22px 20px",color:BLANCO,marginBottom:16,boxShadow:"0 8px 24px rgba(0,0,0,0.15)"}}>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginBottom:4}}>{v?"💵 Venta del día":"📭 Sin registro"}</div>
          <div style={{fontSize:40,fontWeight:900,letterSpacing:-1.5}}>{v?fmtMXN(v.efectivo):"$0"}</div>
          {v&&<div style={{fontSize:13,color:"rgba(255,255,255,0.7)",marginTop:6}}>Registró: <strong>{v.quien||"—"}</strong></div>}
        </div>

        <div style={{borderRadius:12,padding:"12px 16px",marginBottom:16,
          background:recol?VERDE_BG:AMBAR_BG,border:`1.5px solid ${recol?"#A5D6A7":AMBAR}`}}>
          <div style={{fontWeight:800,fontSize:13,color:recol?VERDE:AMBAR}}>
            {recol?"✅ Efectivo recolectado":"⏳ Pendiente de recolectar"}
          </div>
          {recol&&<div style={{fontSize:11,color:GRIS_TEXT,marginTop:4}}>Recolectó {recol.quien} el {recol.fecha_recoleccion}</div>}
        </div>

        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {v?(
            <button onClick={()=>{setVForm({fecha:v.fecha,efectivo:String(v.efectivo),quien:v.quien||"",nota:v.nota||""});setView("ventas");}}
              style={{flex:1,...S.actionBtn,color:AZUL,borderColor:AZUL,background:AZUL_BG}}>✏️ Editar venta</button>
          ):(
            <button onClick={()=>{setVForm({fecha:selVentaDia,efectivo:"",quien:"",nota:""});setView("ventas");}}
              style={{flex:1,...S.actionBtn,color:VERDE,borderColor:VERDE,background:VERDE_BG}}>+ Registrar venta</button>
          )}
        </div>

        {v?.nota&&<div style={{background:GRIS_LIGHT,borderRadius:12,padding:"12px 14px",marginBottom:16,fontSize:13,color:GRIS_DARK,fontStyle:"italic"}}>{v.nota}</div>}

        {gastosDia.length>0&&(
          <>
            <ST>Gastos del mismo día · {fmtMXN(totalGDia)}</ST>
            {gastosDia.map(g=><GastoRow key={g.id} g={g} onDelete={deleteGasto} onEdit={startEdit} inusual={esInusual(g.cat,g.monto)}/>)}
          </>
        )}
      </Screen>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VISTA: CRÉDITOS
  // ══════════════════════════════════════════════════════════════════════════
  if(view==="creditos"){
    const pendientes=gastos.filter(g=>g.tipo_pago==="credito"&&!g.pagado).sort((a,b)=>(a.fecha_vencimiento||"9").localeCompare(b.fecha_vencimiento||"9"));
    const pagados=gastos.filter(g=>g.tipo_pago==="credito"&&g.pagado).sort((a,b)=>(b.fecha_pago||"").localeCompare(a.fecha_pago||""));
    const totalPendiente=pendientes.reduce((s,g)=>s+g.monto,0);
    return(
      <Screen title="Créditos" onBack={()=>setView("inicio")}>
        <div style={{background:`linear-gradient(135deg,${AMBAR},#E65100)`,borderRadius:18,padding:"22px 20px",color:BLANCO,marginBottom:16,boxShadow:"0 8px 24px rgba(245,127,23,0.3)"}}>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginBottom:4}}>⏳ Total pendiente de pago</div>
          <div style={{fontSize:40,fontWeight:900,letterSpacing:-1.5}}>{fmtMXN(totalPendiente)}</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.7)",marginTop:6}}>{pendientes.length} compra{pendientes.length!==1?"s":""} · {vencidos.length} vencida{vencidos.length!==1?"s":""}</div>
        </div>

        {vencidos.length>0&&(
          <div style={{...S.alertaBanner,marginBottom:12}}>
            🔴 {vencidos.length} crédito{vencidos.length!==1?"s":""} vencido{vencidos.length!==1?"s":""} — requiere atención
          </div>
        )}

        {/* Modal pagar */}
        {pagoForm&&(
          <div style={{background:VERDE_BG,borderRadius:14,padding:16,marginBottom:16,border:"2px solid #A5D6A7"}}>
            <div style={{fontWeight:800,fontSize:14,color:VERDE,marginBottom:12}}>
              ✅ Registrar pago — {gastos.find(g=>g.id===pagoForm.id)?.concepto}
            </div>
            <FL>Fecha de pago</FL>
            <input type="date" style={S.input} value={pagoForm.fecha} onChange={e=>setPagoForm(f=>({...f,fecha:e.target.value}))}/>
            <FL>¿Cómo se pagó?</FL>
            <div style={S.chipRow}>{FORMA_OPTS.map(o=><Chip key={o} active={pagoForm.forma===o} color={VERDE} onClick={()=>setPagoForm(f=>({...f,forma:o}))}>{o}</Chip>)}</div>
            <FL>Nota (opcional)</FL>
            <input style={S.input} placeholder="Ej: pagado en tienda, transferencia confirmada…" value={pagoForm.nota} onChange={e=>setPagoForm(f=>({...f,nota:e.target.value}))}/>
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button onClick={()=>setPagoForm(null)} style={{flex:1,...S.btnSec,marginTop:0,padding:"12px 0"}}>Cancelar</button>
              <button onClick={marcarPagado} style={{flex:1,...S.btnPri,marginTop:0,padding:"12px 0",background:VERDE}}>✅ Confirmar pago</button>
            </div>
          </div>
        )}

        <ST>Pendientes de pago ({pendientes.length})</ST>
        {pendientes.length===0?<Empty>Sin créditos pendientes 🎉</Empty>:pendientes.map(g=>{
          const venc=g.fecha_vencimiento;
          const isVencido=venc&&venc<todayISO();
          const diasFalta=venc?Math.round((new Date(venc)-new Date(todayISO()))/(1000*60*60*24)):null;
          return(
            <div key={g.id} style={{...S.card,borderLeft:`4px solid ${isVencido?"#E53935":AMBAR}`,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <div style={{fontWeight:800,fontSize:15}}>{g.concepto}</div>
                  <div style={{fontSize:11,color:GRIS_TEXT,marginTop:2}}>
                    {g.fecha} · {g.quien||"—"} · {CATS.find(c=>c.id===g.cat)?.emoji} {CATS.find(c=>c.id===g.cat)?.label}
                  </div>
                </div>
                <div style={{fontWeight:900,color:isVencido?"#E53935":AMBAR,fontSize:18}}>{fmtMXN(g.monto)}</div>
              </div>
              {venc&&(
                <div style={{fontSize:12,fontWeight:700,marginBottom:8,
                  color:isVencido?"#E53935":diasFalta<=7?AMBAR:VERDE,
                  background:isVencido?"#FFEBEE":diasFalta<=7?AMBAR_BG:VERDE_BG,
                  borderRadius:8,padding:"4px 10px",display:"inline-block"}}>
                  {isVencido?`🔴 Vencido (${Math.abs(diasFalta)} días)`:diasFalta===0?"🟡 Vence hoy":`📅 Vence ${venc} (${diasFalta} días)`}
                </div>
              )}
              {g.nota&&<div style={{fontSize:11,color:GRIS_TEXT,fontStyle:"italic",marginBottom:8}}>{g.nota}</div>}
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>startEdit(g)} style={{flex:1,...S.actionBtn,color:AZUL,borderColor:AZUL,background:AZUL_BG,fontSize:12}}>✏️ Editar</button>
                <button onClick={()=>setPagoForm({id:g.id,fecha:todayISO(),forma:"Efectivo",nota:""})}
                  style={{flex:2,...S.actionBtn,color:VERDE,borderColor:VERDE,background:VERDE_BG,fontSize:12}}>✅ Registrar pago</button>
              </div>
            </div>
          );
        })}

        {pagados.length>0&&(
          <>
            <ST>Pagados ({pagados.length})</ST>
            {pagados.slice(0,20).map(g=>(
              <div key={g.id} style={{...S.card,borderLeft:"4px solid #A5D6A7",opacity:0.85,marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:14}}>{g.concepto}</div>
                    <div style={{fontSize:11,color:GRIS_TEXT,marginTop:2}}>
                      Compra: {g.fecha} · Pagado: {g.fecha_pago||"—"} · {g.forma}
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:900,color:VERDE,fontSize:15}}>{fmtMXN(g.monto)}</div>
                    <div style={{fontSize:10,background:VERDE_BG,color:VERDE,borderRadius:6,padding:"2px 6px",marginTop:2}}>✓ pagado</div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </Screen>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VISTA: RESUMEN MES
  // ══════════════════════════════════════════════════════════════════════════
  if(view==="resumen"){
    const mk=currentMK,tg=totG(mk);
    const cats=porCat(mk),quien=porQuien(mk);
    const lista=gMes(mk).filter(g=>filtroQ==="todos"||g.quien===filtroQ).sort((a,b)=>b.fecha.localeCompare(a.fecha));
    const ventasMes=ventas.filter(v=>monthKey(v.fecha)===mk);
    const totalVentasMes=ventasMes.reduce((s,v)=>s+(v.efectivo||0),0);
    const credMes=gMes(mk).filter(g=>g.tipo_pago==="credito"&&!g.pagado);
    const totCred=credMes.reduce((s,g)=>s+g.monto,0);
    const diasDelMes=new Date(new Date().getFullYear(),new Date().getMonth()+1,0).getDate();
    const diasConV=ventasMes.length;
    return(
      <Screen title={`Resumen ${monthLabel(mk)}`} onBack={()=>setView("inicio")}
        action={<ExportBtn onClick={()=>exportExcel(gastos,ventas,recolecciones,mk)}/>}>

        <ST>📊 Dashboard del mes</ST>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <div style={{flex:1,...S.dashCard,borderTop:`3px solid ${VERDE}`}}>
            <div style={{fontSize:10,color:VERDE,fontWeight:800,marginBottom:4}}>💵 VENTAS</div>
            <div style={{fontSize:20,fontWeight:900,color:VERDE}}>{fmtMXN(totalVentasMes)}</div>
            <div style={{fontSize:10,color:GRIS_TEXT}}>{diasConV} días reg.</div>
          </div>
          <div style={{flex:1,...S.dashCard,borderTop:`3px solid ${ROSA}`}}>
            <div style={{fontSize:10,color:ROSA,fontWeight:800,marginBottom:4}}>🛒 GASTOS</div>
            <div style={{fontSize:20,fontWeight:900,color:ROSA}}>{fmtMXN(tg)}</div>
            <div style={{fontSize:10,color:GRIS_TEXT}}>{gMes(mk).length} registros</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <div style={{flex:1,...S.dashCard,borderTop:`3px solid ${AZUL}`}}>
            <div style={{fontSize:10,color:AZUL,fontWeight:800,marginBottom:4}}>✅ RECOLECTADO</div>
            <div style={{fontSize:20,fontWeight:900,color:AZUL}}>{fmtMXN(recolecciones.filter(r=>monthKey(r.fecha_recoleccion)===mk).reduce((s,r)=>s+(r.monto_total||0),0))}</div>
          </div>
          <div style={{flex:1,...S.dashCard,borderTop:`3px solid ${AMBAR}`}}>
            <div style={{fontSize:10,color:AMBAR,fontWeight:800,marginBottom:4}}>⏳ PENDIENTE</div>
            <div style={{fontSize:20,fontWeight:900,color:AMBAR}}>{fmtMXN(montoPendiente)}</div>
            <div style={{fontSize:10,color:GRIS_TEXT}}>{diasPendientes.length} días</div>
          </div>
        </div>

        {totCred>0&&<div style={{...S.alertaBanner,marginBottom:12,cursor:"pointer"}} onClick={()=>setView("creditos")}>
          ⏳ Créditos pendientes: <strong>{fmtMXN(totCred)}</strong> — toca para ver →
        </div>}
        {diasConV<diasDelMes/2&&<div style={{...S.alertaBanner,background:AZUL_BG,color:AZUL,border:`1px solid ${AZUL}`,marginBottom:12}}>
          📅 Solo {diasConV} de {diasDelMes} días con venta registrada
        </div>}

        {ventasMes.filter(v=>v.nota).length>0&&(
          <>{<ST>📝 Notas de ventas</ST>}
          {ventasMes.filter(v=>v.nota).slice(0,3).map(v=>(
            <div key={v.id} style={{background:BLANCO,borderRadius:12,padding:"10px 14px",marginBottom:8,boxShadow:"0 2px 6px rgba(0,0,0,0.04)",borderLeft:`3px solid ${VERDE}`}}>
              <div style={{fontSize:11,color:GRIS_TEXT,marginBottom:3}}>{v.fecha} · {v.quien||"—"} · {fmtMXN(v.efectivo)}</div>
              <div style={{fontSize:13,color:GRIS_DARK,fontStyle:"italic"}}>{v.nota}</div>
            </div>
          ))}</>
        )}

        <ST>Filtrar por persona</ST>
        <div style={{...S.chipRow,marginBottom:16}}>
          {["todos",...EQUIPO].map(o=><Chip key={o} active={filtroQ===o} color={ROSA} onClick={()=>setFiltroQ(o)}>{o==="todos"?"Todos":o}</Chip>)}
        </div>

        {filtroQ==="todos"&&Object.keys(quien).length>0&&(
          <>{<ST>Gasto por persona</ST>}
          {Object.entries(quien).sort((a,b)=>b[1]-a[1]).map(([nombre,monto])=>(
            <div key={nombre} style={S.personaRow}>
              <div style={S.personaAvatar}>{nombre.charAt(0)}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14}}>{nombre}</div>
                <div style={{height:4,background:"#F0F0F0",borderRadius:2,marginTop:5,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${tg?Math.round((monto/tg)*100):0}%`,background:ROSA,borderRadius:2}}/>
                </div>
              </div>
              <div style={{fontWeight:800,color:ROSA,fontSize:15,marginLeft:12}}>{fmtMXN(monto)}</div>
            </div>
          ))}</>
        )}

        <ST>Por categoría</ST>
        {CATS.filter(c=>cats[c.id]).sort((a,b)=>(cats[b.id]||0)-(cats[a.id]||0)).map(c=>{
          const pct=tg?Math.round((cats[c.id]/tg)*100):0;
          return(
            <div key={c.id} style={S.catRow}>
              <div style={{...S.catEmoji,background:c.color+"22",color:c.color}}>{c.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:13}}>{c.label}</div>
                <div style={{height:4,background:"#F0F0F0",borderRadius:2,marginTop:5,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:c.color,borderRadius:2}}/>
                </div>
                <div style={{fontSize:10,color:GRIS_TEXT,marginTop:2}}>{pct}%</div>
              </div>
              <div style={{fontWeight:800,color:c.color,fontSize:14,marginLeft:12}}>{fmtMXN(cats[c.id])}</div>
            </div>
          );
        })}

        <ST>Registros {filtroQ!=="todos"?`· ${filtroQ}`:""}</ST>
        {lista.length===0?<Empty>Sin gastos</Empty>:lista.map(g=><GastoRow key={g.id} g={g} onDelete={deleteGasto} onEdit={startEdit} inusual={esInusual(g.cat,g.monto)}/>)}
      </Screen>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VISTA: DASHBOARD
  // ══════════════════════════════════════════════════════════════════════════
  if(view==="dashboard"){
    const mk=currentMK;
    const mkP=(()=>{const d=new Date();d.setMonth(d.getMonth()-1);return monthKey(d.toISOString());})();
    const tg=totG(mk),tgP=totG(mkP);
    const ventasMes=ventas.filter(v=>monthKey(v.fecha)===mk);
    const ventasMesP=ventas.filter(v=>monthKey(v.fecha)===mkP);
    const tvM=ventasMes.reduce((s,v)=>s+(v.efectivo||0),0);
    const tvMP=ventasMesP.reduce((s,v)=>s+(v.efectivo||0),0);
    const totRecM=recolecciones.filter(r=>monthKey(r.fecha_recoleccion)===mk).reduce((s,r)=>s+(r.monto_total||0),0);
    const cats=porCat(mk),catsP=porCat(mkP);
    const credMes=gMes(mk).filter(g=>g.tipo_pago==="credito"&&!g.pagado);
    const totCred=credMes.reduce((s,g)=>s+g.monto,0);
    const diasDelMes=new Date(new Date().getFullYear(),new Date().getMonth()+1,0).getDate();
    const diasConV=ventasMes.length;
    const diasSinV=diasDelMes-diasConV;
    const gastosPorP={};
    gMes(mk).forEach(g=>{const k=g.quien||"Sin asignar";gastosPorP[k]=(gastosPorP[k]||0)+g.monto;});
    const topCats=CATS.filter(c=>cats[c.id]).sort((a,b)=>(cats[b.id]||0)-(cats[a.id]||0)).slice(0,3);
    const diff=(curr,prev)=>{if(!prev)return null;const pct=Math.round(((curr-prev)/prev)*100);return{pct,up:pct>=0};};

    return(
      <Screen title="Dashboard" onBack={()=>setView("inicio")}>
        <div style={{...S.heroCard,marginBottom:16}}>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>📅 {monthLabel(mk)}</div>
          <div style={{display:"flex",gap:20,marginTop:10,flexWrap:"wrap"}}>
            <div><div style={{fontSize:10,color:"rgba(255,255,255,0.6)"}}>Ventas</div><div style={{fontSize:24,fontWeight:900}}>{fmtMXN(tvM)}</div></div>
            <div><div style={{fontSize:10,color:"rgba(255,255,255,0.6)"}}>Gastos</div><div style={{fontSize:24,fontWeight:900,color:"#FFB3C6"}}>{fmtMXN(tg)}</div></div>
            <div><div style={{fontSize:10,color:"rgba(255,255,255,0.6)"}}>Balance</div><div style={{fontSize:24,fontWeight:900,color:tvM-tg>=0?"#A5F3A5":"#FFB3B3"}}>{fmtMXN(tvM-tg)}</div></div>
          </div>
        </div>

        {totCred>0&&<button style={{...S.alertaBanner,marginBottom:8,width:"100%",border:"none",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}} onClick={()=>setView("creditos")}>
          ⏳ Créditos sin pagar: <strong>{fmtMXN(totCred)}</strong> ({credMes.length}) — ver →
        </button>}
        {montoPendiente>0&&<div style={{...S.alertaBanner,background:AMBAR_BG,color:AMBAR,border:`1px solid ${AMBAR}`,marginBottom:8}}>
          💰 Efectivo sin recolectar: <strong>{fmtMXN(montoPendiente)}</strong> ({diasPendientes.length} días)
        </div>}
        {vencidos.length>0&&<div style={{...S.alertaBanner,background:"#FFEBEE",color:"#E53935",border:"1px solid #EF9A9A",marginBottom:8}}>
          🔴 {vencidos.length} crédito{vencidos.length!==1?"s":""} vencido{vencidos.length!==1?"s":""}
        </div>}
        {diasSinV>0&&<div style={{...S.alertaBanner,background:AZUL_BG,color:AZUL,border:`1px solid ${AZUL}`,marginBottom:16}}>
          📅 {diasSinV} día{diasSinV!==1?"s":""} sin venta registrada este mes
        </div>}

        <ST>📈 Este mes vs anterior</ST>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          {[{label:"💵 VENTAS",curr:tvM,prev:tvMP,color:VERDE,good:true},{label:"🛒 GASTOS",curr:tg,prev:tgP,color:ROSA,good:false}].map(x=>{
            const d=diff(x.curr,x.prev);
            return(
              <div key={x.label} style={{flex:1,...S.dashCard,borderTop:`3px solid ${x.color}`}}>
                <div style={{fontSize:10,color:x.color,fontWeight:800,marginBottom:4}}>{x.label}</div>
                <div style={{fontSize:18,fontWeight:900,color:x.color}}>{fmtMXN(x.curr)}</div>
                <div style={{fontSize:10,color:GRIS_TEXT}}>{fmtMXN(x.prev)} ant.</div>
                {d&&<div style={{fontSize:10,fontWeight:700,color:x.good?(d.up?"#E53935":VERDE):(d.up?"#E53935":VERDE)}}>{d.up?"▲":"▼"}{Math.abs(d.pct)}%</div>}
              </div>
            );
          })}
        </div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <div style={{flex:1,...S.dashCard,borderTop:`3px solid ${AZUL}`}}>
            <div style={{fontSize:10,color:AZUL,fontWeight:800,marginBottom:4}}>✅ RECOLECTADO</div>
            <div style={{fontSize:18,fontWeight:900,color:AZUL}}>{fmtMXN(totRecM)}</div>
          </div>
          <div style={{flex:1,...S.dashCard,borderTop:`3px solid ${AMBAR}`}}>
            <div style={{fontSize:10,color:AMBAR,fontWeight:800,marginBottom:4}}>⏳ PENDIENTE</div>
            <div style={{fontSize:18,fontWeight:900,color:AMBAR}}>{fmtMXN(montoPendiente)}</div>
            <div style={{fontSize:10,color:GRIS_TEXT}}>{diasConV} días con venta</div>
          </div>
        </div>

        <ST>🏆 Top categorías este mes</ST>
        {topCats.map((c,i)=>{
          const d=diff(cats[c.id]||0,catsP[c.id]||0);
          return(
            <div key={c.id} style={S.catRow}>
              <div style={{width:24,height:24,borderRadius:"50%",background:c.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:BLANCO,flexShrink:0}}>{i+1}</div>
              <div style={{...S.catEmoji,background:c.color+"22",color:c.color}}>{c.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:13}}>{c.label}</div>
                <div style={{height:4,background:"#F0F0F0",borderRadius:2,marginTop:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${tg?Math.round((cats[c.id]/tg)*100):0}%`,background:c.color,borderRadius:2}}/>
                </div>
              </div>
              <div style={{textAlign:"right",marginLeft:8}}>
                <div style={{fontWeight:900,color:c.color,fontSize:14}}>{fmtMXN(cats[c.id])}</div>
                {d&&<div style={{fontSize:10,fontWeight:700,color:d.up?"#E53935":VERDE}}>{d.up?"▲":"▼"}{Math.abs(d.pct)}%</div>}
              </div>
            </div>
          );
        })}

        {Object.keys(gastosPorP).length>0&&(
          <>{<ST>👤 Quién gastó más</ST>}
          {Object.entries(gastosPorP).sort((a,b)=>b[1]-a[1]).map(([nombre,monto],i)=>(
            <div key={nombre} style={S.personaRow}>
              <div style={{...S.personaAvatar,background:i===0?`${ROSA}22`:GRIS_LIGHT,color:i===0?ROSA:GRIS_MED}}>{i===0?"🥇":nombre.charAt(0)}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14}}>{nombre}</div>
                <div style={{height:4,background:"#F0F0F0",borderRadius:2,marginTop:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${tg?Math.round((monto/tg)*100):0}%`,background:i===0?ROSA:GRIS_MED,borderRadius:2}}/>
                </div>
                <div style={{fontSize:10,color:GRIS_TEXT,marginTop:2}}>{tg?Math.round((monto/tg)*100):0}%</div>
              </div>
              <div style={{fontWeight:900,color:i===0?ROSA:GRIS_MED,fontSize:15,marginLeft:8}}>{fmtMXN(monto)}</div>
            </div>
          ))}</>
        )}
      </Screen>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VISTA: HISTORIAL
  // ══════════════════════════════════════════════════════════════════════════
  if(view==="historial")return(
    <Screen title="Historial" onBack={()=>setView("inicio")}
      action={<ExportBtn label="📥 Todo" onClick={()=>exportExcel(gastos,ventas,recolecciones,null)}/>}>
      {months.length===0?<Empty>Sin registros</Empty>:months.map(mk=>(
        <button key={mk} onClick={()=>{setSelMonth(mk);setView("detalle");}} style={S.monthCard}>
          <div>
            <div style={{fontWeight:800,fontSize:16,color:GRIS_DARK}}>{monthLabel(mk)}</div>
            <div style={{fontSize:12,color:GRIS_TEXT,marginTop:3}}>{gMes(mk).length} gastos</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontWeight:900,fontSize:20,color:ROSA}}>{fmtMXN(totG(mk))}</div>
            <div style={{fontSize:11,color:"#CCC",marginTop:2}}>ver →</div>
          </div>
        </button>
      ))}
    </Screen>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // VISTA: DETALLE MES
  // ══════════════════════════════════════════════════════════════════════════
  if(view==="detalle"&&selMonth){
    const mk=selMonth,tg=totG(mk),cats=porCat(mk);
    const lista=gMes(mk).sort((a,b)=>b.fecha.localeCompare(a.fecha));
    return(
      <Screen title={monthLabel(mk)} onBack={()=>setView("historial")}
        action={<ExportBtn onClick={()=>exportExcel(gastos,ventas,recolecciones,mk)}/>}>
        <div style={S.heroCard}>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.7)",marginBottom:4}}>Total del mes</div>
          <div style={{fontSize:40,fontWeight:900,letterSpacing:-1.5}}>{fmtMXN(tg)}</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.65)",marginTop:4}}>{lista.length} registros</div>
        </div>
        <ST>Por categoría</ST>
        {CATS.filter(c=>cats[c.id]).sort((a,b)=>(cats[b.id]||0)-(cats[a.id]||0)).map(c=>{
          const pct=tg?Math.round((cats[c.id]/tg)*100):0;
          return(
            <div key={c.id} style={S.catRow}>
              <div style={{...S.catEmoji,background:c.color+"22",color:c.color}}>{c.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:13}}>{c.label}</div>
                <div style={{height:4,background:"#F0F0F0",borderRadius:2,marginTop:5,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:c.color,borderRadius:2}}/>
                </div>
                <div style={{fontSize:10,color:GRIS_TEXT,marginTop:2}}>{pct}%</div>
              </div>
              <div style={{fontWeight:800,color:c.color,fontSize:14,marginLeft:12}}>{fmtMXN(cats[c.id])}</div>
            </div>
          );
        })}
        <ST>Todos los gastos</ST>
        {lista.map(g=><GastoRow key={g.id} g={g} onDelete={deleteGasto} onEdit={startEdit} inusual={esInusual(g.cat,g.monto)}/>)}
      </Screen>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VISTA: ANALÍTICA / TENDENCIAS
  // ══════════════════════════════════════════════════════════════════════════
  if(view==="analitica"){
    // Últimos 6 meses
    const ultimos6=[];
    for(let i=5;i>=0;i--){const d=new Date();d.setMonth(d.getMonth()-i);ultimos6.push(monthKey(d.toISOString()));}
    const dataBarras=ultimos6.map(mk=>({
      mes:monthLabel(mk).slice(0,3),
      gastos:totG(mk),
      ventas:ventas.filter(v=>monthKey(v.fecha)===mk).reduce((s,v)=>s+(v.efectivo||0),0),
      recolectado:recolecciones.filter(r=>monthKey(r.fecha_recoleccion)===mk).reduce((s,r)=>s+(r.monto_total||0),0),
    }));
    const maxVal=Math.max(...dataBarras.flatMap(d=>[d.gastos,d.ventas]),1);
    const mk=currentMK;
    const tvM=ventas.filter(v=>monthKey(v.fecha)===mk).reduce((s,v)=>s+(v.efectivo||0),0);
    const tgM=totG(mk);
    const balance=tvM-tgM;
    // Dias de venta ultimos 30 dias
    const ventasOrdenadas=[...ventas].sort((a,b)=>a.fecha.localeCompare(b.fecha)).slice(-30);
    const promedioVenta=ventasOrdenadas.length?ventasOrdenadas.reduce((s,v)=>s+(v.efectivo||0),0)/ventasOrdenadas.length:0;
    // Top 3 proveedores por gasto total
    const gastosPorConcepto={};
    gastos.forEach(g=>{if(!gastosPorConcepto[g.concepto])gastosPorConcepto[g.concepto]=0;gastosPorConcepto[g.concepto]+=g.monto;});
    const topProveedores=Object.entries(gastosPorConcepto).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const totalGastosTodo=gastos.reduce((s,g)=>s+g.monto,0);
    // Días de semana con más ventas
    const ventasPorDia={};
    const diasNombres=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
    ventas.forEach(v=>{const d=new Date(v.fecha+"T12:00:00").getDay();if(!ventasPorDia[d])ventasPorDia[d]={total:0,count:0};ventasPorDia[d].total+=(v.efectivo||0);ventasPorDia[d].count++;});
    const avgPorDia=diasNombres.map((_,i)=>ventasPorDia[i]?ventasPorDia[i].total/ventasPorDia[i].count:0);
    const maxAvgDia=Math.max(...avgPorDia,1);

    return(
      <Screen title="Tendencias 📉" onBack={()=>setView("inicio")} action={<ExportBtn onClick={()=>exportExcel(gastos,ventas,recolecciones,null)} label="📥 Excel"/>}>

        {/* KPIs del mes */}
        <ST>📅 Este mes — {monthLabel(mk)}</ST>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
          {[
            {label:"💵 Ventas",val:tvM,color:VERDE},
            {label:"🛒 Gastos",val:tgM,color:ROSA},
            {label:`${balance>=0?"✅":"🔴"} Balance`,val:balance,color:balance>=0?VERDE:"#E53935"},
            {label:"📊 Prom/día",val:promedioVenta,color:AZUL},
          ].map(k=>(
            <div key={k.label} style={{background:BLANCO,borderRadius:14,padding:"14px 12px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",borderTop:`3px solid ${k.color}`}}>
              <div style={{fontSize:10,color:k.color,fontWeight:800,marginBottom:6}}>{k.label}</div>
              <div style={{fontSize:19,fontWeight:900,color:k.color}}>{fmtMXN(k.val)}</div>
            </div>
          ))}
        </div>

        {/* Gráfica de barras: Ventas vs Gastos últimos 6 meses */}
        <ST>📊 Ventas vs Gastos — últimos 6 meses</ST>
        <div style={{background:BLANCO,borderRadius:16,padding:"16px 12px 12px",marginBottom:16,boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
          <div style={{display:"flex",gap:12,marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:VERDE,fontWeight:700}}><div style={{width:10,height:10,borderRadius:2,background:VERDE}}/> Ventas</div>
            <div style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:ROSA,fontWeight:700}}><div style={{width:10,height:10,borderRadius:2,background:ROSA}}/> Gastos</div>
          </div>
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:120}}>
            {dataBarras.map((d,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <div style={{width:"100%",display:"flex",gap:2,alignItems:"flex-end",height:100}}>
                  <div style={{flex:1,background:VERDE,borderRadius:"3px 3px 0 0",height:`${maxVal?Math.round((d.ventas/maxVal)*100):0}%`,minHeight:d.ventas>0?3:0,transition:"height 0.5s"}}/>
                  <div style={{flex:1,background:ROSA,borderRadius:"3px 3px 0 0",height:`${maxVal?Math.round((d.gastos/maxVal)*100):0}%`,minHeight:d.gastos>0?3:0,transition:"height 0.5s"}}/>
                </div>
                <div style={{fontSize:9,color:GRIS_TEXT,fontWeight:700,marginTop:2}}>{d.mes}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:8,paddingTop:8,borderTop:"1px solid #F5F5F5"}}>
            {dataBarras.map((d,i)=>(
              <div key={i} style={{flex:1,textAlign:"center"}}>
                <div style={{fontSize:8,color:d.ventas>=d.gastos?VERDE:"#E53935",fontWeight:800}}>
                  {d.ventas||d.gastos?`${d.ventas>=d.gastos?"+":"-"}${fmtMXN(Math.abs(d.ventas-d.gastos)).replace("$","").replace(",","k").slice(0,4)}`:"—"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promedio de venta por día de semana */}
        <ST>📅 ¿Qué días se vende más?</ST>
        <div style={{background:BLANCO,borderRadius:16,padding:"16px 12px 12px",marginBottom:16,boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
          <div style={{display:"flex",alignItems:"flex-end",gap:4,height:80}}>
            {diasNombres.map((dia,i)=>{
              const pct=maxAvgDia?Math.round((avgPorDia[i]/maxAvgDia)*100):0;
              const esMejor=avgPorDia[i]===Math.max(...avgPorDia);
              return(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{width:"100%",background:esMejor?VERDE:GRIS_LIGHT,borderRadius:"4px 4px 0 0",height:`${pct}%`,minHeight:avgPorDia[i]>0?4:0,transition:"height 0.5s"}}/>
                  <div style={{fontSize:9,fontWeight:esMejor?900:600,color:esMejor?VERDE:GRIS_TEXT}}>{dia}</div>
                </div>
              );
            })}
          </div>
          <div style={{fontSize:11,color:GRIS_TEXT,marginTop:10,textAlign:"center"}}>
            Promedio de venta efectivo por día de la semana
          </div>
        </div>

        {/* Top proveedores */}
        <ST>🏆 Top proveedores / gastos acumulados</ST>
        <div style={{background:BLANCO,borderRadius:16,padding:"14px",marginBottom:16,boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
          {topProveedores.length===0?<Empty>Sin datos</Empty>:topProveedores.map(([nombre,monto],i)=>{
            const pct=totalGastosTodo?Math.round((monto/totalGastosTodo)*100):0;
            const colores=[ROSA,AMBAR,AZUL,VERDE,"#6A1B9A"];
            return(
              <div key={nombre} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <div style={{fontSize:13,fontWeight:700,color:GRIS_DARK}}>{i+1}. {nombre}</div>
                  <div style={{fontSize:13,fontWeight:900,color:colores[i]}}>{fmtMXN(monto)}</div>
                </div>
                <div style={{height:6,background:"#F0F0F0",borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:colores[i],borderRadius:3,transition:"width 0.5s"}}/>
                </div>
                <div style={{fontSize:10,color:GRIS_TEXT,marginTop:2}}>{pct}% del total</div>
              </div>
            );
          })}
        </div>

        {/* Gráfica de categorías acumuladas (todo el tiempo) */}
        <ST>🍰 Distribución de gastos por categoría</ST>
        <div style={{background:BLANCO,borderRadius:16,padding:"14px",marginBottom:16,boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
          {CATS.filter(c=>{const tot=gastos.filter(g=>g.cat===c.id).reduce((s,g)=>s+g.monto,0);return tot>0;}).sort((a,b)=>{
            const ta=gastos.filter(g=>g.cat===a.id).reduce((s,g)=>s+g.monto,0);
            const tb=gastos.filter(g=>g.cat===b.id).reduce((s,g)=>s+g.monto,0);
            return tb-ta;
          }).map(c=>{
            const tot=gastos.filter(g=>g.cat===c.id).reduce((s,g)=>s+g.monto,0);
            const pct=totalGastosTodo?Math.round((tot/totalGastosTodo)*100):0;
            return(
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{width:32,height:32,borderRadius:8,background:c.color+"22",color:c.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{c.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:12,fontWeight:700}}>{c.label}</span>
                    <span style={{fontSize:12,fontWeight:900,color:c.color}}>{fmtMXN(tot)}</span>
                  </div>
                  <div style={{height:5,background:"#F0F0F0",borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:c.color,borderRadius:3}}/>
                  </div>
                </div>
                <div style={{fontSize:11,fontWeight:700,color:GRIS_TEXT,width:28,textAlign:"right"}}>{pct}%</div>
              </div>
            );
          })}
        </div>

        {/* Reporte para inversores */}
        <ST>📋 Resumen ejecutivo (inversores)</ST>
        <div style={{background:BLANCO,borderRadius:16,padding:"18px",marginBottom:16,boxShadow:"0 2px 10px rgba(0,0,0,0.06)",border:`1.5px solid ${ROSA}22`}}>
          <div style={{fontSize:14,fontWeight:900,color:GRIS_DARK,marginBottom:12}}>Lady Fresa · {monthLabel(mk)}</div>
          {[
            {label:"Ventas efectivo",val:fmtMXN(tvM),color:VERDE},
            {label:"Total gastos operativos",val:fmtMXN(tgM),color:ROSA},
            {label:"Balance neto",val:fmtMXN(balance),color:balance>=0?VERDE:"#E53935"},
            {label:"Margen bruto",val:tvM>0?`${Math.round(((tvM-tgM)/tvM)*100)}%`:"—",color:balance>=0?VERDE:"#E53935"},
            {label:"Efectivo pendiente recolección",val:fmtMXN(montoPendiente),color:AMBAR},
            {label:"Créditos por pagar",val:fmtMXN(creditosPendientes.reduce((s,g)=>s+g.monto,0)),color:creditosPendientes.length>0?AMBAR:VERDE},
            {label:"Días con venta registrada",val:`${ventas.filter(v=>monthKey(v.fecha)===mk).length} días`,color:AZUL},
            {label:"Ticket promedio diario",val:fmtMXN(promedioVenta),color:AZUL},
          ].map(r=>(
            <div key={r.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #F5F5F5"}}>
              <span style={{fontSize:12,color:GRIS_MED}}>{r.label}</span>
              <span style={{fontSize:13,fontWeight:900,color:r.color}}>{r.val}</span>
            </div>
          ))}
          <div style={{marginTop:12,padding:"10px 12px",background:ROSA_BG,borderRadius:10,fontSize:11,color:GRIS_MED,lineHeight:1.5}}>
            💡 Exporta el Excel para el detalle completo de gastos, ventas y recolecciones con desglose por categoría.
          </div>
        </div>

      </Screen>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VISTA: INICIO
  // ══════════════════════════════════════════════════════════════════════════
  return(
    <div style={S.root}>
      <div style={S.header}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:30}}>🍓</span>
          <div>
            <div style={S.headerTitle}>Lady Fresa</div>
            <div style={S.headerSub}>Control de gastos</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {(creditosPendientes.length>0)&&(
            <button onClick={()=>setView("creditos")}
              style={{background:vencidos.length>0?"#FFEBEE":AMBAR_BG,border:`1px solid ${vencidos.length>0?"#EF9A9A":"#FFE082"}`,borderRadius:10,padding:"5px 10px",fontSize:12,fontWeight:700,color:vencidos.length>0?"#E53935":AMBAR,cursor:"pointer"}}>
              ⏳ {creditosPendientes.length}
            </button>
          )}
          <div style={{width:8,height:8,borderRadius:"50%",background:VERDE,boxShadow:"0 0 0 3px #A5D6A7"}}/>
        </div>
      </div>

      <div style={S.hero}>
        <div style={S.heroDate}>{new Date().toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long"})}</div>
        <div style={S.heroAmount}>{fmtMXN(todayTG)}</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.65)",marginTop:4}}>
          {todayG.length} gasto{todayG.length!==1?"s":""} hoy{todayV?` · venta ${fmtMXN(todayV.efectivo)}`:""}
        </div>
        <div style={S.heroStats}>
          <div style={S.heroStat}><div style={S.heroStatNum}>{fmtMXN(totG(currentMK))}</div><div style={S.heroStatLabel}>gastos mes</div></div>
          <div style={{width:1,background:"rgba(255,255,255,0.2)"}}/>
          <div style={S.heroStat}><div style={{...S.heroStatNum,color:montoPendiente>0?"#FFE082":"#A5F3A5"}}>{fmtMXN(montoPendiente)}</div><div style={S.heroStatLabel}>por recolectar</div></div>
          <div style={{width:1,background:"rgba(255,255,255,0.2)"}}/>
          <div style={S.heroStat}><div style={{...S.heroStatNum,color:creditosPendientes.length>0?"#FFE082":"#A5F3A5"}}>{creditosPendientes.length}</div><div style={S.heroStatLabel}>créditos</div></div>
        </div>
      </div>

      <div style={{padding:"0 16px 8px",display:"flex",flexDirection:"column",gap:10}}>
        <button onClick={()=>setView("nuevo")} style={S.fabBig}>
          <span style={{fontSize:24}}>+</span>
          <span style={{fontSize:16,fontWeight:800}}>Registrar Gasto</span>
        </button>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>setView("ventas")} style={{...S.fabMini,background:`linear-gradient(135deg,${VERDE},#1B5E20)`,boxShadow:"0 6px 18px rgba(46,125,50,0.3)"}}>
            <span style={{fontSize:20}}>💵</span><span style={{fontSize:13,fontWeight:800}}>Venta del día</span>
          </button>
          <button onClick={()=>setView("recoleccion")} style={{...S.fabMini,background:`linear-gradient(135deg,${AZUL},#0D47A1)`,boxShadow:"0 6px 18px rgba(21,101,192,0.3)"}}>
            <span style={{fontSize:20}}>💰</span>
            <span style={{fontSize:13,fontWeight:800}}>Recolectar{montoPendiente>0?` (${diasPendientes.length})`:""}</span>
          </button>
        </div>
      </div>

      {todayG.length>0&&(
        <div style={{padding:"0 16px"}}>
          <ST>Hoy</ST>
          {todayG.slice(0,4).map(g=><GastoRow key={g.id} g={g} onDelete={deleteGasto} onEdit={startEdit} inusual={esInusual(g.cat,g.monto)}/>)}
        </div>
      )}

      <nav style={S.bottomNav}>
        <NavBtn icon="📊" label="Resumen"   onClick={()=>setView("resumen")}/>
        <NavBtn icon="📈" label="Dashboard" onClick={()=>setView("dashboard")}/>
        <NavBtn icon="📉" label="Tendencias" onClick={()=>setView("analitica")}/>
        <NavBtn icon="📅" label="Historial" onClick={()=>setView("historial")}/>
      </nav>
    </div>
  );
}

// ── SUBCOMPONENTES ────────────────────────────────────────────────────────────
function Screen({title,onBack,action,children}){
  return(
    <div style={{...S.root,paddingBottom:40}}>
      <div style={S.screenHeader}>
        <button onClick={onBack} style={S.backBtn}>‹</button>
        <div style={S.screenTitle}>{title}</div>
        <div>{action||<div style={{width:36}}/>}</div>
      </div>
      <div style={{padding:"12px 16px 40px"}}>{children}</div>
    </div>
  );
}

function GastoRow({g,onDelete,onEdit,inusual}){
  const cat=CATS.find(c=>c.id===g.cat)||CATS[10];
  const[confirm,setConfirm]=useState(false);
  const[showFoto,setShowFoto]=useState(false);
  const isPendiente=g.tipo_pago==="credito"&&!g.pagado;
  const isVencido=isPendiente&&g.fecha_vencimiento&&g.fecha_vencimiento<new Date().toISOString().slice(0,10);
  return(
    <div style={{...S.card,border:isVencido?"1.5px solid #EF9A9A":inusual?`1.5px solid ${AMBAR}`:"1.5px solid transparent",marginBottom:8}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
        <div style={{...S.catEmoji,background:cat.color+"22",color:cat.color,flexShrink:0}}>{cat.emoji}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
            <span style={{fontWeight:700,fontSize:14}}>{g.concepto}</span>
            {inusual&&<span style={{fontSize:10,background:AMBAR_BG,color:AMBAR,borderRadius:6,padding:"1px 6px",fontWeight:700}}>⚠️ alto</span>}
            {isPendiente&&<span style={{fontSize:10,background:isVencido?"#FFEBEE":AMBAR_BG,color:isVencido?"#E53935":AMBAR,borderRadius:6,padding:"1px 6px",fontWeight:700}}>{isVencido?"🔴 vencido":"⏳ crédito"}</span>}
            {g.pagado&&g.tipo_pago==="credito"&&<span style={{fontSize:10,background:VERDE_BG,color:VERDE,borderRadius:6,padding:"1px 6px",fontWeight:700}}>✓ pagado</span>}
          </div>
          <div style={{fontSize:11,color:GRIS_TEXT,marginTop:2}}>{g.fecha} · {g.forma}{g.quien?` · ${g.quien}`:""}</div>
          {g.fecha_vencimiento&&isPendiente&&<div style={{fontSize:11,color:isVencido?"#E53935":AMBAR,fontWeight:600,marginTop:2}}>Vence: {g.fecha_vencimiento}</div>}
          {g.nota&&<div style={{fontSize:11,color:"#C0C0C0",fontStyle:"italic"}}>{g.nota}</div>}
          {g.foto&&<button onClick={()=>setShowFoto(!showFoto)} style={{fontSize:11,color:ROSA,background:"none",border:"none",cursor:"pointer",padding:0,marginTop:2}}>{showFoto?"▲ ocultar":"📷 ver ticket"}</button>}
          {g.foto&&showFoto&&<img src={g.foto} alt="ticket" style={{width:"100%",borderRadius:8,marginTop:6,objectFit:"cover",maxHeight:140}}/>}
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,marginLeft:4}}>
          <div style={{fontWeight:900,color:cat.color,fontSize:15}}>{fmtMXN(g.monto)}</div>
          <div style={{display:"flex",gap:4}}>
            <button onClick={()=>onEdit&&onEdit(g)} style={{fontSize:12,color:AZUL,background:"none",border:"none",cursor:"pointer"}}>✏️</button>
            {confirm
              ?<button onClick={()=>{onDelete(g.id);setConfirm(false);}} style={{fontSize:10,color:"#FFF",background:"#E53935",border:"none",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontWeight:700}}>¿Borrar?</button>
              :<button onClick={()=>setConfirm(true)} style={{fontSize:12,color:"#CCC",background:"none",border:"none",cursor:"pointer"}}>🗑</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function ExportBtn({onClick,label="📥 Excel"}){
  return<button onClick={onClick} style={{display:"flex",alignItems:"center",gap:4,background:VERDE_BG,color:VERDE,border:"1.5px solid #A5D6A7",borderRadius:10,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}>{label}</button>;
}
function Chip({children,active,color,onClick}){
  return<button onClick={onClick} style={{padding:"8px 14px",borderRadius:20,border:"none",background:active?color:"#F0F0F0",color:active?"#FFF":"#555",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{children}</button>;
}
function FL({children}){return<div style={{fontSize:11,fontWeight:800,color:GRIS_TEXT,marginTop:18,marginBottom:6,textTransform:"uppercase",letterSpacing:0.6}}>{children}</div>;}
function ST({children}){return<div style={{fontSize:12,fontWeight:800,color:GRIS_MED,margin:"20px 0 10px",textTransform:"uppercase",letterSpacing:0.8}}>{children}</div>;}
function Empty({children}){return<div style={{textAlign:"center",color:"#CCC",fontSize:15,padding:"40px 0"}}>{children}</div>;}
function NavBtn({icon,label,onClick}){
  return<button onClick={onClick} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 0 16px",background:"none",border:"none",cursor:"pointer",color:GRIS_MED}}>
    <span style={{fontSize:24}}>{icon}</span><span style={{fontSize:10,marginTop:2,fontWeight:600}}>{label}</span>
  </button>;
}

const S={
  root:{maxWidth:430,margin:"0 auto",minHeight:"100vh",background:ROSA_BG,fontFamily:"'Helvetica Neue',Helvetica,sans-serif",paddingBottom:90},
  header:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 18px 10px",background:BLANCO},
  headerTitle:{fontSize:20,fontWeight:900,color:GRIS_DARK,letterSpacing:-0.5},
  headerSub:{fontSize:11,color:GRIS_TEXT},
  hero:{margin:"0 0 16px",background:`linear-gradient(140deg,${ROSA} 0%,${ROSA_DARK} 100%)`,padding:"24px 20px 20px",color:BLANCO},
  heroDate:{fontSize:13,color:"rgba(255,255,255,0.7)",marginBottom:8,textTransform:"capitalize"},
  heroAmount:{fontSize:44,fontWeight:900,letterSpacing:-2,lineHeight:1},
  heroStats:{display:"flex",alignItems:"center",marginTop:20,background:"rgba(0,0,0,0.12)",borderRadius:14,padding:"12px 16px",gap:8},
  heroStat:{flex:1,textAlign:"center"},
  heroStatNum:{fontSize:15,fontWeight:900},
  heroStatLabel:{fontSize:9,color:"rgba(255,255,255,0.6)",marginTop:2},
  heroCard:{background:`linear-gradient(135deg,${ROSA},${ROSA_DARK})`,borderRadius:18,padding:"22px 20px",color:BLANCO,marginBottom:20,boxShadow:"0 8px 28px rgba(232,23,93,0.22)"},
  fabBig:{display:"flex",alignItems:"center",justifyContent:"center",gap:10,width:"100%",padding:"18px 0",color:BLANCO,border:"none",borderRadius:18,cursor:"pointer",background:`linear-gradient(135deg,${ROSA},${ROSA_DARK})`,boxShadow:"0 8px 24px rgba(232,23,93,0.35)",fontSize:16,fontWeight:700,fontFamily:"inherit"},
  fabMini:{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"14px 0",color:BLANCO,border:"none",borderRadius:16,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit"},
  bottomNav:{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:BLANCO,borderTop:"1px solid #F0F0F0",display:"flex",boxShadow:"0 -4px 20px rgba(0,0,0,0.07)",zIndex:100},
  screenHeader:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px 12px",background:BLANCO,borderBottom:"1px solid #F0F0F0",position:"sticky",top:0,zIndex:10},
  screenTitle:{fontWeight:800,fontSize:16,color:GRIS_DARK},
  backBtn:{width:36,height:36,borderRadius:10,background:GRIS_LIGHT,border:"none",cursor:"pointer",fontSize:24,color:GRIS_MED,display:"flex",alignItems:"center",justifyContent:"center"},
  catGrid:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:4},
  catBtn:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"10px 4px",borderRadius:13,cursor:"pointer",minHeight:72,transition:"all 0.15s ease",fontFamily:"inherit"},
  chipRow:{display:"flex",flexWrap:"wrap",gap:8},
  input:{width:"100%",padding:"13px 14px",border:"1.5px solid #E8E8E8",borderRadius:13,fontSize:15,color:GRIS_DARK,background:BLANCO,outline:"none",boxSizing:"border-box",fontFamily:"inherit"},
  btnPri:{width:"100%",padding:"17px 0",color:BLANCO,border:"none",borderRadius:16,cursor:"pointer",fontSize:16,fontWeight:800,marginTop:24,fontFamily:"inherit",boxShadow:"0 6px 20px rgba(232,23,93,0.28)",transition:"background 0.3s"},
  btnSec:{width:"100%",padding:"13px 0",color:GRIS_MED,border:"1.5px solid #E0E0E0",borderRadius:13,cursor:"pointer",fontSize:14,fontWeight:700,background:GRIS_LIGHT,fontFamily:"inherit"},
  card:{background:BLANCO,borderRadius:14,padding:"12px 14px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"},
  catRow:{display:"flex",alignItems:"center",gap:12,background:BLANCO,borderRadius:14,padding:"12px 14px",marginBottom:8,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"},
  catEmoji:{width:42,height:42,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20},
  personaRow:{display:"flex",alignItems:"center",gap:12,background:BLANCO,borderRadius:14,padding:"12px 14px",marginBottom:8,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"},
  personaAvatar:{width:38,height:38,borderRadius:"50%",background:`${ROSA}22`,color:ROSA,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16,flexShrink:0},
  monthCard:{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",background:BLANCO,border:"none",borderRadius:16,padding:"18px 18px",marginBottom:10,cursor:"pointer",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",textAlign:"left",fontFamily:"inherit"},
  dashCard:{background:BLANCO,borderRadius:14,padding:"14px 12px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"},
  actionBtn:{padding:"11px 0",borderRadius:12,border:"1.5px solid",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit",textAlign:"center"},
  alertaBanner:{background:AMBAR_BG,color:AMBAR,borderRadius:10,padding:"10px 14px",fontSize:13,fontWeight:700,border:`1px solid ${AMBAR}`},
  errorBanner:{background:"#FFEBEE",color:"#C62828",borderRadius:10,padding:"10px 14px",fontSize:13,fontWeight:700,marginTop:8,border:"1px solid #EF9A9A"},
  infoBox:{background:AZUL_BG,color:AZUL,borderRadius:10,padding:"10px 14px",fontSize:13,fontWeight:600},
};

// ── EDITABLE VENTAS EN CUADRE ─────────────────────────────────────────────────
function EditableVentasDias({diasPendientes,ventas,rForm,setRForm,setSelVentaDia,setView,onVentaUpdated}){
  const[editando,setEditando]=useState(null); // fecha
  const[nuevoMonto,setNuevoMonto]=useState("");
  const[nuevoQuien,setNuevoQuien]=useState("");
  const[saving,setSaving]=useState(false);
  const[savedFecha,setSavedFecha]=useState(null);

  const guardarEdicion=async(fecha)=>{
    if(!nuevoMonto)return;
    setSaving(true);
    const{data:existing}=await sb.from("ventas").select("id").eq("fecha",fecha).limit(1);
    if(existing&&existing.length>0){
      await sb.from("ventas").update({efectivo:parseFloat(nuevoMonto),quien:nuevoQuien||undefined}).eq("id",existing[0].id);
    } else {
      await sb.from("ventas").insert([{fecha,efectivo:parseFloat(nuevoMonto),quien:nuevoQuien}]);
    }
    await onVentaUpdated();
    setSaving(false);
    setSavedFecha(fecha);
    setEditando(null);
    setNuevoMonto("");
    setNuevoQuien("");
    setTimeout(()=>setSavedFecha(null),2000);
  };

  return(
    <>
      {diasPendientes.map(fecha=>{
        const v=ventas.find(v=>v.fecha===fecha);
        const sel=rForm.selDias.includes(fecha);
        const isEditing=editando===fecha;
        const wasSaved=savedFecha===fecha;
        return(
          <div key={fecha} style={{borderRadius:14,border:`2px solid ${wasSaved?"#A5D6A7":isEditing?AZUL:sel?VERDE:"#E0E0E0"}`,
            background:wasSaved?VERDE_BG:isEditing?AZUL_BG:sel?VERDE_BG:BLANCO,
            padding:"12px 14px",marginBottom:8,transition:"all 0.2s"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>!isEditing&&setRForm(f=>({...f,selDias:sel?f.selDias.filter(d=>d!==fecha):[...f.selDias,fecha]}))}
                style={{flex:1,background:"none",border:"none",cursor:"pointer",textAlign:"left",fontFamily:"inherit",padding:0}}>
                <div style={{fontWeight:700,fontSize:14,color:wasSaved?VERDE:isEditing?AZUL:sel?VERDE:GRIS_DARK}}>
                  {wasSaved?"✅ ":""}{fecha}
                </div>
                <div style={{fontSize:11,color:GRIS_TEXT,marginTop:2}}>
                  {v?`Registró: ${v.quien||"—"} · `:"Sin registro · "}
                  <strong style={{color:v?VERDE:"#E53935"}}>{v?fmtMXN(v.efectivo):"$0"}</strong>
                </div>
              </button>
              <button onClick={()=>{
                if(isEditing){setEditando(null);setNuevoMonto("");setNuevoQuien("");}
                else{setEditando(fecha);setNuevoMonto(v?.efectivo?String(v.efectivo):"");setNuevoQuien(v?.quien||"");}
              }} style={{background:isEditing?"#FFEBEE":GRIS_LIGHT,border:"none",borderRadius:8,
                padding:"6px 10px",cursor:"pointer",fontSize:12,
                color:isEditing?"#E53935":AZUL,fontWeight:700}}>
                {isEditing?"✕ Cancelar":"✏️ Editar"}
              </button>
            </div>

            {isEditing&&(
              <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid #E8E8E8"}}>
                <div style={{fontSize:10,fontWeight:800,color:AZUL,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>
                  Corregir monto del {fecha}
                </div>
                <div style={{position:"relative",marginBottom:8}}>
                  <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:18,fontWeight:900,color:VERDE}}>$</span>
                  <input type="number" inputMode="decimal" autoFocus
                    style={{width:"100%",paddingLeft:28,padding:"11px 14px 11px 28px",border:`2px solid ${AZUL}`,
                      borderRadius:10,fontSize:22,fontWeight:900,color:VERDE,background:BLANCO,
                      outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}
                    placeholder="0" value={nuevoMonto}
                    onChange={e=>setNuevoMonto(e.target.value)}/>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
                  {EQUIPO.map(p=>(
                    <button key={p} onClick={()=>setNuevoQuien(p)}
                      style={{padding:"6px 12px",borderRadius:16,border:"none",
                        background:nuevoQuien===p?AZUL:"#F0F0F0",
                        color:nuevoQuien===p?BLANCO:"#555",
                        fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                      {p}
                    </button>
                  ))}
                </div>
                <button onClick={()=>guardarEdicion(fecha)} disabled={saving||!nuevoMonto}
                  style={{width:"100%",padding:"12px 0",color:BLANCO,border:"none",borderRadius:12,
                    cursor:"pointer",fontSize:14,fontWeight:800,fontFamily:"inherit",
                    background:saving?GRIS_MED:AZUL,opacity:!nuevoMonto?0.4:1}}>
                  {saving?"⏳ Guardando…":"💾 Guardar corrección"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

