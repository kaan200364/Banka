import { useState, useEffect } from "react";
import { getFinancialSummary, getProjectSummary, getQuotationSummary, downloadReportPdf, downloadReportExcel, getDashboardSummary, getCustomerReport, getSupplierReport, getBankReport, getContractReport, getTaskReport } from "../api/reportApi";

const PROJECT_STATUS_LABELS = {
    Active: "Aktif",
    Completed: "Tamamlandı",
    OnHold: "Beklemede",
    Cancelled: "İptal Edildi",
};

function getProjectBadgeClass(status) {
    switch (status) {
        case "Active": return "status-approved";
        case "Completed": return "status-approved";
        case "OnHold": return "status-draft";
        case "Cancelled": return "status-rejected";
        default: return "status-draft";
    }
}

function ReportsDashboard() {
    const [financial, setFinancial] = useState(null);
    const [projects, setProjects] = useState([]);
    const [quotations, setQuotations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [dashboard, setDashboard] = useState(null);
    const [customerReport, setCustomerReport] = useState([]);
    const [supplierReport, setSupplierReport] = useState([]);
    const [bankReport, setBankReport] = useState([]);
    const [contractReport, setContractReport] = useState(null);
    const [taskReport, setTaskReport] = useState(null);

    useEffect(() => {
        loadAll();
    }, [fromDate, toDate]);

    async function loadAll() {
        try {
            setLoading(true);
            const [fin, proj, quo, dash, custRep, supRep, bankRep, contRep, taskRep] = await Promise.all([
                getFinancialSummary(fromDate, toDate),
                getProjectSummary(),
                getQuotationSummary(),
                getDashboardSummary(),
                getCustomerReport(),
                getSupplierReport(),
                getBankReport(),
                getContractReport(),
                getTaskReport(),
            ]);
            setFinancial(fin);
            setProjects(proj);
            setQuotations(quo);
            setDashboard(dash);
            setCustomerReport(custRep);
            setSupplierReport(supRep);
            setBankReport(bankRep);
            setContractReport(contRep);
            setTaskReport(taskRep);
            setError(null);
        } catch (err) {
            setError("Raporlar yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    }

    function formatMoney(amount) {
        return amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 });
    }

    function handleClearFilter() {
        setFromDate("");
        setToDate("");
    }

    async function handleDownloadPdf() {
        try {
            await downloadReportPdf(fromDate, toDate);
        } catch (err) {
            alert("PDF indirilemedi.");
        }
    }

    async function handleDownloadExcel() {
        try {
            await downloadReportExcel(fromDate, toDate);
        } catch (err) {
            alert("Excel indirilemedi.");
        }
    }

    if (loading) return <p className="status-text">Yükleniyor...</p>;
    if (error) return <p className="status-text error">{error}</p>;

    return (
        <div className="dashboard">
            <h2 className="dashboard-title">Genel Bakış</h2>

            <div className="date-filter-bar">
                <label>
                    Başlangıç:
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </label>
                <label>
                    Bitiş:
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </label>
                {(fromDate || toDate) && (
                    <button type="button" className="secondary" onClick={handleClearFilter}>
                        Filtreyi Temizle
                    </button>
                )}
                <button type="button" onClick={handleDownloadPdf}>PDF İndir</button>
                <button type="button" onClick={handleDownloadExcel}>Excel İndir</button>
            </div>

            <div className="stat-cards">
                <div className="stat-card stat-balance">
                    <span className="stat-label">Toplam Cari</span>
                    <span className="stat-value">{dashboard.totalCustomers}</span>
                </div>
                <div className="stat-card stat-balance">
                    <span className="stat-label">Toplam Tedarikçi</span>
                    <span className="stat-value">{dashboard.totalSuppliers}</span>
                </div>
                <div className="stat-card stat-income">
                    <span className="stat-label">Toplam Banka Bakiyesi</span>
                    <span className="stat-value">{formatMoney(dashboard.totalBankBalance)} TRY</span>
                </div>
                <div className="stat-card stat-quotation">
                    <span className="stat-label">Aktif Proje</span>
                    <span className="stat-value">{dashboard.activeProjectsCount}</span>
                </div>
                <div className="stat-card stat-expense">
                    <span className="stat-label">Bekleyen Görev</span>
                    <span className="stat-value">{dashboard.pendingTasksCount}</span>
                </div>
            </div>

            <div className="stat-cards">
                <div className="stat-card stat-income">
                    <span className="stat-label">Toplam Gelir</span>
                    <span className="stat-value">{formatMoney(financial.totalIncome)} TRY</span>
                    <span className="stat-sub">{financial.incomeCount} işlem</span>
                </div>
                <div className="stat-card stat-expense">
                    <span className="stat-label">Toplam Gider</span>
                    <span className="stat-value">{formatMoney(financial.totalExpense)} TRY</span>
                    <span className="stat-sub">{financial.expenseCount} işlem</span>
                </div>
                <div className="stat-card stat-balance">
                    <span className="stat-label">Net Bakiye</span>
                    <span className="stat-value">{formatMoney(financial.netBalance)} TRY</span>
                </div>
                <div className="stat-card stat-quotation">
                    <span className="stat-label">Onaylı Teklif Tutarı</span>
                    <span className="stat-value">{formatMoney(quotations.totalApprovedAmount)} TRY</span>
                    <span className="stat-sub">{quotations.approvedCount} / {quotations.totalQuotations} onaylı</span>
                </div>
            </div>

            <h2 className="dashboard-title">Proje İlerlemesi</h2>
            <div className="customer-list">
                <table>
                    <thead>
                        <tr>
                            <th>Proje Adı</th>
                            <th>Durum</th>
                            <th>Görev İlerlemesi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.length === 0 ? (
                            <tr><td colSpan="3" className="empty-state">Henüz proje yok.</td></tr>
                        ) : (
                            projects.map((p) => {
                                const percent = p.totalTasks === 0 ? 0 : Math.round((p.completedTasks / p.totalTasks) * 100);
                                return (
                                    <tr key={p.projectID}>
                                        <td>{p.projectName}</td>
                                        <td><span className={`badge ${getProjectBadgeClass(p.status)}`}>{PROJECT_STATUS_LABELS[p.status] || p.status}</span></td>
                                        <td>
                                            <div className="progress-bar-wrapper">
                                                <div className="progress-bar" style={{ width: `${percent}%` }} />
                                            </div>
                                            <span className="progress-text">{p.completedTasks} / {p.totalTasks} görev ({percent}%)</span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <h2 className="dashboard-title">Cari Bazlı Gelir Raporu</h2>
            <div className="customer-list">
                <table>
                    <thead>
                        <tr>
                            <th>Şirket Adı</th>
                            <th>Toplam Gelir</th>
                            <th>İşlem Sayısı</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customerReport.length === 0 ? (
                            <tr><td colSpan="3" className="empty-state">Henüz veri yok.</td></tr>
                        ) : (
                            customerReport.map((c) => (
                                <tr key={c.customerID}>
                                    <td>{c.companyName}</td>
                                    <td className="mono amount-income">{c.totalIncomeAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TRY</td>
                                    <td>{c.transactionCount}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <h2 className="dashboard-title">Tedarikçi Bazlı Gider Raporu</h2>
            <div className="customer-list">
                <table>
                    <thead>
                        <tr>
                            <th>Şirket Adı</th>
                            <th>Toplam Gider</th>
                            <th>İşlem Sayısı</th>
                        </tr>
                    </thead>
                    <tbody>
                        {supplierReport.length === 0 ? (
                            <tr><td colSpan="3" className="empty-state">Henüz veri yok.</td></tr>
                        ) : (
                            supplierReport.map((s) => (
                                <tr key={s.supplierID}>
                                    <td>{s.companyName}</td>
                                    <td className="mono amount-expense">{s.totalExpenseAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TRY</td>
                                    <td>{s.transactionCount}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <h2 className="dashboard-title">Banka Hesapları Raporu</h2>
            <div className="customer-list">
                <table>
                    <thead>
                        <tr>
                            <th>Banka Adı</th>
                            <th>Bakiye</th>
                            <th>İşlem Sayısı</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bankReport.length === 0 ? (
                            <tr><td colSpan="3" className="empty-state">Henüz veri yok.</td></tr>
                        ) : (
                            bankReport.map((b) => (
                                <tr key={b.bankAccountID}>
                                    <td>{b.bankName}</td>
                                    <td className="mono">{b.balance.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TRY</td>
                                    <td>{b.transactionCount}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <h2 className="dashboard-title">Sözleşme Özeti</h2>
            <div className="stat-cards">
                <div className="stat-card stat-balance">
                    <span className="stat-label">Toplam Sözleşme</span>
                    <span className="stat-value">{contractReport.totalContracts}</span>
                </div>
                <div className="stat-card stat-income">
                    <span className="stat-label">Aktif</span>
                    <span className="stat-value">{contractReport.activeCount}</span>
                </div>
                <div className="stat-card stat-expense">
                    <span className="stat-label">Feshedilen</span>
                    <span className="stat-value">{contractReport.terminatedCount}</span>
                </div>
                <div className="stat-card stat-quotation">
                    <span className="stat-label">30 Gün İçinde Bitecek</span>
                    <span className="stat-value">{contractReport.expiringSoonCount}</span>
                </div>
            </div>

            <h2 className="dashboard-title">Görev Özeti</h2>
            <div className="stat-cards">
                <div className="stat-card stat-balance">
                    <span className="stat-label">Toplam Görev</span>
                    <span className="stat-value">{taskReport.totalTasks}</span>
                </div>
                <div className="stat-card stat-quotation">
                    <span className="stat-label">Bekliyor</span>
                    <span className="stat-value">{taskReport.pendingCount}</span>
                </div>
                <div className="stat-card stat-income">
                    <span className="stat-label">Tamamlandı</span>
                    <span className="stat-value">{taskReport.completedCount}</span>
                </div>
                <div className="stat-card stat-expense">
                    <span className="stat-label">Süresi Geçmiş</span>
                    <span className="stat-value">{taskReport.overdueCount}</span>
                </div>
            </div>
        </div>
    );
}

export default ReportsDashboard;