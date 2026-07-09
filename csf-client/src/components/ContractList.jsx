import { useState, useEffect } from "react";
import { getContracts, terminateContract, renewContract } from "../api/contractApi";
import ContractAttachmentPanel from "./ContractAttachmentPanel";

const STATUS_LABELS = {
    Active: "Aktif",
    Terminated: "Feshedildi",
    Renewed: "Yenilendi",
};

function getContractBadgeClass(status) {
    switch (status) {
        case "Active": return "status-approved";
        case "Terminated": return "status-rejected";
        case "Renewed": return "status-expired";
        default: return "status-draft";
    }
}

function ContractList({ refreshTrigger }) {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [renewingId, setRenewingId] = useState(null);
    const [newEndDate, setNewEndDate] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [expandedContractId, setExpandedContractId] = useState(null);
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
            const result = await getContracts(searchTerm, currentPage, pageSize);
            setContracts(result.items);
            setTotalPages(result.totalPages);
            setError(null);
        } catch (err) {
            setError("Sözleşmeler yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    }

    async function handleTerminate(id) {
        const reason = window.prompt("Fesih sebebini girin:");
        if (!reason) return;

        try {
            await terminateContract(id, reason);
            load();
        } catch (err) {
            alert(err.message || "Fesih işlemi başarısız oldu.");
        }
    }

    async function handleRenewSubmit(id) {
        if (!newEndDate) {
            alert("Lütfen yeni bitiş tarihi seçin.");
            return;
        }
        try {
            await renewContract(id, newEndDate);
            setRenewingId(null);
            setNewEndDate("");
            load();
        } catch (err) {
            alert(err.message || "Yenileme işlemi başarısız oldu.");
        }
    }

    return (
        <div className="customer-list">
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Sözleşme numarası ara..."
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
                                <th>Sözleşme No</th>
                                <th>Başlangıç</th>
                                <th>Bitiş</th>
                                <th>Durum</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contracts.length === 0 ? (
                                <tr><td colSpan="5" className="empty-state">Henüz kayıtlı sözleşme yok.</td></tr>
                            ) : (
                                contracts.map((c) => (
                                    <>
                                        <tr key={c.contractID}>
                                            <td className="mono">{c.contractNumber}</td>
                                            <td>{new Date(c.startDate).toLocaleDateString("tr-TR")}</td>
                                            <td>{new Date(c.endDate).toLocaleDateString("tr-TR")}</td>
                                            <td><span className={`badge ${getContractBadgeClass(c.status)}`}>{STATUS_LABELS[c.status] || c.status}</span></td>
                                            <td className="actions">
                                                {c.status === "Active" && renewingId !== c.contractID && (
                                                    <>
                                                        <button onClick={() => setRenewingId(c.contractID)}>Yenile</button>
                                                        <button className="danger" onClick={() => handleTerminate(c.contractID)}>Feshet</button>
                                                    </>
                                                )}
                                                {renewingId === c.contractID && (
                                                    <div className="renew-inline">
                                                        <input
                                                            type="date"
                                                            value={newEndDate}
                                                            onChange={(e) => setNewEndDate(e.target.value)}
                                                        />
                                                        <button onClick={() => handleRenewSubmit(c.contractID)}>Onayla</button>
                                                        <button className="secondary" onClick={() => setRenewingId(null)}>Vazgeç</button>
                                                    </div>
                                                )}
                                                <button onClick={() => setExpandedContractId(expandedContractId === c.contractID ? null : c.contractID)}>
                                                    {expandedContractId === c.contractID ? "Gizle" : "Dosyalar"}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedContractId === c.contractID && (
                                            <tr>
                                                <td colSpan="5">
                                                    <ContractAttachmentPanel contractId={c.contractID} />
                                                </td>
                                            </tr>
                                        )}
                                    </>
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

export default ContractList;