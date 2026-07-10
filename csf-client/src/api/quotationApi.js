function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

const BASE_URL = "http://localhost:5144/api/v1/quotations";

export async function getQuotations(search = "", page = 1, pageSize = 10) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("page", page);
    params.append("pageSize", pageSize);

    const response = await fetch(`${BASE_URL}?${params.toString()}`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Teklifler yüklenemedi");
    return response.json();
}
export async function createQuotation(data) {
    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
    }
    return response.json();
}

export async function approveQuotation(id) {
    const response = await fetch(`${BASE_URL}/${id}/approve`, {
        method: "PATCH",
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
    }
    return response.json();
}


export async function updateQuotation(id, data) {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
    }
    return response.json();
}

export async function rejectQuotation(id) {
    const response = await fetch(`${BASE_URL}/${id}/reject`, {
        method: "PATCH",
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
    }
    return response.json();
}

export async function downloadQuotationPdf(id, quotationNumber) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("PDF oluşturulamadı");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${quotationNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

export async function deleteQuotation(id) {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
    }
}