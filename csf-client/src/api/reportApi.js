function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

const BASE_URL = "http://localhost:5144/api/v1/reports";

export async function getFinancialSummary(from = "", to = "") {
    let url = `${BASE_URL}/financial-summary`;
    const params = [];
    if (from) params.push(`from=${from}`);
    if (to) params.push(`to=${to}`);
    if (params.length) url += `?${params.join("&")}`;

    const response = await fetch(url, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error("Finansal özet yüklenemedi");
    return response.json();
}
export async function getProjectSummary() {
    const response = await fetch(`${BASE_URL}/project-summary`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error("Proje özeti yüklenemedi");
    return response.json();
}

export async function getQuotationSummary() {
    const response = await fetch(`${BASE_URL}/quotation-summary`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error("Teklif özeti yüklenemedi");
    return response.json();
}

async function downloadFile(url, filename) {
    const token = localStorage.getItem("token");
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Dosya indirilemedi");

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
}

export async function downloadReportPdf(from = "", to = "") {
    let url = `${BASE_URL}/export/pdf`;
    const params = [];
    if (from) params.push(`from=${from}`);
    if (to) params.push(`to=${to}`);
    if (params.length) url += `?${params.join("&")}`;

    await downloadFile(url, "rapor.pdf");
}

export async function downloadReportExcel(from = "", to = "") {
    let url = `${BASE_URL}/export/excel`;
    const params = [];
    if (from) params.push(`from=${from}`);
    if (to) params.push(`to=${to}`);
    if (params.length) url += `?${params.join("&")}`;

    await downloadFile(url, "rapor.xlsx");
}

export async function getDashboardSummary() {
    const response = await fetch(`${BASE_URL}/dashboard-summary`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error("Genel özet yüklenemedi");
    return response.json();
}

export async function getCustomerReport() {
    const response = await fetch(`${BASE_URL}/customer-summary`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error("Cari raporu yüklenemedi");
    return response.json();
}

export async function getSupplierReport() {
    const response = await fetch(`${BASE_URL}/supplier-summary`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error("Tedarikçi raporu yüklenemedi");
    return response.json();
}

export async function getBankReport() {
    const response = await fetch(`${BASE_URL}/bank-summary`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error("Banka raporu yüklenemedi");
    return response.json();
}