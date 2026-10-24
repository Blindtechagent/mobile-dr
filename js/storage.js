"use strict";
const MobileDRStorage={
 keys:{repairs:"mobileDR_repairs_v1",products:"mobileDR_products_v1",offers:"mobileDR_offers_v1"},
 read(key,fallback=[]){try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback}catch(e){console.error("MobileDR storage read error:",e);return fallback}},
 write(key,value){try{localStorage.setItem(key,JSON.stringify(value));const collection=Object.keys(this.keys).find(n=>this.keys[n]===key);if(collection&&window.MobileDRFirebase?.enabled?.()&&window.MobileDRFirebase?.isOwner?.()&&!window.MobileDRStorageSyncing){window.MobileDRFirebase.saveCollection(collection,value).catch(e=>console.error("Firebase save error:",e))}return true}catch(e){console.error("MobileDR storage write error:",e);return false}},
 getRepairs(){return this.read(this.keys.repairs,[])},saveRepairs(v){return this.write(this.keys.repairs,v)},
 getProducts(){return this.read(this.keys.products,[])},saveProducts(v){return this.write(this.keys.products,v)},
 getOffers(){return this.read(this.keys.offers,[])},saveOffers(v){return this.write(this.keys.offers,v)}
};
window.MobileDRStorage=MobileDRStorage;
