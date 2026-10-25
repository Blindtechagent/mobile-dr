"use strict";
const MobileDRRepairs={
 form:null,
 init(){this.form=document.getElementById("repairForm");if(!this.form)return;this.setDefault();this.form.addEventListener("input",()=>this.syncReceipt());this.form.addEventListener("change",()=>this.syncReceipt());this.form.addEventListener("submit",e=>{e.preventDefault();this.save()});document.getElementById("resetRepair")?.addEventListener("click",()=>{if(confirm(MobileDR.t("confirmReset","फॉर्म रीसेट करें?"))){this.form.reset();this.setDefault();this.syncReceipt()}});document.getElementById("printRepair")?.addEventListener("click",()=>{this.syncReceipt();const x=this.collect();const issue=x.issues.join(", ")||x.description||MobileDR.t("noIssue","समस्या दर्ज नहीं");if(window.MobileDRPrint?.receipt)window.MobileDRPrint.receipt(x,issue);else window.print()});},
 setDefault(){const r=document.getElementById("receiptNo");if(r&&!r.value)r.value=this.makeReceiptNo();this.syncReceipt()},
 makeReceiptNo(){const d=new Date();const pad=n=>String(n).padStart(2,"0");return `MDR-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}-${Math.random().toString(36).slice(2,5).toUpperCase()}`},
 checked(){return [...this.form.querySelectorAll('input[name="fault"]:checked')].map(x=>x.value)},
 val(id){return document.getElementById(id)?.value.trim()||""},
 collect(){return{id:MobileDRUtils.uid("r"),receiptNo:this.val("receiptNo"),submissionDate:MobileDRUtils.today(),name:this.val("customerName"),mobile:this.val("customerMobile"),address:this.val("customerAddress"),model:this.val("model"),imei:this.val("imei"),issues:this.checked(),description:this.val("problemDescription"),status:"received",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}},
 async save(){const x=this.collect();if(!x.name||!x.mobile||!x.model){alert(MobileDR.t("requiredRepairFields","नाम, मोबाइल नंबर और मॉडल भरना जरूरी है।"));return}try{if(window.MobileDRFirebase?.enabled?.()&&window.MobileDRFirebase?.createRepair){await window.MobileDRFirebase.createRepair(x);x.customerId=window.MobileDRFirebase.currentUser?.()?.uid||x.customerId;}const repairs=MobileDRStorage.getRepairs();repairs.unshift(x);MobileDRStorage.write(MobileDRStorage.keys.repairs,repairs);alert(`${MobileDR.t("repairSaved","रिपेयर के लिए फोन जमा हो गया। रसीद")}: ${x.receiptNo}`);this.syncReceipt()}catch(err){
console.error("Repair save failed:",err);
const code=String(err?.message||err?.code||"");
if(code.includes("ANONYMOUS_AUTH_DISABLED")){
alert("रिपेयर डेटाबेस में सेव नहीं हो सका। Firebase Console में Authentication → Sign-in method → Anonymous को Enable करें, फिर दोबारा प्रयास करें।");
}else if(code.includes("FIREBASE_NETWORK_ERROR")){
alert("रिपेयर डेटाबेस में सेव नहीं हो सका। इंटरनेट कनेक्शन जांचें और फिर प्रयास करें।");
}else if(code.includes("permission_denied")||code.includes("PERMISSION_DENIED")){
alert("रिपेयर डेटाबेस में सेव नहीं हो सका। Firebase Realtime Database Rules में customer repair create permission जांचें।");
}else if(code.includes("AUTH_SESSION_ACTIVE")){
alert("इस समय दूसरा अधिकृत Firebase सत्र सक्रिय है।");
}else{
alert("रिपेयर डेटाबेस में सेव नहीं हो सका। कृपया इंटरनेट कनेक्शन जांचें और फिर प्रयास करें।\n\nError: "+code);
}
}},
 text(id,v){const e=document.getElementById(id);if(e)e.textContent=v||"—"},
 syncReceipt(){if(!this.form)return;const x=this.collect();this.text("receiptPreviewNo",x.receiptNo);this.text("receiptPreviewDate",x.submissionDate);this.text("receiptPreviewName",x.name);this.text("receiptPreviewMobile",x.mobile);this.text("receiptPreviewModel",x.model);this.text("receiptPreviewImei",x.imei);this.text("receiptPreviewIssue",x.issues.join(", ")||x.description)}
};
window.MobileDRRepairs=MobileDRRepairs;document.addEventListener("DOMContentLoaded",()=>MobileDRRepairs.init());
