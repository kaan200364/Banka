function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

const BASE_URL = "http://localhost:5144/api/v1/contracts";

export async function getContracts(search = "", page = 1, pageSize = 10) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("page", page);
    params.append("pageSize", pageSize);

    const response = await fetch(`${BASE_URL}?${params.toString()}`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Sözleşmeler yüklenemedi");
    return response.json();
}
export async function createContract(data) {
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

export async function terminateContract(id, reason) {
    const response = await fetch(`${BASE_URL}/${id}/terminate`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
    }
    return response.json();
}

export async function renewContract(id, newEndDate) {
    const response = await fetch(`${BASE_URL}/${id}/renew`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ newEndDate }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
    }
    return response.json();
}

export async function getContractAttachments(contractId) {
    const response = await fetch(`${BASE_URL}/${contractId}/attachments`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error("Dosyalar yüklenemedi");
    return response.json();
}

export async function uploadContractAttachment(contractId, file) {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/${contractId}/attachments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
    }
    return response.json();
}

export async function getExpiringSoonContracts() {
    const response = await fetch(`${BASE_URL}/expiring-soon`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error("Yaklaşan sözleşmeler yüklenemedi");
    return response.json();
}