import { useState, useEffect } from "react";
import {
    getTaskComments, addTaskComment,
    getTaskAttachments, uploadTaskAttachment,
    getTaskDependencies, addTaskDependency, removeTaskDependency,
    getTaskActivity,
    getTasks,
} from "../api/taskApi";

function TaskDetailPanel({ taskId, currentProjectId }) {
    const [comments, setComments] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [uploading, setUploading] = useState(false);
    const [dependencies, setDependencies] = useState([]);
    const [availableTasks, setAvailableTasks] = useState([]);
    const [selectedDependency, setSelectedDependency] = useState("");
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        loadData();
    }, [taskId]);

    async function loadData() {
        try {
            const [commentsData, attachmentsData, dependenciesData, allTasksResult, activityData] = await Promise.all([
                getTaskComments(taskId),
                getTaskAttachments(taskId),
                getTaskDependencies(taskId),
                getTasks("", 1, 100),
                getTaskActivity(taskId),
            ]);
            setComments(commentsData);
            setAttachments(attachmentsData);
            setDependencies(dependenciesData);
            setAvailableTasks(
                allTasksResult.items.filter((t) => t.projectID === currentProjectId && t.taskID !== taskId)
            );
            setActivities(activityData);
        } catch (err) {
            console.error(err);
        }
    }

    async function handleAddComment(e) {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await addTaskComment(taskId, newComment);
            setNewComment("");
            loadData();
        } catch (err) {
            alert(err.message || "Yorum eklenemedi.");
        }
    }

    async function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            await uploadTaskAttachment(taskId, file);
            loadData();
        } catch (err) {
            alert(err.message || "Dosya yüklenemedi.");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    }

    async function handleAddDependency() {
        if (!selectedDependency) return;
        try {
            await addTaskDependency(taskId, selectedDependency);
            setSelectedDependency("");
            loadData();
        } catch (err) {
            alert(err.message || "Bağımlılık eklenemedi.");
        }
    }

    async function handleRemoveDependency(dependencyId) {
        try {
            await removeTaskDependency(dependencyId);
            loadData();
        } catch (err) {
            alert(err.message || "Bağımlılık kaldırılamadı.");
        }
    }

    return (
        <div className="task-detail-panel">
            <div className="task-detail-section">
                <h4>Dosyalar</h4>
                {attachments.length === 0 ? (
                    <p className="empty-state">Henüz dosya eklenmemiş.</p>
                ) : (
                    <ul className="attachment-list">
                        {attachments.map((a) => (
                            <li key={a.attachmentID}>
                                📎 {a.fileName}
                                <span className="attachment-meta"> — {a.uploadedBy}, {new Date(a.uploadedAt).toLocaleDateString("tr-TR")}</span>
                            </li>
                        ))}
                    </ul>
                )}
                <label className="upload-btn">
                    {uploading ? "Yükleniyor..." : "Dosya Ekle"}
                    <input type="file" onChange={handleFileChange} disabled={uploading} hidden />
                </label>
            </div>

            <div className="task-detail-section">
                <h4>Yorumlar</h4>
                {comments.length === 0 ? (
                    <p className="empty-state">Henüz yorum yok.</p>
                ) : (
                    <ul className="comment-list">
                        {comments.map((c) => (
                            <li key={c.commentID}>
                                <strong>{c.userFullName}</strong>
                                <span className="comment-date">{new Date(c.createdAt).toLocaleString("tr-TR")}</span>
                                <p>{c.content}</p>
                            </li>
                        ))}
                    </ul>
                )}
                <form onSubmit={handleAddComment} className="comment-form">
                    <input
                        type="text"
                        placeholder="Bir yorum yazın..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button type="submit">Gönder</button>
                </form>
            </div>

            <div className="task-detail-section">
                <h4>Bağımlılıklar</h4>
                {dependencies.length === 0 ? (
                    <p className="empty-state">Bu görevin bağımlılığı yok.</p>
                ) : (
                    <ul className="attachment-list">
                        {dependencies.map((d) => (
                            <li key={d.taskDependencyID}>
                                <span className={d.dependsOnTaskStatus === "Completed" ? "amount-income" : "amount-expense"}>
                                    {d.dependsOnTaskStatus === "Completed" ? "✓" : "⏳"}
                                </span>{" "}
                                {d.dependsOnTaskTitle}
                                <button
                                    className="danger"
                                    style={{ marginLeft: "0.5rem", padding: "0.2rem 0.5rem", fontSize: "0.7rem" }}
                                    onClick={() => handleRemoveDependency(d.taskDependencyID)}
                                >
                                    Kaldır
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <select value={selectedDependency} onChange={(e) => setSelectedDependency(e.target.value)}>
                        <option value="">Görev seçin...</option>
                        {availableTasks.map((t) => (
                            <option key={t.taskID} value={t.taskID}>{t.title}</option>
                        ))}
                    </select>
                    <button onClick={handleAddDependency}>Ekle</button>
                </div>
            </div>

            <div className="task-detail-section">
                <h4>Aktivite Geçmişi</h4>
                {activities.length === 0 ? (
                    <p className="empty-state">Henüz aktivite kaydı yok.</p>
                ) : (
                    <ul className="comment-list">
                        {activities.map((a) => (
                            <li key={a.activityID}>
                                <span className="comment-date">{new Date(a.timestamp).toLocaleString("tr-TR")}</span>
                                <p>{a.description}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default TaskDetailPanel;