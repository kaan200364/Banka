import { useState, useEffect } from "react";
import { getContractAttachments, uploadContractAttachment } from "../api/contractApi";

function ContractAttachmentPanel({ contractId }) {
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadAttachments();
    }, [contractId]);

    async function loadAttachments() {
        try {
            const data = await getContractAttachments(contractId);
            setAttachments(data);
        } catch (err) {
            console.error(err);
        }
    }

    async function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            await uploadContractAttachment(contractId, file);
            loadAttachments();
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
                <h4>Sözleşme Dosyaları</h4>
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
        </div>
    );
}

export default ContractAttachmentPanel;