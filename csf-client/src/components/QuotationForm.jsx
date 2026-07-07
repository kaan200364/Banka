import { useState, useEffect } from "react";
import { getCustomers } from "../api/customerApi";
import { createQuotation, updateQuotation } from "../api/quotationApi";

const EMPTY_FORM = { customerID: "", expiryDate: "", totalAmount: "", currency: "TRY", description: "" };

function QuotationForm({ editingQuotation, onSaved, onCancel }) {
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [errorMessage, setErrorMessage] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getCustomers("", 1, 100).then((result) => setCustomers(result.items)).catch(console.error);
    }, []);

    useEffect(() => {
        if (editingQuotation) {
            setFormData({
                customerID: editingQuotation.customerID,
                expiryDate: editingQuotation.expiryDate.split("T")[0],
                totalAmount: editingQuotation.totalAmount,
                currency: editingQuotation.currency,
                description: editingQuotation.description || "",
            });
        } else {
            setFormData(EMPTY_FORM);
        }
        setErrorMessage(null);
    }, [editingQuotation]);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setErrorMessage(null);

        const payload = { ...formData, totalAmount: parseFloat(formData.totalAmount) };

        try {
            if (editingQuotation) {
                // Update sırasında customerID gönderilmez (backend zaten kabul etmiyor)
                const { customerID, ...updateData } = payload;
                await updateQuotation(editingQuotation.quotationID, updateData);
            } else {
                await createQuotation(payload);
                setFormData(EMPTY_FORM);
            }
            onSaved();
        } catch (err) {
            setErrorMessage(err.message || "İşlem sırasında bir hata oluştu.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form className="customer-form" onSubmit={handleSubmit}>
            <h2>{editingQuotation ? "Teklifi Düzenle" : "Yeni Teklif Oluştur"}</h2>

            <div className="form-group">
                <label>Müşteri *</label>
                <select
                    name="customerID"
                    value={formData.customerID}
                    onChange={handleChange}
                    required
                    disabled={!!editingQuotation}
                >
                    <option value="">Seçiniz...</option>
                    {customers.map((c) => (
                        <option key={c.customerID} value={c.customerID}>{c.companyName}</option>
                    ))}
                </select>
                {editingQuotation && <span className="field-error" style={{ color: "var(--text-muted)" }}>Müşteri değiştirilemez.</span>}
            </div>

            <div className="form-group">
                <label>Geçerlilik Tarihi *</label>
                <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required />
            </div>

            <div className="form-group">
                <label>Toplam Tutar *</label>
                <input type="number" name="totalAmount" value={formData.totalAmount} onChange={handleChange} step="0.01" min="0.01" required />
            </div>

            <div className="form-group">
                <label>Para Birimi</label>
                <select name="currency" value={formData.currency} onChange={handleChange}>
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                </select>
            </div>

            <div className="form-group">
                <label>Açıklama</label>
                <textarea name="description" value={formData.description} onChange={handleChange} />
            </div>

            {errorMessage && <p className="field-error finance-error">{errorMessage}</p>}

            <div className="form-actions">
                <button type="submit" disabled={saving}>
                    {saving ? "Kaydediliyor..." : editingQuotation ? "Güncelle" : "Kaydet"}
                </button>
                {editingQuotation && (
                    <button type="button" className="secondary" onClick={onCancel}>Vazgeç</button>
                )}
            </div>
        </form>
    );
}

export default QuotationForm;