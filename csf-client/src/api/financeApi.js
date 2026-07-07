function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

const INCOME_URL = "http://localhost:5144/api/v1/income";
const EXPENSE_URL = "http://localhost:5144/api/v1/expense";

export async function getIncomes(search = "", page = 1, pageSize = 10) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("page", page);
    params.append("pageSize", pageSize);
    const response = await fetch(`${INCOME_URL}?${params.toString()}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error("Gelirler yüklenemedi");
    return response.json();
}
export async function createIncome(data) {
    const response = await fetch(INCOME_URL, {
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

export async function getExpenses(search = "", page = 1, pageSize = 10) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("page", page);
    params.append("pageSize", pageSize);
    const response = await fetch(`${EXPENSE_URL}?${params.toString()}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error("Giderler yüklenemedi");
    return response.json();
}

export async function createExpense(data) {
    const response = await fetch(EXPENSE_URL, {
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