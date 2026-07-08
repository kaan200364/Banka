import { useState, useEffect } from "react";
import { getProjects, getAllUsers } from "../api/projectApi";
import { createTask, getTasks, updateTask } from "../api/taskApi";

function TaskForm({ editingTask, onSaved, onCancel }) {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [existingTasks, setExistingTasks] = useState([]);
    const [formData, setFormData] = useState({
        projectID: "",
        assignedUserID: "",
        parentTaskID: "",
        title: "",
        priority: "Medium",
        dueDate: "",
    });
    const [errorMessage, setErrorMessage] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        Promise.all([getProjects("", 1, 100), getAllUsers(), getTasks("", 1, 100)])
            .then(([projectsResult, userList, tasksResult]) => {
                setProjects(projectsResult.items.filter((p) => p.status === "Active"));
                setUsers(userList);
                setExistingTasks(tasksResult.items.filter((t) => !t.parentTaskID));
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (editingTask) {
            setFormData({
                projectID: editingTask.projectID,
                assignedUserID: editingTask.assignedUserID,
                parentTaskID: editingTask.parentTaskID || "",
                title: editingTask.title,
                priority: editingTask.priority,
                dueDate: editingTask.dueDate ? editingTask.dueDate.split("T")[0] : "",
            });
        } else {
            setFormData({
                projectID: "",
                assignedUserID: "",
                parentTaskID: "",
                title: "",
                priority: "Medium",
                dueDate: "",
            });
        }
        setErrorMessage(null);
    }, [editingTask]);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setErrorMessage(null);

        try {
            if (editingTask) {
                await updateTask(editingTask.taskID, {
                    title: formData.title,
                    assignedUserID: formData.assignedUserID,
                    priority: formData.priority,
                    dueDate: formData.dueDate || null,
                });
            } else {
                await createTask({
                    ...formData,
                    parentTaskID: formData.parentTaskID || null,
                    dueDate: formData.dueDate || null,
                });
            }
            setFormData({
                projectID: "",
                assignedUserID: "",
                parentTaskID: "",
                title: "",
                priority: "Medium",
                dueDate: "",
            });
            onSaved();
        } catch (err) {
            setErrorMessage(err.message || "İşlem sırasında bir hata oluştu.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form className="customer-form" onSubmit={handleSubmit}>
            <h2>{editingTask ? "Görevi Düzenle" : "Yeni Görev Oluştur"}</h2>

            <div className="form-group">
                <label>Proje *</label>
                <select name="projectID" value={formData.projectID} onChange={handleChange} required disabled={!!editingTask}>
                    <option value="">Seçiniz...</option>
                    {projects.map((p) => (
                        <option key={p.projectID} value={p.projectID}>{p.projectName}</option>
                    ))}
                </select>
            </div>

            {!editingTask && (
                <div className="form-group">
                    <label>Ana Görev (opsiyonel — alt görev oluşturmak için seçin)</label>
                    <select name="parentTaskID" value={formData.parentTaskID} onChange={handleChange}>
                        <option value="">Yok (bağımsız görev)</option>
                        {existingTasks
                            .filter((t) => t.projectID === formData.projectID)
                            .map((t) => (
                                <option key={t.taskID} value={t.taskID}>{t.title}</option>
                            ))}
                    </select>
                </div>
            )}

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
                <button type="submit" disabled={saving}>{saving ? "Kaydediliyor..." : editingTask ? "Güncelle" : "Kaydet"}</button>
                {editingTask && (
                    <button type="button" className="secondary" onClick={onCancel}>Vazgeç</button>
                )}
            </div>
        </form>
    );
}

export default TaskForm;