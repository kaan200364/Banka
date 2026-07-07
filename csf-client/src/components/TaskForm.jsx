import { useState, useEffect } from "react";
import { getProjects, getAllUsers } from "../api/projectApi";
import { createTask } from "../api/taskApi";

function TaskForm({ onSaved }) {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        projectID: "",
        assignedUserID: "",
        title: "",
        priority: "Medium",
        dueDate: "",
    });
    const [errorMessage, setErrorMessage] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        Promise.all([getProjects("", 1, 100), getAllUsers()])
            .then(([projectsResult, userList]) => {
                setProjects(projectsResult.items.filter((p) => p.status === "Active"));
                setUsers(userList);
            })
            .catch(console.error);
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setErrorMessage(null);

        try {
            await createTask({ ...formData, dueDate: formData.dueDate || null });
            setFormData({ projectID: "", assignedUserID: "", title: "", priority: "Medium", dueDate: "" });
            onSaved();
        } catch (err) {
            setErrorMessage(err.message || "Görev oluşturulamadı.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form className="customer-form" onSubmit={handleSubmit}>
            <h2>Yeni Görev Oluştur</h2>

            <div className="form-group">
                <label>Proje *</label>
                <select name="projectID" value={formData.projectID} onChange={handleChange} required>
                    <option value="">Seçiniz...</option>
                    {projects.map((p) => (
                        <option key={p.projectID} value={p.projectID}>{p.projectName}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Atanacak Kişi *</label>
                <select name="assignedUserID" value={formData.assignedUserID} onChange={handleChange} required>
                    <option value="">Seçiniz...</option>
                    {users.map((u) => (
                        <option key={u.userID} value={u.userID}>{u.fullName} ({u.role})</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Başlık *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required />
            </div>

            <div className="form-group">
                <label>Öncelik</label>
                <select name="priority" value={formData.priority} onChange={handleChange}>
                    <option value="Low">Düşük</option>
                    <option value="Medium">Orta</option>
                    <option value="High">Yüksek</option>
                </select>
            </div>

            <div className="form-group">
                <label>Son Tarih (opsiyonel)</label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} />
            </div>

            {errorMessage && <p className="field-error finance-error">{errorMessage}</p>}

            <div className="form-actions">
                <button type="submit" disabled={saving}>{saving ? "Kaydediliyor..." : "Kaydet"}</button>
            </div>
        </form>
    );
}

export default TaskForm;