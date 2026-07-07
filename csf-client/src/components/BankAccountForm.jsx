import { useState, useEffect } from "react";
import { createBankAccount, updateBankAccount } from "../api/bankAccountApi";

const EMPTY_FORM = {
    bankName: "",
    iban: "",
    accountNumber: "",
    currency: "TRY",
    overdraftEnabled: false,
    overdraftLimit: 0,
};

function BankAccountForm({ editingAccount, onSaved, onCancel }) {
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (editingAccount) {
            setFormData({
                bankName: editingAccount.bankName,
                iban: editingAccount.iban,
                accountNumber: editingAccount.accountNumber || "",
                currency: editingAccount.currency,
                overdraftEnabled: editingAccount.overdraftEnabled,
                overdraftLimit: editingAccount.overdraftLimit,
            });
        } else {
            setFormData(EMPTY_FORM);
        }
        setErrors({});
    }, [editingAccount]);

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        try {
            if (editingAccount) {
                // Update sadece bankName, accountNumber, overdraft alanlarını gönderir (IBAN/Currency değişmez)
                await updateBankAccount(editingAccount.bankAccountID, {
                    bankName: formData.bankName,
                    accountNumber: formData.accountNumber,
                    overdraftEnabled: formData.overdraftEnabled,
                    overdraftLimit: formData.overdraftLimit,
                });
            } else {
                await createBankAccount(formData);
                setFormData(EMPTY_FORM);
            }
            onSaved();
        } catch (err) {
            if (err.errors) {
                setErrors(err.errors);
            } else {
                setErrors({ general: err.message || "İşlem sırasında bir hata oluştu." });
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <form className="customer-form" onSubmit={handleSubmit}>
            <h2>{editingAccount ? "Banka Hesabını Düzenle" : "Yeni Banka Hesabı Ekle"}</h2>

            <div className="form-group">
                <label>Banka Adı *</label>
                <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} />
                {errors.BankName && <span className="field-error">{errors.BankName[0]}</span>}
            </div>

            <div className="form-group">
                <label>IBAN *</label>
                <input
                    type="text"
                    name="iban"
                    value={formData.iban}
                    onChange={handleChange}
                    disabled={!!editingAccount}
                />
                {editingAccount && <span className="field-error" style={{ color: "var(--text-muted)" }}>IBAN düzenlenemez.</span>}
                {errors.IBAN && <span className="field-error">{errors.IBAN[0]}</span>}
            </div>

            <div className="form-group">
                <label>Hesap Numarası</label>
                <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} />
            </div>

            <div className="form-group">
                <label>Para Birimi</label>
                <select name="currency" value={formData.currency} onChange={handleChange} disabled={!!editingAccount}>
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                </select>
            </div>

            <div className="form-group checkbox-group">
                <label>
                    <input
                        type="checkbox"
                        name="overdraftEnabled"
                        checked={formData.overdraftEnabled}
                        onChange={handleChange}
                    />
                    Eksi bakiyeye izin ver (Overdraft)
                </label>
            </div>

            {formData.overdraftEnabled && (
                <div className="form-group">
                    <label>Overdraft Limiti</label>
                    <input
                        type="number"
                        name="overdraftLimit"
                        value={formData.overdraftLimit}
                        onChange={handleChange}
                        step="0.01"
                    />
                </div>
            )}

            {errors.general && <p className="field-error finance-error">{errors.general}</p>}

            <div className="form-actions">
                <button type="submit" disabled={saving}>
                    {saving ? "Kaydediliyor..." : editingAccount ? "Güncelle" : "Kaydet"}
                </button>
                {editingAccount && (
                    <button type="button" className="secondary" onClick={onCancel}>Vazgeç</button>
                )}
            </div>
        </form>
    );
}

export default BankAccountForm;