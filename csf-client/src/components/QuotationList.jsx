import { useState, useEffect } from "react";
import { getQuotations, approveQuotation, rejectQuotation } from "../api/quotationApi";

const STATUS_LABELS = {
    Draft: "Taslak",
    Approved: "Onaylandı",
    Rejected: "Reddedildi",
    Expired: "Süresi Doldu",
};

function QuotationList({ userRole, onEdit, refreshTrigger }) {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    const canApprove = userRole === "Administrator";

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
            const result = await getQuotations(searchTerm, currentPage, pageSize);
            setQuotations(result.items);
            setTotalPages(result.totalPages);
            setError(null);
        } catch (err) {
            setError("Teklifler yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    }

    async function handleApprove(id) {
        try {
            await approveQuotation(id);
            load();
        } catch (err) {
            alert(err.message || "Onaylama başarısız oldu.");
        }
    }

    async function handleReject(id) {
        const confirmed = window.confirm("Bu teklifi reddetmek istediğinize emin misiniz?");
        if (!confirmed) return;

        try {
            await rejectQuotation(id);
            load();
        } catch (err) {
            alert(err.message || "Reddetme başarısız oldu.");
        }
    }

    return (
        <div className="customer-list">
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Teklif numarası ara..."
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
                                <th>Teklif No</th>
                                <th>Tutar</th>
                                <th>Durum</th>
                                <th>Geçerlilik</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotations.length === 0 ? (
                                <tr><td colSpan="5" className="empty-state">Henüz kayıtlı teklif yok.</td></tr>
                            ) : (
                                quotations.map((q) => (
                                    <tr key={q.quotationID}>
                                        <td className="mono">{q.quotationNumber}</td>
                                        <td className="mono">{q.totalAmount.toLocaleString("tr-TR")} {q.currency}</td>
                                        <td><span className={`badge status-${q.status.toLowerCase()}`}>{STATUS_LABELS[q.status]}</span></td>
                                        <td>{new Date(q.expiryDate).toLocaleDateString("tr-TR")}</td>
                                        <td className="actions">
                                            {q.status === "Draft" && (
                                                <button onClick={() => onEdit(q)}>Düzenle</button>
                                            )}
                                            {canApprove && q.status === "Draft" && (
                                                <button onClick={() => handleApprove(q.quotationID)}>Onayla</button>
                                            )}
                                            {canApprove && q.status === "Draft" && (
                                                <button className="danger" onClick={() => handleReject(q.quotationID)}>Reddet</button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                                Önceki
                            </button>
                            <span>Sayfa {currentPage} / {totalPages}</span>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                                Sonraki
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default QuotationList;