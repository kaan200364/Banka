import { useState, useEffect } from "react";
import { getContracts } from "../api/contractApi";
import { createProject, updateProject, getManagers } from "../api/projectApi";

const EMPTY_FORM = { contractID: "", projectName: "", projectManagerID: "", startDate: "", endDate: "" };
const STATUS_OPTIONS = [
    { value: "Active", label: "Aktif" },
    { value: "Completed", label: "Tamamlandı" },
    { value: "OnHold", label: "Beklemede" },
    { value: "Cancelled", label: "İptal Edildi" },
];

function ProjectForm({ editingProject, onSaved, onCancel }) {
    const [activeContracts, setActiveContracts] = useState([]);
    const [managers, setManagers] = useState([]);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [status, setStatus] = useState("Active");
    const [errorMessage, setErrorMessage] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadOptions();
    }, []);

    useEffect(() => {
        if (editingProject) {
            setFormData({
                contractID: editingProject.contractID,
                projectName: editingProject.projectName,
                projectManagerID: editingProject.projectManagerID,
                startDate: editingProject.startDate.split("T")[0],
                endDate: editingProject.endDate ? editingProject.endDate.split("T")[0] : "",
            });
            setStatus(editingProject.status);
        } else {
            setFormData(EMPTY_FORM);
            setStatus("Active");
        }
        setErrorMessage(null);
    }, [editingProject]);

    async function loadOptions() {
        try {
            const [contractsResult, managerList] = await Promise.all([getContracts("", 1, 100), getManagers()]);
            const contracts = contractsResult.items;
            setActiveContracts(contracts.filter((c) => c.status === "Active"));
            setManagers(managerList);
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
            if (editingProject) {
                await updateProject(editingProject.projectID, {
                    projectName: formData.projectName,
                    endDate: formData.endDate || null,
                    status: status,
                });
            } else {
                await createProject({ ...formData, endDate: formData.endDate || null });
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
            <h2>{editingProject ? "Projeyi Düzenle" : "Yeni Proje Oluştur"}</h2>

            <div className="form-group">
                <label>Sözleşme *</label>
                <select name="contractID" value={formData.contractID} onChange={handleChange} required disabled={!!editingProject}>
                    <option value="">Seçiniz...</option>
                    {activeContracts.map((c) => (
                        <option key={c.contractID} value={c.contractID}>{c.contractNumber}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Proje Adı *</label>
                <input type="text" name="projectName" value={formData.projectName} onChange={handleChange} required />
            </div>

            <div className="form-group">
                <label>Proje Yöneticisi *</label>
                <select name="projectManagerID" value={formData.projectManagerID} onChange={handleChange} required disabled={!!editingProject}>
                    <option value="">Seçiniz...</option>
                    {managers.map((m) => (
                        <option key={m.userID} value={m.userID}>{m.fullName} ({m.role})</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Başlangıç Tarihi *</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required disabled={!!editingProject} />
            </div>

            <div className="form-group">
                <label>Bitiş Tarihi (opsiyonel)</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
            </div>

            {editingProject && (
                <div className="form-group">
                    <label>Durum</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>
            )}

            {errorMessage && <p className="field-error finance-error">{errorMessage}</p>}

            <div className="form-actions">
                <button type="submit" disabled={saving}>{saving ? "Kaydediliyor..." : editingProject ? "Güncelle" : "Kaydet"}</button>
                {editingProject && <button type="button" className="secondary" onClick={onCancel}>Vazgeç</button>}
            </div>
        </form>
    );
}

export default ProjectForm;