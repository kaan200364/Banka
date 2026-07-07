import { useState, useEffect } from "react";
import { getProjects } from "../api/projectApi";

function ProjectList({ onEdit, refreshTrigger }) {
    const [projects, setProjects] = useState([]);
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
            const result = await getProjects(searchTerm, currentPage, pageSize);
            setProjects(result.items);
            setTotalPages(result.totalPages);
            setError(null);
        } catch (err) {
            setError("Projeler yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="customer-list">
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Proje adı ara..."
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
                                <th>Proje Adı</th>
                                <th>Başlangıç</th>
                                <th>Bitiş</th>
                                <th>Durum</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.length === 0 ? (
                                <tr><td colSpan="5" className="empty-state">Henüz kayıtlı proje yok.</td></tr>
                            ) : (
                                projects.map((p) => (
                                    <tr key={p.projectID}>
                                        <td>{p.projectName}</td>
                                        <td>{new Date(p.startDate).toLocaleDateString("tr-TR")}</td>
                                        <td>{p.endDate ? new Date(p.endDate).toLocaleDateString("tr-TR") : "-"}</td>
                                        <td><span className="badge status-approved">{p.status === "Active" ? "Aktif" : p.status}</span></td>
                                        <td className="actions">
                                            <button onClick={() => onEdit(p)}>Düzenle</button>
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

export default ProjectList;