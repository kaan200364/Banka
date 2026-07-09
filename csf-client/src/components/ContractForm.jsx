import { useState, useEffect } from "react";
import { getQuotations } from "../api/quotationApi";
import { createContract } from "../api/contractApi";

function ContractForm({ onSaved }) {
    const [approvedQuotations, setApprovedQuotations] = useState([]);
    const [formData, setFormData] = useState({
        quotationID: "",
        startDate: "",
        endDate: "",
    });
    const [errorMessage, setErrorMessage] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadApprovedQuotations();
    }, []);

    async function loadApprovedQuotations() {
        try {
            const result = await getQuotations("", 1, 100);
            setApprovedQuotations(result.items.filter((q) => q.status === "Approved"));
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

        try {
            await createContract(formData);
            setFormData({ quotationID: "", startDate: "", endDate: "" });
            loadApprovedQuotations(); // az önce kullanılan teklif listeden çıksın diye yenile
            onSaved();
        } catch (err) {
            setErrorMessage(err.message || "Sözleşme oluşturulamadı.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form className="customer-form" onSubmit={handleSubmit}>
            <h2>Yeni Sözleşme Oluştur</h2>

            <div className="form-group">
                <label>Onaylı Teklif *</label>
                <select name="quotationID" value={formData.quotationID} onChange={handleChange} required>
                    <option value="">Seçiniz...</option>
                    {approvedQuotations.map((q) => (
                        <option key={q.quotationID} value={q.quotationID}>
                            {q.quotationNumber} — {q.totalAmount.toLocaleString("tr-TR")} {q.currency}
                        </option>
                    ))}
                </select>
                {approvedQuotations.length === 0 && (
                    <span className="field-error">Onaylı teklif bulunamadı. Önce bir teklifi onaylatın.</span>
                )}
            </div>

            <div className="form-group">
                <label>Başlangıç Tarihi *</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
            </div>

            <div className="form-group">
                <label>Bitiş Tarihi *</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
            </div>

            {errorMessage && <p className="field-error finance-error">{errorMessage}</p>}

            <div className="form-actions">
                <button type="submit" disabled={saving}>{saving ? "Kaydediliyor..." : "Kaydet"}</button>
            </div>
        </form>
    );
}

export default ContractForm;