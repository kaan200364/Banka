import { useState, useEffect } from "react";
import { getCustomers, deactivateCustomer } from "../api/customerApi";

function CustomerList({ onEdit, refreshTrigger }) {
    const [customers, setCustomers] = useState([]);
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
            loadCustomers();
        }, 400);
        return () => clearTimeout(delayDebounce);
    }, [refreshTrigger, searchTerm, currentPage]);

    async function loadCustomers() {
        try {
            setLoading(true);
            const result = await getCustomers(searchTerm, currentPage, pageSize);
            setCustomers(result.items);
            setTotalPages(result.totalPages);
            setError(null);
        } catch (err) {
            setError("Cariler yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id, companyName) {
        const confirmed = window.confirm(`"${companyName}" pasif hale getirilsin mi?`);
        if (!confirmed) return;

        try {
            await deactivateCustomer(id);
            loadCustomers();
        } catch (err) {
            alert("Silme işlemi başarısız oldu.");
        }
    }

    return (
        <div className="customer-list">
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Şirket adı, yetkili kişi veya e-posta ara..."
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
                                <th>Şirket Adı</th>
                                <th>Yetkili Kişi</th>
                                <th>Telefon</th>
                                <th>E-posta</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="empty-state">
                                        Henüz kayıtlı cari yok.
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer.customerID}>
                                        <td>{customer.companyName}</td>
                                        <td>{customer.contactPerson || "-"}</td>
                                        <td>{customer.phone || "-"}</td>
                                        <td>{customer.email || "-"}</td>
                                        <td className="actions">
                                            <button onClick={() => onEdit(customer)}>Düzenle</button>
                                            <button
                                                className="danger"
                                                onClick={() => handleDelete(customer.customerID, customer.companyName)}
                                            >
                                                Sil
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                            >
                                Önceki
                            </button>
                            <span>Sayfa {currentPage} / {totalPages}</span>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                            >
                                Sonraki
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default CustomerList;