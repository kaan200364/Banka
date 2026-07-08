import { useState, useEffect } from "react";
import { getFinancialSummary, getProjectSummary, getQuotationSummary, downloadReportPdf, downloadReportExcel } from "../api/reportApi";

function ReportsDashboard() {
    const [financial, setFinancial] = useState(null);
    const [projects, setProjects] = useState([]);
    const [quotations, setQuotations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    useEffect(() => {
        loadAll();
    }, [fromDate, toDate]);

    async function loadAll() {
        try {
            setLoading(true);
            const [fin, proj, quo] = await Promise.all([
                getFinancialSummary(fromDate, toDate),
                getProjectSummary(),
                getQuotationSummary(),
            ]);
            setFinancial(fin);
            setProjects(proj);
            setQuotations(quo);
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
                                        <td><span className="badge status-approved">{p.status === "Active" ? "Aktif" : p.status}</span></td>
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
        </div>
    );
}

export default ReportsDashboard;