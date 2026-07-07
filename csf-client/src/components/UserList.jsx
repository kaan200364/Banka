import { useState, useEffect } from "react";
import { getAllUsers, updateUserRole, deactivateUser } from "../api/userApi";

function UserList({ currentUserId, refreshTrigger }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

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
            const result = await getAllUsers(searchTerm, currentPage, pageSize);
            setUsers(result.items);
            setTotalPages(result.totalPages);
            setError(null);
        } catch (err) {
            setError("Kullanıcılar yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    }

    async function handleRoleChange(userId, newRole) {
        try {
            await updateUserRole(userId, newRole);
            load();
        } catch (err) {
            alert(err.message || "Rol değiştirilemedi.");
        }
    }

    async function handleDeactivate(userId, fullName) {
        const confirmed = window.confirm(`"${fullName}" pasif hale getirilsin mi?`);
        if (!confirmed) return;

        try {
            await deactivateUser(userId);
            load();
        } catch (err) {
            alert(err.message || "İşlem başarısız oldu.");
        }
    }

    return (
        <div className="customer-list user-list-wrapper">
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Ad, kullanıcı adı veya e-posta ara..."
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
                                <th>Ad Soyad</th>
                                <th>Kullanıcı Adı</th>
                                <th>E-posta</th>
                                <th>Rol</th>
                                <th>Durum</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => {
                                const isSelf = u.userID === currentUserId;
                                return (
                                    <tr key={u.userID}>
                                        <td>{u.fullName}</td>
                                        <td className="mono">{u.username}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u.userID, e.target.value)}
                                                className="status-select"
                                                disabled={isSelf}
                                            >
                                                <option value="Employee">Employee</option>
                                                <option value="Manager">Manager</option>
                                                <option value="Administrator">Administrator</option>
                                            </select>
                                        </td>
                                        <td>
                                            <span className={u.status === "Active" ? "badge status-approved" : "badge status-rejected"}>
                                                {u.status === "Active" ? "Aktif" : "Pasif"}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            {!isSelf && u.status === "Active" && (
                                                <button className="danger" onClick={() => handleDeactivate(u.userID, u.fullName)}>
                                                    Pasif Yap
                                                </button>
                                            )}
                                            {isSelf && <span className="empty-state">(Siz)</span>}
                                        </td>
                                    </tr>
                                );
                            })}
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

export default UserList;