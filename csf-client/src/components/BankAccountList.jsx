import { useState, useEffect } from "react";
import { getBankAccounts, getBankTransactions, deactivateBankAccount } from "../api/bankAccountApi";

function BankAccountList({ onEdit, refreshTrigger }) {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            loadAccounts();
        }, 400);
        return () => clearTimeout(delayDebounce);
    }, [refreshTrigger, searchTerm, currentPage]);

    async function loadAccounts() {
        try {
            setLoading(true);
            const result = await getBankAccounts(searchTerm, currentPage, pageSize);
            setAccounts(result.items);
            setTotalPages(result.totalPages);
            setError(null);
        } catch (err) {
            setError("Banka hesapları yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    }

    async function handleShowTransactions(accountId) {
        if (selectedAccountId === accountId) {
            setSelectedAccountId(null);
            return;
        }
        const data = await getBankTransactions(accountId);
        setTransactions(data);
        setSelectedAccountId(accountId);
    }

    async function handleDeactivate(id, bankName) {
        const confirmed = window.confirm(`"${bankName}" pasif hale getirilsin mi?`);
        if (!confirmed) return;

        try {
            await deactivateBankAccount(id);
            loadAccounts();
        } catch (err) {
            alert(err.message || "İşlem başarısız oldu.");
        }
    }

    function formatCurrency(amount, currency) {
        return `${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ${currency}`;
    }

    return (
        <div className="customer-list">
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Banka adı veya IBAN ara..."
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
                                <th>Banka</th>
                                <th>IBAN</th>
                                <th>Bakiye</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="empty-state">Henüz kayıtlı banka hesabı yok.</td>
                                </tr>
                            ) : (
                                accounts.map((account) => (
                                    <>
                                        <tr key={account.bankAccountID}>
                                            <td>{account.bankName}</td>
                                            <td className="mono">{account.iban}</td>
                                            <td className="mono">{formatCurrency(account.balance, account.currency)}</td>
                                            <td className="actions">
                                                <button onClick={() => onEdit(account)}>Düzenle</button>
                                                <button className="danger" onClick={() => handleDeactivate(account.bankAccountID, account.bankName)}>
                                                    Sil
                                                </button>
                                                <button onClick={() => handleShowTransactions(account.bankAccountID)}>
                                                    {selectedAccountId === account.bankAccountID ? "Gizle" : "Hareketler"}
                                                </button>
                                            </td>
                                        </tr>
                                        {selectedAccountId === account.bankAccountID && (
                                            <tr className="transaction-row">
                                                <td colSpan="4">
                                                    {transactions.length === 0 ? (
                                                        <p className="empty-state">Bu hesapta henüz hareket yok.</p>
                                                    ) : (
                                                        <table className="sub-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Tarih</th>
                                                                    <th>Tür</th>
                                                                    <th>Tutar</th>
                                                                    <th>Açıklama</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {transactions.map((t) => (
                                                                    <tr key={t.transactionID}>
                                                                        <td>{new Date(t.transactionDate).toLocaleDateString("tr-TR")}</td>
                                                                        <td>{t.transactionType === "Income" ? "Gelir" : "Gider"}</td>
                                                                        <td className="mono">{formatCurrency(t.amount, account.currency)}</td>
                                                                        <td>{t.description || "-"}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    )}
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

export default BankAccountList;