"use strict";

const MobileDRProducts = {
    state: { query: "", category: "", sort: "new" },
    categories: ["Display", "Battery", "Charging", "IC", "Touch", "Tools", "Accessories", "Other"],

    money(value) { return "₹" + Number(value || 0).toLocaleString("en-IN"); },
    escape(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); },
    load() { return MobileDRStorage.read(MobileDRStorage.keys.products, []); },

    filtered() {
        let list = this.load().filter(p => {
            const text = [p.name, p.brand, p.models, p.category, p.quality, p.description].join(" ").toLowerCase();
            return text.includes(this.state.query.toLowerCase()) && (!this.state.category || p.category === this.state.category);
        });
        if (this.state.sort === "low") list.sort((a,b) => Number(a.price||0) - Number(b.price||0));
        if (this.state.sort === "high") list.sort((a,b) => Number(b.price||0) - Number(a.price||0));
        if (this.state.sort === "name") list.sort((a,b) => String(a.name||"").localeCompare(String(b.name||"")));
        if (this.state.sort === "featured") list.sort((a,b) => Number(!!b.featured) - Number(!!a.featured));
        return list;
    },

    card(p) {
        const image = p.image ? `<img src="${this.escape(p.image)}" alt="${this.escape(p.name)}">` : `<span class="product-placeholder">📱</span>`;
        return `<article class="product-card">
            <a class="product-photo" href="product-details.html?id=${encodeURIComponent(p.id)}">${image}</a>
            <div class="product-body">
                ${p.featured ? `<span class="product-tag featured">⭐ Featured</span>` : ""}
                <a href="product-details.html?id=${encodeURIComponent(p.id)}"><h2>${this.escape(p.name)}</h2></a>
                <p class="product-meta">${this.escape(p.brand || "")} · ${this.escape(p.category || "")}</p>
                <div class="product-price">${this.money(p.price)} ${Number(p.oldPrice) > Number(p.price) ? `<del>${this.money(p.oldPrice)}</del>` : ""}</div>
                <div class="product-tags"><span>${this.escape(p.quality || "")}</span><span>🛡 ${this.escape(p.warranty || "No Warranty")}</span></div>
                <p class="product-stock">${Number(p.stock || 0) > 0 ? `स्टॉक: ${this.escape(p.stock)}` : "स्टॉक उपलब्ध नहीं"}</p>
                <a class="product-view" href="product-details.html?id=${encodeURIComponent(p.id)}">विवरण देखें</a>
            </div>
        </article>`;
    },

    render() {
        const list = this.filtered();
        const root = document.getElementById("productsList");
        const count = document.getElementById("resultCount");
        if (count) count.textContent = `${list.length} प्रोडक्ट मिले`;
        if (!root) return;
        root.innerHTML = list.length ? list.map(p => this.card(p)).join("") : `<div class="empty-product"><div>📦</div><strong>कोई प्रोडक्ट नहीं मिला</strong><p>Admin Catalogue में प्रोडक्ट जोड़े जाने के बाद वे यहाँ दिखाई देंगे।</p></div>`;
    },

    init() {
        const search = document.getElementById("productSearch");
        const category = document.getElementById("categoryFilter");
        const sort = document.getElementById("productSort");
        search?.addEventListener("input", e => { this.state.query = e.target.value.trim(); this.render(); });
        category?.addEventListener("change", e => { this.state.category = e.target.value; this.render(); });
        sort?.addEventListener("change", e => { this.state.sort = e.target.value; this.render(); });
        window.addEventListener("storage", e => { if (e.key === MobileDRStorage.keys.products) this.render(); });
        this.render();
        if(window.MobileDRFirebase?.getPublicCollection){ window.MobileDRFirebase.getPublicCollection("products").then(list=>{ MobileDRStorage.write(MobileDRStorage.keys.products,list); this.render(); }).catch(()=>{}); }
    }
};

window.MobileDRProducts = MobileDRProducts;
document.addEventListener("DOMContentLoaded", () => MobileDRProducts.init());
