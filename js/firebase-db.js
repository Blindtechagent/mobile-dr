"use strict";
(function(){
const cfg=window.MobileDRFirebaseConfig||{};const ready=!!(window.firebase&&cfg.apiKey&&cfg.databaseURL&&cfg.projectId&&cfg.appId);let db=null,auth=null;
if(ready){try{if(!firebase.apps.length)firebase.initializeApp(cfg);db=firebase.database();auth=firebase.auth();}catch(e){console.error("Firebase initialization failed:",e);}}
const paths={repairs:"repairs",products:"products",offers:"offers"};
const ownerEmail=String(cfg.ownerEmail||"").toLowerCase().trim();
const ownerUid=String(cfg.ownerUid||"").trim();
const api={
 enabled:()=>!!db,authEnabled:()=>!!auth,ownerEmail,ownerUid,currentUser:()=>auth?.currentUser||null,
 isOwner:()=>!!(auth?.currentUser&&auth.currentUser.uid===ownerUid&&auth.currentUser.email&&auth.currentUser.email.toLowerCase()===ownerEmail),
 async signInOwner(email,password){if(!auth)throw new Error("Firebase Authentication is not loaded.");const normalized=String(email||"").toLowerCase().trim();if(normalized!==ownerEmail)throw new Error("Only the configured staff email can sign in.");try{await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);}catch(e){console.warn("Could not set persistent staff auth; continuing with Firebase default persistence.",e);}const result=await auth.signInWithEmailAndPassword(normalized,password);if(result.user.uid!==ownerUid){await auth.signOut();throw new Error("This account is not the authorized staff account.");}return result;},
 async signInCustomer(){
if(!auth)throw new Error("FIREBASE_AUTH_NOT_LOADED");
if(auth.currentUser?.isAnonymous)return auth.currentUser;
if(api.isOwner())return auth.currentUser;
if(auth.currentUser&&!auth.currentUser.isAnonymous)throw new Error("AUTH_SESSION_ACTIVE");
try{return (await auth.signInAnonymously()).user;}
catch(e){
const code=String(e?.code||"");
if(code.includes("operation-not-allowed"))throw new Error("ANONYMOUS_AUTH_DISABLED");
if(code.includes("network-request-failed"))throw new Error("FIREBASE_NETWORK_ERROR");
throw e;
}
},
 onAuthStateChanged(cb){return auth?auth.onAuthStateChanged(cb):()=>{}},
 async saveCollection(key,list){if(!db||!paths[key]||!api.isOwner())throw new Error("Staff authentication required.");const items=Array.isArray(list)?list:[];const mapped={};items.forEach((x,i)=>{const id=String(x?.id||i);mapped[id]=x;});await db.ref(paths[key]).set(mapped);return true;},
 listenCollection(key,cb){if(!db||!paths[key]||!api.isOwner())return()=>{};const ref=db.ref(paths[key]),handler=s=>{const v=s.val();cb(Array.isArray(v)?v:Object.values(v||{}));};ref.on("value",handler,error=>console.error("Firebase listener error:",error));return()=>ref.off("value",handler);},
 async getCollection(key){if(!db||!paths[key]||!api.isOwner())throw new Error("Staff authentication required.");const v=(await db.ref(paths[key]).once("value")).val();return Array.isArray(v)?v:Object.values(v||{});},
 async getPublicCollection(key){if(!db||!paths[key])return[];const v=(await db.ref(paths[key]).once("value")).val();return Array.isArray(v)?v:Object.values(v||{});},
 async createRepair(repair){const user=await api.signInCustomer();if(!db)throw new Error("Firebase database unavailable.");const staff=api.isOwner();const x={...repair,customerId:user.uid,createdBy:staff?"staff":"customer",createdAt:repair.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};await db.ref("repairs/"+x.id).set(x);return x;},
 async updateRepair(id,patch){if(!db||!api.isOwner())throw new Error("Staff authentication required.");const x={...patch,updatedAt:new Date().toISOString()};if(patch.status==="ready"&&!patch.readyAt)x.readyAt=new Date().toISOString();await db.ref("repairs/"+id).update(x);return true;},
 async deleteRepair(id){if(!db||!api.isOwner())throw new Error("Staff authentication required.");await db.ref("repairs/"+id).remove();return true;},
 listenMyRepairs(cb){if(!db||!auth)return()=>{};let off=()=>{};let stopped=false;const start=async()=>{try{const user=await api.signInCustomer();if(stopped)return;off();const local=MobileDRStorage?.getRepairs?.()||[];const ids=[...new Set(local.map(x=>x.id).filter(Boolean))];const listeners=[];const emit=()=>{const current=MobileDRStorage?.getRepairs?.()||[];cb(current);};ids.forEach(id=>{const ref=db.ref("repairs/"+id),handler=s=>{const remote=s.val();const a=MobileDRStorage.getRepairs();const i=a.findIndex(x=>x.id===id);if(remote){if(i>=0)a[i]=remote;else a.unshift(remote);}else if(i>=0){a.splice(i,1);}window.MobileDRStorageSyncing=true;MobileDRStorage.write(MobileDRStorage.keys.repairs,a);window.MobileDRStorageSyncing=false;emit();};ref.on("value",handler);listeners.push(()=>ref.off("value",handler));});off=()=>listeners.forEach(x=>x());emit();}catch(e){console.error("Customer repair listener error:",e);cb(MobileDRStorage?.getRepairs?.()||[]);}};start();return()=>{stopped=true;off();};}
};
window.MobileDRFirebase=api;
})();
