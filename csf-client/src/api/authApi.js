const AUTH_BASE_URL = "http://localhost:5144/api/v1/auth";

export async function login(username, password) {
    const response = await fetch(`${AUTH_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
    }

    return response.json();
}

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

export async function getMyProfile() {
    const response = await fetch("http://localhost:5144/api/v1/auth/me", {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Profil bilgileri yüklenemedi");
    return response.json();
}

export async function updateMyProfile(data) {
    const response = await fetch("http://localhost:5144/api/v1/auth/me", {
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

export async function changeMyPassword(data) {
    const response = await fetch("http://localhost:5144/api/v1/auth/change-password", {
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