"use strict";
(function(){
const S=window.MobileDRStorage,U=window.MobileDRUtils,$=id=>document.getElementById(id);
const esc=U.esc,money=U.money,uid=U.uid,now=()=>new Date().toISOString();
const logged=()=>!!(window.MobileDRFirebase?.isOwner?.());
function guard(){if(!logged()){location.href="login.html";return false}return true}
async function logout(){try{await window.MobileDRFirebase?.currentUser?.()?.signOut?.()}finally{location.href="login.html"}}
function toast(t){const e=$("adminToast");if(e){e.textContent=t;e.hidden=false;setTimeout(()=>e.hidden=true,1800)}}
function empty(t){return `<div class="admin-empty">${esc(t)}</div>`}
function nav(){return `<a href="dashboard.html" class="drawer-link" data-page="dashboard"><span aria-hidden="true">⌂</span>डैशबोर्ड</a><a href="repairs.html" class="drawer-link" data-page="repairs"><span>🛠</span>रिपेयर</a><a href="products.html" class="drawer-link" data-page="products"><span>🛍</span>प्रोडक्ट्स</a><a href="offers.html" class="drawer-link" data-page="offers"><span>🎁</span>ऑफर्स</a><a href="../index.html" class="drawer-link"><span>↩</span>Customer App</a><button class="drawer-link" id="adminLogout" type="button"><span>🚪</span>Logout</button>`}
function shell(){return `<header class="app-header"><div class="header-left"><button class="icon-btn menu-btn" id="menuBtn" aria-label="Menu" aria-controls="sideDrawer" aria-expanded="false" type="button"><span></span><span></span><span></span></button><a href="dashboard.html" class="brand"><div class="brand-mark"><span>DR</span></div><div class="brand-text"><strong>MOBILE DR</strong><small>Admin</small></div></a></div><div class="header-actions"><button class="icon-btn" id="themeBtn" type="button" aria-label="Change theme"><span id="themeIcon">☾</span></button></div></header><div class="drawer-overlay" id="drawerOverlay"></div><aside class="side-drawer" id="sideDrawer" aria-hidden="true"><div class="drawer-header"><div class="drawer-brand"><div class="brand-mark"><span>DR</span></div><div><strong>MOBILE DR</strong><small>Admin</small></div></div><button class="drawer-close" id="drawerClose" type="button" aria-label="Close menu">×</button></div><nav class="drawer-nav"><p class="nav-section-title">ADMIN</p>${nav()}</nav></aside><div id="adminToast" hidden class="admin-toast"></div><main class="admin-page"><div class="admin-wrap" id="adminContent"></div></main>`}
function mount(content){document.body.innerHTML=shell();$("adminContent").innerHTML=content;$("adminLogout").onclick=logout;window.Navigation?.init?.();window.MobileDR?.initializeTheme?.()}
function head(title,sub){return `<section class="admin-head"><div><h1>${esc(title)}</h1><p>${esc(sub)}</p></div><button class="admin-btn red" id="logoutTop" type="button">Logout</button></section>`}
function finishHead(){const b=$("logoutTop");if(b)b.onclick=logout}
function login(){if(logged()){location.href="dashboard.html";return}document.body.innerHTML=`<main class="admin-login"><form class="admin-login-card" id="loginForm"><div class="brand" style="display:flex"><div class="brand-mark"><span>DR</span></div><div class="brand-text"><strong>MOBILE DR</strong><small>Staff</small></div></div><h1>Staff Login</h1><p>केवल अधिकृत staff email से प्रवेश करें।</p><div class="admin-field"><label>Email</label><input id="email" type="email" aria-label="Staff email" autocomplete="username" required></div><div class="admin-field"><label>Password</label><input id="password" type="password" aria-label="Staff password" autocomplete="current-password" required></div><button class="admin-btn" style="width:100%;margin-top:10px" type="submit">Login</button><div id="err" class="admin-danger-text"></div><a href="../index.html">← Customer App</a></form></main>`;$('loginForm').onsubmit=async e=>{e.preventDefault();try{await MobileDRFirebase.signInOwner($('email').value,$('password').value);location.href='dashboard.html'}catch(err){$('err').textContent=err?.message||'Login failed'}}}
function localData(){return{products:S.getProducts(),repairs:S.getRepairs(),offers:S.getOffers()}}
function statusLabel(v){return({received:"मरम्मत बाकी",progress:"मरम्मत चल रही है",ready:"मोबाइल तैयार",picked_up:"फोन ले लिया"}[v]||v||"—")}
function printRepairs(){const rows=S.getRepairs();if(window.MobileDRPrint?.repairs){window.MobileDRPrint.repairs(rows,statusLabel);return}window.print()}
function normalizeWhatsAppNumber(value){
 const raw=String(value||"").trim();
 let digits=raw.replace(/\D/g,"");
 if(digits.startsWith("00"))digits=digits.slice(2);
 if(digits.startsWith("0")&&digits.length===11)digits=digits.slice(1);
 if(digits.length===10)digits="91"+digits;
 return /^91\d{10}$/.test(digits)?digits:"";
}
function repairWhatsAppText(x){
 const issues=(x.issues||[]).join(", ")||x.description||"समस्या दर्ज नहीं";
 const status=statusLabel(x.status);
 return [
  "Mobile DR",
  "रिपेयर रसीद",
  "",
  `रसीद नंबर: ${x.receiptNo||"—"}`,
  `तारीख: ${x.submissionDate||((x.createdAt&&new Date(x.createdAt).toLocaleString("hi-IN"))||"—")}`,
  `ग्राहक: ${x.name||"—"}`,
  `मोबाइल: ${x.mobile||"—"}`,
  `मॉडल: ${x.model||"—"}`,
  `IMEI: ${x.imei||"—"}`,
  `समस्या: ${issues}`,
  `स्थिति: ${status}`,
  x.address?`पता: ${x.address}`:null,
  "",
  "कृपया Mobile DR से अपना मोबाइल प्राप्त करें।",
  "धन्यवाद।"
 ].filter(v=>v!==null).join("\n");
}
function shareRepairWhatsApp(x){
 const number=normalizeWhatsAppNumber(x.mobile);
 if(!number){alert("इस रिपेयर रिकॉर्ड में मान्य 10 अंकों का मोबाइल नंबर नहीं है।");return}
 const url=`https://wa.me/${number}?text=${encodeURIComponent(repairWhatsAppText(x))}`;
 const popup=window.open(url,"_blank");if(!popup)window.location.href=url;
}
function printRepairReceipt(x){
 const issue=(x.issues||[]).join(", ")||x.description||"समस्या दर्ज नहीं";
 if(window.MobileDRPrint?.receipt)window.MobileDRPrint.receipt(x,issue);else window.print();
}
async function dashboard(){if(!guard())return;const d=localData(),need=d.repairs.filter(x=>!['progress','ready','picked_up'].includes(x.status||'')),under=d.repairs.filter(x=>x.status==='progress'),repaired=d.repairs.filter(x=>x.status==='ready'),picked=d.repairs.filter(x=>x.status==='picked_up');mount(head("Dashboard","दुकान की स्थिति एक जगह देखें")+`<div class="admin-grid"><div class="admin-stat"><small>कुल रिपेयर</small><strong>${d.repairs.length}</strong></div><div class="admin-stat"><small>मरम्मत बाकी</small><strong>${need.length}</strong></div><div class="admin-stat"><small>मरम्मत चल रही है</small><strong>${under.length}</strong></div><div class="admin-stat"><small>मोबाइल तैयार</small><strong>${repaired.length}</strong></div><div class="admin-stat"><small>फोन ले लिया</small><strong>${picked.length}</strong></div></div><div class="admin-card"><h2>Quick View</h2><div class="admin-item"><strong>मरम्मत बाकी</strong><span>${need.length}</span></div><div class="admin-item"><strong>मरम्मत चल रही है</strong><span>${under.length}</span></div><div class="admin-item"><strong>मोबाइल तैयार</strong><span>${repaired.length}</span></div></div><div class="admin-card"><h2>Quick Actions</h2><div class="admin-actions"><a class="admin-btn" href="products.html">+ Product</a><a class="admin-btn" href="offers.html">+ Offer</a><a class="admin-btn" href="repairs.html">Repair List</a><button class="admin-btn gray" id="printAllRepairs" type="button">🖨 सभी रिपेयर प्रिंट / Save PDF</button></div><p class="admin-note">प्रिंट विकल्प में Print या Save as PDF चुनकर रसीद/PDF मोबाइल में सुरक्षित की जा सकती है। रिपेयर रिकॉर्ड तब तक सुरक्षित रहते हैं जब तक staff उन्हें मैन्युअल रूप से हटाए।</p></div>`);finishHead();$("printAllRepairs").onclick=printRepairs}
function products(){
if(!guard())return;
let productImages=[];
let imagesTouched=false;
const imageLimit=5;
const maxImageBytes=300*1024;
const imageFiles=()=>Array.from($("productImages")?.files||[]);
const existingImages=x=>Array.isArray(x?.images)&&x.images.length?x.images.slice(0,imageLimit):(x?.image?[x.image]:[]);
const compressImage=file=>new Promise((resolve,reject)=>{
 const reader=new FileReader();
 reader.onerror=()=>reject(new Error("IMAGE_READ_FAILED"));
 reader.onload=()=>{
  const img=new Image();
  img.onload=()=>{
   const max=1280,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
   const canvas=document.createElement("canvas");
   canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
   canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
   const ctx=canvas.getContext("2d");ctx.drawImage(img,0,0,canvas.width,canvas.height);
   let quality=.8,data=canvas.toDataURL("image/jpeg",quality);
   while(data.length*0.75>maxImageBytes&&quality>.35){quality-=.05;data=canvas.toDataURL("image/jpeg",quality)}
   if(data.length*0.75>maxImageBytes)reject(new Error("IMAGE_TOO_LARGE"));else resolve(data);
  };
  img.onerror=()=>reject(new Error("IMAGE_INVALID"));img.src=reader.result;
 };
 reader.readAsDataURL(file);
});
const renderImagePreview=()=>{
 const root=$("productImagePreview");if(!root)return;
 root.innerHTML=productImages.length?productImages.map((src,i)=>`<div class="product-image-item"><img src="${esc(src)}" alt="प्रोडक्ट फोटो ${i+1}"><button type="button" class="admin-btn red product-image-remove" data-index="${i}" aria-label="प्रोडक्ट फोटो ${i+1} हटाएं">हटाएं</button>${i===0?'<span class="product-image-primary">मुख्य फोटो</span>':""}</div>`).join(""):"<p class=\"admin-note\">अभी कोई फोटो नहीं चुनी गई है।</p>";
};
const formHtml=`<div class="admin-card"><form id="pf" class="admin-form"><input type="hidden" id="pid"><div class="admin-field"><label for="name">नाम *</label><input id="name" required></div><div class="admin-row"><div class="admin-field"><label for="cat">कैटेगरी</label><select id="cat"><option>Display</option><option>Battery</option><option>Charging</option><option>IC</option><option>Touch</option><option>Tools</option><option>Accessories</option><option>Other</option></select></div><div class="admin-field"><label for="brand">ब्रांड</label><input id="brand"></div></div><div class="admin-row"><div class="admin-field"><label for="price">कीमत *</label><input id="price" type="number" min="0" required></div><div class="admin-field"><label for="old">पुरानी कीमत</label><input id="old" type="number" min="0"></div></div><div class="admin-field"><label for="stock">स्टॉक</label><div class="stock-editor"><button type="button" class="admin-btn light qty" data-step="-1">−1</button><input id="stock" type="number" min="0" value="0"><button type="button" class="admin-btn light qty" data-step="1">+1</button></div></div><div class="admin-field"><label for="productImages">प्रोडक्ट की फोटो</label><input id="productImages" type="file" accept="image/*" multiple aria-describedby="productImageHelp"><p id="productImageHelp" class="admin-note">एक बार में अधिकतम 5 फोटो चुनें। फोटो अपने आप छोटा और compress होकर सेव होगी। पहली फोटो मुख्य फोटो होगी।</p><div id="productImagePreview" class="product-image-preview"></div></div><div class="admin-field"><label for="image">इमेज URL (वैकल्पिक)</label><input id="image" type="url" placeholder="यदि फोटो URL से दिखानी हो"></div><div class="admin-field"><label for="quality">Quality</label><input id="quality" placeholder="Original / OEM / Premium..."></div><div class="admin-field"><label for="warranty">Warranty</label><input id="warranty" placeholder="7 Days / 30 Days..."></div><div class="admin-field"><label for="models">Compatibility</label><input id="models"></div><div class="admin-field"><label for="desc">Description</label><textarea id="desc"></textarea></div><label class="check-line"><input id="featured" type="checkbox"> Featured</label><div class="admin-actions"><button class="admin-btn" type="submit">Save Product</button><button class="admin-btn light" type="button" id="clearProduct">Clear</button></div></form></div><div class="admin-card"><input id="productSearch" class="admin-search" aria-label="Search products" placeholder="Search products..."><div id="productList"></div></div>`;
mount(head("Products","प्रोडक्ट जोड़ें, बदलें और stock संभालें")+formHtml);finishHead();
const render=()=>{const q=$("productSearch").value.toLowerCase().trim(),rows=S.getProducts().filter(x=>JSON.stringify(x).toLowerCase().includes(q));$("productList").innerHTML=rows.length?rows.map(x=>`<div class="admin-item"><div class="admin-item-title"><strong>${esc(x.name)}</strong><span>${money(x.price)}</span></div><div class="admin-meta">${esc(x.brand||"")} · ${esc(x.category||"")} · Stock ${Number(x.stock||0)} · ${esc(x.warranty||"")} · ${Array.isArray(x.images)?x.images.length:(x.image?1:0)} फोटो</div><div class="admin-actions"><button class="admin-btn light edit" data-id="${esc(x.id)}">Edit</button><button class="admin-btn red del" data-id="${esc(x.id)}">Delete</button></div></div>`).join(""):empty("कोई product नहीं")};
$("productImages").addEventListener("change",async e=>{
 const files=imageFiles();
 if(!files.length)return;
 imagesTouched=true;
 if(productImages.length+files.length>imageLimit){alert(`अधिकतम ${imageLimit} फोटो रख सकते हैं।`);e.target.value="";return}
 for(const file of files){
  if(!file.type.startsWith("image/")){alert("कृपया केवल image files चुनें।");continue}
  try{productImages.push(await compressImage(file))}catch(err){alert(err.message==="IMAGE_TOO_LARGE"?"फोटो compress करने के बाद भी बहुत बड़ी है। दूसरी फोटो चुनें।":"फोटो पढ़ी नहीं जा सकी।");}
 }
 e.target.value="";renderImagePreview();
});
$("productImagePreview").addEventListener("click",e=>{const b=e.target.closest(".product-image-remove");if(!b)return;imagesTouched=true;productImages.splice(Number(b.dataset.index),1);renderImagePreview()});
$("pf").onsubmit=async e=>{e.preventDefault();const a=S.getProducts(),id=$("pid").value||uid("p"),url=$("image").value.trim(),images=productImages.length?productImages.slice():url?[url]:[],x={id,name:$("name").value.trim(),category:$("cat").value,brand:$("brand").value.trim(),price:Number($("price").value||0),oldPrice:Number($("old").value||0),stock:Math.max(0,Number($("stock").value||0)),image:images[0]||"",images,quality:$("quality").value.trim(),warranty:$("warranty").value.trim(),models:$("models").value.trim(),description:$("desc").value.trim(),featured:$("featured").checked,updatedAt:now()};const i=a.findIndex(p=>p.id===id);if(i>=0){x.createdAt=a[i].createdAt||now();if(!imagesTouched&&!url){const oldImages=existingImages(a[i]);x.images=oldImages;x.image=oldImages[0]||""}a[i]=x}else{ x.createdAt=now();a.unshift(x)}S.saveProducts(a);$("pf").reset();$("pid").value="";$("stock").value=0;productImages=[];imagesTouched=false;renderImagePreview();render();toast("Product saved")};
document.querySelectorAll(".qty").forEach(b=>b.onclick=()=>$("stock").value=Math.max(0,Number($("stock").value||0)+Number(b.dataset.step)));
$("clearProduct").onclick=()=>{$("pf").reset();$("pid").value="";$("stock").value=0;productImages=[];imagesTouched=false;renderImagePreview()};
$("productSearch").oninput=render;
document.addEventListener("click",function h(e){const b=e.target.closest(".edit,.del");if(!b)return;const a=S.getProducts(),x=a.find(p=>p.id===b.dataset.id);if(!x)return;if(b.classList.contains("del")){if(!confirm(`Delete product "${x.name||""}"?`))return;S.saveProducts(a.filter(p=>p.id!==x.id));render();toast("Product deleted");return}$("pid").value=x.id;$("name").value=x.name||"";$("cat").value=x.category||"Other";$("brand").value=x.brand||"";$("price").value=x.price||0;$("old").value=x.oldPrice||0;$("stock").value=x.stock||0;productImages=existingImages(x);imagesTouched=false;$("image").value=productImages.length&&productImages[0].startsWith("data:")?"":(x.image||"");$("quality").value=x.quality||"";$("warranty").value=x.warranty||"";$("models").value=x.models||"";$("desc").value=x.description||"";$("featured").checked=!!x.featured;renderImagePreview();window.scrollTo(0,0)},{once:false});renderImagePreview();render()}

function repairDetailRows(x){
const issues=Array.isArray(x.issues)?x.issues.join(", "):String(x.issues||"");
const date=v=>v?new Date(v).toLocaleString("hi-IN"):"—";
return `<div class="repair-details" id="details-${esc(x.id)}" hidden>
<div class="repair-detail-grid">
<div><small>रिपेयर ID</small><strong>${esc(x.id||"—")}</strong></div>
<div><small>रसीद नंबर</small><strong>${esc(x.receiptNo||"—")}</strong></div>
<div><small>स्थिति</small><strong>${esc(statusLabel(x.status))}</strong></div>
<div><small>जमा तारीख</small><strong>${esc(x.submissionDate||date(x.createdAt))}</strong></div>
<div><small>ग्राहक का नाम</small><strong>${esc(x.name||"—")}</strong></div>
<div><small>मोबाइल नंबर</small><strong>${esc(x.mobile||"—")}</strong></div>
<div class="full"><small>पता</small><strong>${esc(x.address||"—")}</strong></div>
<div><small>डिवाइस / मॉडल</small><strong>${esc(x.model||"—")}</strong></div>
<div><small>IMEI</small><strong>${esc(x.imei||"—")}</strong></div>
<div class="full"><small>समस्या</small><strong>${esc(issues||"—")}</strong></div>
<div class="full"><small>समस्या का विवरण</small><strong>${esc(x.description||"—")}</strong></div>
<div><small>बनाया गया</small><strong>${esc(x.createdBy==="staff"?"Staff":"Customer")}</strong></div>
<div><small>अंतिम अपडेट</small><strong>${esc(date(x.updatedAt))}</strong></div>
${x.readyAt?`<div><small>तैयार तारीख</small><strong>${esc(date(x.readyAt))}</strong></div>`:""}
</div>
<div class="admin-actions repair-detail-actions">
<select class="status" data-id="${esc(x.id)}" aria-label="Repair status for ${esc(x.name||"")}">
<option value="received" ${x.status==='received'?'selected':''}>मरम्मत बाकी</option>
<option value="progress" ${x.status==='progress'?'selected':''}>मरम्मत चल रही है</option>
<option value="ready" ${x.status==='ready'?'selected':''}>मोबाइल तैयार</option>
<option value="picked_up" ${x.status==='picked_up'?'selected':''}>फोन ले लिया</option>
</select>
<a class="admin-btn green" href="tel:${esc(String(x.mobile||"").replace(/[^0-9+]/g,""))}">कॉल</a>
<button class="admin-btn" type="button" data-whatsapp="${esc(x.id)}">WhatsApp Receipt</button>
<button class="admin-btn gray" type="button" data-print-one="${esc(x.id)}">रसीद प्रिंट / Save PDF</button>
${x.status==='picked_up'?`<button class="admin-btn red" type="button" data-delete-repair="${esc(x.id)}">रिपेयर एंट्री हटाएं</button>`:""}
</div>
</div>`}
function listPage(type){
if(!guard())return;
const cfg={repairs:["Repairs","जमा किए गए फोन और उनका repair status",()=>S.getRepairs()],offers:["Offers","ऑफर manage करें",()=>S.getOffers()]}[type];
mount(head(cfg[0],cfg[1])+`<div class="admin-card"><input id="search" class="admin-search" aria-label="Search" placeholder="Search..."><div id="content"></div></div>`);
finishHead();
const render=()=>{
let rows=cfg[2]().filter(x=>JSON.stringify(x).toLowerCase().includes($("search").value.toLowerCase().trim()));
if(type==="repairs"){
$("content").innerHTML=rows.length?rows.map(x=>`<article class="admin-item repair-card">
<div class="admin-item-title"><strong>${esc(x.name||"—")}</strong><strong>${esc(x.model||"—")}</strong></div>
<div class="admin-meta repair-summary-id">ID: ${esc(x.id||"—")}</div>
<button class="admin-btn light view-repair" type="button" data-id="${esc(x.id)}" aria-expanded="false" aria-controls="details-${esc(x.id)}">View Full Details</button>
${repairDetailRows(x)}
</article>`).join(""):empty("कोई repair नहीं");
}else{
$("content").innerHTML=`<form id="add" class="admin-form"><input id="n" placeholder="Offer title" required><textarea id="d" placeholder="Offer text"></textarea><input id="date" type="date"><button class="admin-btn">Add Offer</button></form><div class="admin-list">${rows.map(x=>`<div class="admin-item"><strong>${esc(x.title)}</strong><div class="admin-meta">${esc(x.text||"")} · ${esc(x.validUntil||"")}</div><button class="admin-btn red remove" data-id="${esc(x.id)}">Delete</button></div>`).join("")}</div>`
}
document.querySelectorAll(".view-repair").forEach(b=>b.onclick=()=>{const d=$(b.getAttribute("aria-controls"));if(!d)return;const open=d.hidden;b.setAttribute("aria-expanded",String(open));b.textContent=open?"Hide Full Details":"View Full Details";d.hidden=!open});
document.querySelectorAll("[data-whatsapp]").forEach(b=>b.onclick=()=>{const x=S.getRepairs().find(r=>r.id===b.dataset.whatsapp);if(x)shareRepairWhatsApp(x)});
document.querySelectorAll("[data-print-one]").forEach(b=>b.onclick=()=>{const x=S.getRepairs().find(r=>r.id===b.dataset.printOne);if(x)printRepairReceipt(x)});
document.querySelectorAll("[data-delete-repair]").forEach(b=>b.onclick=async()=>{const x=S.getRepairs().find(r=>r.id===b.dataset.deleteRepair);if(!x||x.status!=="picked_up")return;if(!confirm(`क्या आप ${x.name||"इस ग्राहक"} की रिपेयर एंट्री स्थायी रूप से हटाना चाहते हैं?`))return;b.disabled=true;try{await window.MobileDRFirebase?.deleteRepair?.(x.id);S.saveRepairs(S.getRepairs().filter(r=>r.id!==x.id));toast("रिपेयर एंट्री हटाई गई");render()}catch(err){console.error("Repair delete failed",err);b.disabled=false;toast("रिपेयर एंट्री हटाई नहीं जा सकी")}});
document.querySelectorAll(".status").forEach(e=>e.onchange=async()=>{const a=S.getRepairs(),x=a.find(r=>r.id===e.dataset.id);if(!x)return;x.status=e.value;x.updatedAt=now();if(e.value==="ready"&&!x.readyAt)x.readyAt=now();if(e.value!=="ready"&&e.value!=="picked_up")delete x.readyAt;S.saveRepairs(a);try{await window.MobileDRFirebase?.updateRepair?.(x.id,{status:x.status,readyAt:x.readyAt||null})}catch(err){console.error("Status cloud update failed",err)}toast("Status updated");render()});
document.querySelectorAll(".remove").forEach(b=>b.onclick=()=>{if(!confirm("Delete this offer?"))return;S.saveOffers(S.getOffers().filter(x=>x.id!==b.dataset.id));render();toast("Offer deleted")});
$("add")?.addEventListener("submit",e=>{e.preventDefault();const a=S.getOffers();a.unshift({id:uid("o"),title:$("n").value.trim(),text:$("d").value.trim(),validUntil:$("date").value,active:true,createdAt:now()});S.saveOffers(a);render()})
};
$("search").oninput=render;render();
if(type==="repairs"){
$("content").insertAdjacentHTML("beforebegin",`<div class="admin-actions repair-toolbar"><button class="admin-btn gray" id="printRepairs" type="button">🖨 सभी रिपेयर प्रिंट / Save PDF</button></div>`);
$("printRepairs").onclick=printRepairs;
if(window.MobileDRFirebase?.listenCollection)window.MobileDRFirebase.listenCollection("repairs",v=>{S.write(S.keys.repairs,v);render()})
}}
async function waitForAuth(){if(!window.MobileDRFirebase?.authEnabled?.())return null;return await new Promise(resolve=>{let done=false,unsub=null;const finish=u=>{if(done)return;done=true;unsub?.();resolve(u)};unsub=window.MobileDRFirebase.onAuthStateChanged(u=>finish(u));setTimeout(()=>finish(window.MobileDRFirebase.currentUser?.()||null),4000)})}
async function init(){const p=location.pathname.split("/").pop().replace(".html","");if(!window.MobileDRFirebase?.authEnabled?.()){location.href="login.html";return}const user=await waitForAuth();if(p==='login'){if(user&&window.MobileDRFirebase.isOwner?.()){location.href='dashboard.html';return}return login()}if(!user||!window.MobileDRFirebase.isOwner?.()){location.href="login.html";return}try{for(const k of Object.keys(S.keys)){const remote=await MobileDRFirebase.getCollection(k);S.write(S.keys[k],remote);MobileDRFirebase.listenCollection(k,v=>{S.write(S.keys[k],v);window.dispatchEvent(new CustomEvent("mobileDR:data",{detail:{collection:k}}))})}}catch(e){console.error("Cloud load failed",e)}if(p==='dashboard')dashboard();else if(p==='products')products();else if(['repairs','offers'].includes(p))listPage(p);else dashboard()}
window.MobileDRAdmin={init};document.addEventListener("DOMContentLoaded",init);
})();
