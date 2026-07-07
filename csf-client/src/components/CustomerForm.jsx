import { useState, useEffect } from "react";
import { createCustomer, updateCustomer } from "../api/customerApi";

const EMPTY_FORM = {
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    taxNumber: "",
    address: "",
};

function CustomerForm({ editingCustomer, onSaved, onCancel }) {
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    // editingCustomer değişince formu o carinin bilgileriyle doldur
    useEffect(() => {
        if (editingCustomer) {
            setFormData({
                companyName: editingCustomer.companyName || "",
                contactPerson: editingCustomer.contactPerson || "",
                phone: editingCustomer.phone || "",
                email: editingCustomer.email || "",
                taxNumber: editingCustomer.taxNumber || "",
                address: editingCustomer.address || "",
            });
        } else {
            setFormData(EMPTY_FORM);
        }
        setErrors({});
    }, [editingCustomer]);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        try {
            if (editingCustomer) {
                await updateCustomer(editingCustomer.customerID, formData);
            } else {
                await createCustomer(formData);
            }
            setFormData(EMPTY_FORM);
            onSaved();
        } catch (err) {
            if (err.errors) {
                setErrors(err.errors);
            } else {
                alert("Kayıt sırasında bir hata oluştu.");
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <form className="customer-form" onSubmit={handleSubmit}>
            <h2>{editingCustomer ? "Cari Düzenle" : "Yeni Cari Ekle"}</h2>

            <div className="form-group">
                <label>Şirket Adı *</label>
                <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                />
                {errors.CompanyName && <span className="field-error">{errors.CompanyName[0]}</span>}
            </div>

            <div className="form-group">
                <label>Yetkili Kişi</label>
                <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label>Telefon</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
            </div>

            <div className="form-group">
                <label>E-posta</label>
                <input type="text" name="email" value={formData.email} onChange={handleChange} />
                {errors.Email && <span className="field-error">{errors.Email[0]}</span>}
            </div>

            <div className="form-group">
                <label>Vergi Numarası</label>
                <input
                    type="text"
                    name="taxNumber"
                    value={formData.taxNumber}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label>Adres</label>
                <textarea name="address" value={formData.address} onChange={handleChange} />
            </div>

            <div className="form-actions">
                <button type="submit" disabled={saving}>
                    {saving ? "Kaydediliyor..." : editingCustomer ? "Güncelle" : "Kaydet"}
                </button>
                {editingCustomer && (
                    <button type="button" className="secondary" onClick={onCancel}>
                        Vazgeç
                    </button>
                )}
            </div>
        </form>
    );
}

export default CustomerForm;