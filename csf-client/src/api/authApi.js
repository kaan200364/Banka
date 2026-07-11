const AUTH_BASE_URL = "http://localhost:5144/api/v1/auth";
export async function login(username, password, twoFactorCode = null) {
    const response = await fetch("http://localhost:5144/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, twoFactorCode }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Giriş başarısız oldu");
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

export async function setup2FA() {
    const response = await fetch("http://localhost:5144/api/v1/auth/2fa/setup", {
        method: "POST",
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("2FA kurulumu başlatılamadı");
    return response.json();
}

export async function confirm2FA(code) {
    const response = await fetch("http://localhost:5144/api/v1/auth/2fa/confirm", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ code }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
    }
    return response.json();
}

export async function disable2FA() {
    const response = await fetch("http://localhost:5144/api/v1/auth/2fa/disable", {
        method: "POST",
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("2FA kapatılamadı");
    return response.json();
}