"use strict";

/*
 * Mobile DR print helpers.
 * Uses the current WebView document instead of window.open().
 * AppCreator24 can hand window.print() to Android's native print system
 * when printing is enabled for the Web/HTML section.
 */
(function(){
    const esc = value => {
        const d = document.createElement("div");
        d.textContent = value ?? "";
        return d.innerHTML;
    };

    function ensureArea(){
        let area = document.getElementById("mobileDRPrintArea");
        if(!area){
            area = document.createElement("section");
            area.id = "mobileDRPrintArea";
            area.className = "mobile-dr-print-area";
            area.setAttribute("role", "document");
            area.setAttribute("aria-hidden", "true");
            document.body.appendChild(area);
        }
        return area;
    }

    function printAfterRender(title){
        const oldTitle = document.title;
        document.title = title || oldTitle;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                window.print();
                setTimeout(() => {
                    document.title = oldTitle;
                    const area = document.getElementById("mobileDRPrintArea");
                    if(area) area.innerHTML = "";
                }, 500);
            });
        });
    }

    function receipt(r, issue){
        const area = ensureArea();
        area.innerHTML = `
            <div class="print-document receipt-print-document">
                <div class="print-brand">MOBILE <span>DR</span></div>
                <div class="print-subtitle">रिपेयर जमा रसीद</div>
                <div class="print-line"></div>
                <table class="print-table">
                    <tr><td>रसीद नंबर</td><td>${esc(r.receiptNo)}</td></tr>
                    <tr><td>जमा तारीख</td><td>${esc(r.submissionDate)}</td></tr>
                    <tr><td>नाम</td><td>${esc(r.name || r.customer?.name)}</td></tr>
                    <tr><td>मोबाइल</td><td>${esc(r.mobile || r.customer?.mobile)}</td></tr>
                    <tr><td>मॉडल</td><td>${esc(r.model || r.device?.model)}</td></tr>
                    <tr><td>IMEI</td><td>${esc(r.imei || r.device?.imei || "—")}</td></tr>
                    <tr><td>समस्या</td><td>${esc(issue || "समस्या दर्ज नहीं")}</td></tr>
                </table>
                <p class="print-note">Mobile DR · रिपेयर · फोन दुकान से लेना है</p>
            </div>`;
        printAfterRender("Mobile DR Receipt");
    }

    function repairs(rows, statusLabel){
        const area = ensureArea();
        const body = rows.length
            ? rows.map(r => `
                <tr>
                    <td>${esc(r.receiptNo || "")}</td>
                    <td>${esc(r.name || "")}</td>
                    <td>${esc(r.mobile || "")}</td>
                    <td>${esc(r.model || "")}</td>
                    <td>${esc(r.imei || "")}</td>
                    <td>${esc(statusLabel ? statusLabel(r.status) : (r.status || ""))}</td>
                    <td>${esc(r.submissionDate || "")}</td>
                </tr>`).join("")
            : `<tr><td colspan="7">कोई रिपेयर रिकॉर्ड नहीं</td></tr>`;

        area.innerHTML = `
            <div class="print-document repairs-print-document">
                <div class="print-brand">MOBILE <span>DR</span></div>
                <h1>सभी रिपेयर</h1>
                <p class="print-meta">कुल रिकॉर्ड: ${rows.length} | प्रिंट दिनांक: ${esc(new Date().toLocaleString("hi-IN"))}</p>
                <div class="print-line"></div>
                <table class="print-table repair-print-table">
                    <thead>
                        <tr>
                            <th>रसीद</th>
                            <th>ग्राहक</th>
                            <th>मोबाइल</th>
                            <th>मॉडल</th>
                            <th>IMEI</th>
                            <th>स्थिति</th>
                            <th>जमा तारीख</th>
                        </tr>
                    </thead>
                    <tbody>${body}</tbody>
                </table>
            </div>`;
        printAfterRender("Mobile DR - सभी रिपेयर");
    }

    window.MobileDRPrint = { receipt, repairs };
})();
