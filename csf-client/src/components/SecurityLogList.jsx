import { useState, useEffect } from "react";
import { getSecurityLogs } from "../api/userApi";

function SecurityLogList() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSecurityLogs()
            .then(setLogs)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="status-text">Yükleniyor...</p>;

    return (
        <div className="customer-list">
            <table>
                <thead>
                    <tr>
                        <th>Tarih</th>
                        <th>Kullanıcı Adı</th>
                        <th>Sonuç</th>
                        <th>IP Adresi</th>
                        <th>Detay</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.length === 0 ? (
                        <tr><td colSpan="5" className="empty-state">Henüz kayıt yok.</td></tr>
                    ) : (
                        logs.map((log) => (
                            <tr key={log.securityLogID}>
                                <td className="mono">{new Date(log.timestamp).toLocaleString("tr-TR")}</td>
                                <td>{log.username}</td>
                                <td>
                                    <span className={log.success ? "badge status-approved" : "badge status-rejected"}>
                                        {log.success ? "Başarılı" : "Başarısız"}
                                    </span>
                                </td>
                                <td className="mono">{log.ipAddress || "-"}</td>
                                <td>{log.details}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default SecurityLogList;