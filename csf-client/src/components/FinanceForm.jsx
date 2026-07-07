import { useState, useEffect } from "react";
import { getBankAccounts } from "../api/bankAccountApi";
import { createIncome, createExpense } from "../api/financeApi";

function FinanceForm({ userRole, onSaved }) {
    const [type, setType] = useState("Income");
    const [bankAccounts, setBankAccounts] = useState([]);
    const [formData, setFormData] = useState({
        bankAccountID: "",
        amount: "",
        category: "",
        description: "",
    });
    const [errorMessage, setErrorMessage] = useState(null);
    const [saving, setSaving] = useState(false);

    // Manager sadece Gider girebilir (SRS rol tablosuna göre)
    const canCreateIncome = userRole === "Administrator" || userRole === "Employee";

    useEffect(() => {
        if (!canCreateIncome) setType("Expense");
        loadBankAccounts();
    }, []);

    async function loadBankAccounts() {
        try {
            const result = await getBankAccounts("", 1, 100);
            setBankAccounts(result.items);
        } catch (err) {
            console.error(err);
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setErrorMessage(null);

        const payload = {
            bankAccountID: formData.bankAccountID,
            amount: parseFloat(formData.amount),
            category: formData.category,
            description: formData.description,
        };

        try {
            if (type === "Income") {
                await createIncome(payload);
            } else {
                await createExpense(payload);
            }
            setFormData({ bankAccountID: "", amount: "", category: "", description: "" });
            onSaved();
        } catch (err) {
            // Backend'den gelen iş kuralı hatası (örn. overdraft) burada yakalanıyor
            setErrorMessage(err.message || "İşlem sırasında bir hata oluştu.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form className="customer-form" onSubmit={handleSubmit}>
            <h2>Yeni {type === "Income" ? "Gelir" : "Gider"} Kaydı</h2>

            {canCreateIncome && (
                <div className="form-group">
                    <label>İşlem Türü</label>
                    <div className="type-toggle">
                        <button
                            type="button"
                            className={type === "Income" ? "toggle-btn active-income" : "toggle-btn"}
                            onClick={() => setType("Income")}
                        >
                            Gelir
                        </button>
                        <button
                            type="button"
                            className={type === "Expense" ? "toggle-btn active-expense" : "toggle-btn"}
                            onClick={() => setType("Expense")}
                        >
                            Gider
                        </button>
                    </div>
                </div>
            )}

            <div className="form-group">
                <label>Banka Hesabı *</label>
                <select
                    name="bankAccountID"
                    value={formData.bankAccountID}
                    onChange={handleChange}
                    required
                >
                    <option value="">Seçiniz...</option>
                    {bankAccounts.map((acc) => (
                        <option key={acc.bankAccountID} value={acc.bankAccountID}>
                            {acc.bankName} — {acc.balance.toLocaleString("tr-TR")} {acc.currency}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Tutar *</label>
                <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0.01"
                    required
                />
            </div>

            <div className="form-group">
                <label>Kategori</label>
                <input type="text" name="category" value={formData.category} onChange={handleChange} />
            </div>

            <div className="form-group">
                <label>Açıklama</label>
                <textarea name="description" value={formData.description} onChange={handleChange} />
            </div>

            {errorMessage && <p className="field-error finance-error">{errorMessage}</p>}

            <div className="form-actions">
                <button type="submit" disabled={saving}>
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
            </div>
        </form>
    );
}

export default FinanceForm;