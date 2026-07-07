import { useState, useEffect } from "react";
import { getIncomes, getExpenses } from "../api/financeApi";

function FinanceList({ refreshTrigger }) {
    const [transactions, setTransactions] = useState([]);
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
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr><td colSpan="5" className="empty-state">Henüz kayıtlı gelir/gider yok.</td></tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={`${t.type}-${t.incomeID || t.expenseID}`}>
                                        <td>{new Date(t.transactionDate).toLocaleDateString("tr-TR")}</td>
                                        <td>
                                            <span className={t.type === "Income" ? "badge badge-income" : "badge badge-expense"}>
                                                {t.type === "Income" ? "Gelir" : "Gider"}
                                            </span>
                                        </td>
                                        <td>{t.category || "-"}</td>
                                        <td className={t.type === "Income" ? "mono amount-income" : "mono amount-expense"}>
                                            {t.type === "Income" ? "+" : "-"}
                                            {t.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                        </td>
                                        <td>{t.description || "-"}</td>
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

export default FinanceList;