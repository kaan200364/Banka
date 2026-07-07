function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

const BASE_URL = "http://localhost:5144/api/v1/projects";

export async function getProjects(search = "", page = 1, pageSize = 10) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("page", page);
    params.append("pageSize", pageSize);

    const response = await fetch(`${BASE_URL}?${params.toString()}`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Projeler yüklenemedi");
    return response.json();
}

export async function createProject(data) {
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

export async function getManagers() {
    const response = await fetch("http://localhost:5144/api/v1/users/managers", {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Yöneticiler yüklenemedi");
    return response.json();
}
export async function getAllUsers() {
    const response = await fetch("http://localhost:5144/api/v1/users?pageSize=100", {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Kullanıcılar yüklenemedi");
    const result = await response.json();
    return result.items;
}

export async function updateProject(id, data) {
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