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