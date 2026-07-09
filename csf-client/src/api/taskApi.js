function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

const BASE_URL = "http://localhost:5144/api/v1/tasks";

export async function getTasks(search = "", page = 1, pageSize = 10) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("page", page);
    params.append("pageSize", pageSize);

    const response = await fetch(`${BASE_URL}?${params.toString()}`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Görevler yüklenemedi");
    return response.json();
}
export async function createTask(data) {
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

export async function updateTaskStatus(id, status) {
    const response = await fetch(`${BASE_URL}/${id}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
    }
    return response.json();
}

export async function updateTask(id, data) {
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

export async function deleteTask(id) {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
    }
}

export async function getTaskComments(taskId) {
    const response = await fetch(`${BASE_URL}/${taskId}/comments`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error("Yorumlar yüklenemedi");
    return response.json();
}

export async function addTaskComment(taskId, content) {
    const response = await fetch(`${BASE_URL}/${taskId}/comments`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ content }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
    }
    return response.json();
}

export async function getTaskAttachments(taskId) {
    const response = await fetch(`${BASE_URL}/${taskId}/attachments`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error("Dosyalar yüklenemedi");
    return response.json();
}

export async function uploadTaskAttachment(taskId, file) {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/${taskId}/attachments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // Dikkat: Content-Type YOK
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
    }
    return response.json();
}