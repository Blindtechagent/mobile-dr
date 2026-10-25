"use strict";
window.MobileDRUtils={
 esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));},
 money(v){return "₹"+Number(v||0).toLocaleString("en-IN");},
 uid(prefix="id"){return prefix+Date.now().toString(36)+Math.random().toString(36).slice(2,6);},
 today(){return new Date().toISOString().slice(0,10);},
 downloadJSON(data,name){const b=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;a.click();URL.revokeObjectURL(a.href);},
 readJSON(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{try{resolve(JSON.parse(r.result))}catch(e){reject(e)}};r.onerror=reject;r.readAsText(file)})}
};
