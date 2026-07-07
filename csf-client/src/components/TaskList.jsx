import { useState, useEffect } from "react";
import { getTasks, updateTaskStatus } from "../api/taskApi";

const STATUS_LABELS = { Pending: "Bekliyor", InProgress: "Devam Ediyor", Completed: "Tamamlandı" };
const PRIORITY_LABELS = { Low: "Düşük", Medium: "Orta", High: "Yüksek" };

function TaskList({ currentUser, refreshTrigger }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    const isManagerOrAdmin = currentUser.role === "Manager" || currentUser.role === "Administrator";

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            load();
        }, 400);
        return () => clearTimeout(delayDebounce);
    }, [refreshTrigger, searchTerm, currentPage]);

    async function load() {
        try {
            setLoading(true);
            const result = await getTasks(searchTerm, currentPage, pageSize);
            const visible = isManagerOrAdmin
                ? result.items
                : result.items.filter((t) => t.assignedUserID === currentUser.userID);
            setTasks(visible);
            setTotalPages(result.totalPages);
            setError(null);
        } catch (err) {
            setError("Görevler yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusChange(taskId, newStatus) {
        try {
            await updateTaskStatus(taskId, newStatus);
            load();
        } catch (err) {
            alert(err.message || "Durum güncellenemedi.");
        }
    }

    return (
        <div className="customer-list">
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Görev başlığı ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading && <p className="status-text">Yükleniyor...</p>}
            {error && <p className="status-text error">{error}</p>}

            {!loading && !error && (
                <>
                    <table>
                        <thead>
                            <tr>
                                <th>Başlık</th>
                                <th>Öncelik</th>
                                <th>Son Tarih</th>
                                <th>Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.length === 0 ? (
                                <tr><td colSpan="4" className="empty-state">Henüz kayıtlı görev yok.</td></tr>
                            ) : (
                                tasks.map((t) => (
                                    <tr key={t.taskID}>
                                        <td>{t.title}</td>
                                        <td>{PRIORITY_LABELS[t.priority]}</td>
                                        <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString("tr-TR") : "-"}</td>
                                        <td>
                                            <select
                                                value={t.status}
                                                onChange={(e) => handleStatusChange(t.taskID, e.target.value)}
                                                className="status-select"
                                            >
                                                <option value="Pending">Bekliyor</option>
                                                <option value="InProgress">Devam Ediyor</option>
                                                <option value="Completed">Tamamlandı</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Önceki</button>
                            <span>Sayfa {currentPage} / {totalPages}</span>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Sonraki</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default TaskList;