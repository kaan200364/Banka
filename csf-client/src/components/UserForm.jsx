import { useState } from "react";
import { createUser } from "../api/userApi";

const EMPTY_FORM = { username: "", password: "", fullName: "", email: "", role: "Employee" };

function UserForm({ onSaved }) {
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        try {
            await createUser(formData);
            setFormData(EMPTY_FORM);
            onSaved();
        } catch (err) {
            if (err.errors) {
                setErrors(err.errors);
            } else {
                setErrors({ general: err.message || "Kullanıcı oluşturulamadı." });
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <form className="customer-form" onSubmit={handleSubmit}>
            <h2>Yeni Kullanıcı Oluştur</h2>

            <div className="form-group">
                <label>Kullanıcı Adı *</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required />
                {errors.Username && <span className="field-error">{errors.Username[0]}</span>}
            </div>

            <div className="form-group">
                <label>Şifre *</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                {errors.Password && <span className="field-error">{errors.Password[0]}</span>}
            </div>

            <div className="form-group">
                <label>Ad Soyad *</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>

            <div className="form-group">
                <label>E-posta *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                {errors.Email && <span className="field-error">{errors.Email[0]}</span>}
            </div>

            <div className="form-group">
                <label>Rol *</label>
                <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Administrator">Administrator</option>
                </select>
            </div>

            {errors.general && <p className="field-error finance-error">{errors.general}</p>}

            <div className="form-actions">
                <button type="submit" disabled={saving}>{saving ? "Kaydediliyor..." : "Kaydet"}</button>
            </div>
        </form>
    );
}

export default UserForm;