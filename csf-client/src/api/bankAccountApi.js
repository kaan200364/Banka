const API_BASE_URL = "http://localhost:5144/api/v1/bankaccounts";

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

export async function getBankAccounts(search = "", page = 1, pageSize = 10) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("page", page);
    params.append("pageSize", pageSize);

    const response = await fetch(`${API_BASE_URL}?${params.toString()}`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Banka hesapları yüklenemedi");
    return response.json();
}
export async function createBankAccount(accountData) {
    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(accountData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
    }
    return response.json();
}

export async function getBankTransactions(bankAccountId) {
    const response = await fetch(`${API_BASE_URL}/${bankAccountId}/transactions`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Hareket dökümü yüklenemedi");
    return response.json();
}

export async function updateBankAccount(id, data) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
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

export async function deactivateBankAccount(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
    }
}