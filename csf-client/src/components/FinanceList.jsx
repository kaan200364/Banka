import { useState, useEffect } from "react";
import { getIncomes, getExpenses, updateIncome, deleteIncome, updateExpense, deleteExpense } from "../api/financeApi";

function FinanceList({ refreshTrigger }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [editingId, setEditingId] = useState(null);
    const [editCategory, setEditCategory] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const pageSize = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            loadTransactions();
        }, 400);
        return () => clearTimeout(delayDebounce);
    }, [refreshTrigger, searchTerm, currentPage]);

    async function loadTransactions() {
        try {
            setLoading(true);
            const [incomesResult, expensesResult] = await Promise.all([
                getIncomes(searchTerm, currentPage, pageSize),
                getExpenses(searchTerm, currentPage, pageSize),
            ]);

            const combined = [
                ...incomesResult.items.map((i) => ({ ...i, type: "Income" })),
                ...expensesResult.items.map((e) => ({ ...e, type: "Expense" })),
            ].sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));

            setTransactions(combined);
            setTotalPages(Math.max(incomesResult.totalPages, expensesResult.totalPages));
            setError(null);
        } catch (err) {
            setError("Hareketler yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    }

    function startEdit(t) {
        setEditingId(`${t.type}-${t.incomeID || t.expenseID}`);
        setEditCategory(t.category || "");
        setEditDescription(t.description || "");
    }

    function cancelEdit() {
        setEditingId(null);
        setEditCategory("");
        setEditDescription("");
    }

    async function handleUpdate(t) {
        try {
            const data = { category: editCategory, description: editDescription };
            if (t.type === "Income") {
                await updateIncome(t.incomeID, data);
            } else {
                await updateExpense(t.expenseID, data);
            }
            setEditingId(null);
            loadTransactions();
        } catch (err) {
            alert(err.message || "Güncelleme başarısız oldu.");
        }
    }

    async function handleDelete(t) {
        const confirmed = window.confirm("Bu kaydı silmek istediğinize emin misiniz? Bakiye buna göre güncellenecek.");
        if (!confirmed) return;

        try {
            if (t.type === "Income") {
                await deleteIncome(t.incomeID);
            } else {
                await deleteExpense(t.expenseID);
            }
            loadTransactions();
        } catch (err) {
            alert(err.message || "Silme başarısız oldu.");
        }
    }

    return (
        <div className="customer-list">
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Kategori ara..."
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
                                <th>Tarih</th>
                                <th>Tür</th>
                                <th>Kategori</th>
                                <th>Tutar</th>
                                <th>Açıklama</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr><td colSpan="6" className="empty-state">Henüz kayıtlı gelir/gider yok.</td></tr>
                            ) : (
                                transactions.map((t) => {
                                    const rowId = `${t.type}-${t.incomeID || t.expenseID}`;
                                    const isEditing = editingId === rowId;

                                    return (
                                        <tr key={rowId}>
                                            <td>{new Date(t.transactionDate).toLocaleDateString("tr-TR")}</td>
                                            <td>
                                                <span className={t.type === "Income" ? "badge badge-income" : "badge badge-expense"}>
                                                    {t.type === "Income" ? "Gelir" : "Gider"}
                                                </span>
                                            </td>
                                            <td>
                                                {isEditing ? (
                                                    <input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} />
                                                ) : (
                                                    t.category || "-"
                                                )}
                                            </td>
                                            <td className={t.type === "Income" ? "mono amount-income" : "mono amount-expense"}>
                                                {t.type === "Income" ? "+" : "-"}
                                                {t.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                            </td>
                                            <td>
                                                {isEditing ? (
                                                    <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                                                ) : (
                                                    t.description || "-"
                                                )}
                                            </td>
                                            <td className="actions">
                                                {isEditing ? (
                                                    <>
                                                        <button onClick={() => handleUpdate(t)}>Kaydet</button>
                                                        <button className="secondary" onClick={cancelEdit}>Vazgeç</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => startEdit(t)}>Düzenle</button>
                                                        <button className="danger" onClick={() => handleDelete(t)}>Sil</button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
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

export default FinanceList;