import { useState, useEffect } from "react";
import { getTaskComments, addTaskComment, getTaskAttachments, uploadTaskAttachment } from "../api/taskApi";

function TaskDetailPanel({ taskId }) {
    const [comments, setComments] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadData();
    }, [taskId]);

    async function loadData() {
        try {
            const [commentsData, attachmentsData] = await Promise.all([
                getTaskComments(taskId),
                getTaskAttachments(taskId),
            ]);
            setComments(commentsData);
            setAttachments(attachmentsData);
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
        </div>
    );
}

export default TaskDetailPanel;