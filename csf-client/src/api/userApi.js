function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

const BASE_URL = "http://localhost:5144/api/v1/users";

export async function getAllUsers(search = "", page = 1, pageSize = 10) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("page", page);
    params.append("pageSize", pageSize);
    const response = await fetch(`${BASE_URL}?${params.toString()}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error("Kullanıcılar yüklenemedi");
    return response.json();
}
export async function createUser(data) {
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

export async function updateUserRole(id, role) {
    const response = await fetch(`${BASE_URL}/${id}/role`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ role }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
    }
    return response.json();
}

export async function deactivateUser(id) {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
    }
}

export async function getSecurityLogs() {
    const response = await fetch("http://localhost:5144/api/v1/auth/security-logs", {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Güvenlik logları yüklenemedi");
    return response.json();
}