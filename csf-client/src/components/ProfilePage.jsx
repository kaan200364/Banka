import { useState, useEffect } from "react";
import { getMyProfile, updateMyProfile, changeMyPassword, setup2FA, confirm2FA, disable2FA } from "../api/authApi";

function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [profileMessage, setProfileMessage] = useState(null);
    const [savingProfile, setSavingProfile] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordMessage, setPasswordMessage] = useState(null);
    const [savingPassword, setSavingPassword] = useState(false);

    const [qrCode, setQrCode] = useState(null);
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [twoFactorMessage, setTwoFactorMessage] = useState(null);

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            const data = await getMyProfile();
            setProfile(data);
            setFullName(data.fullName);
            setEmail(data.email);
        } catch (err) {
            console.error(err);
        }
    }

    async function handleProfileSubmit(e) {
        e.preventDefault();
        setSavingProfile(true);
        setProfileMessage(null);

        try {
            const updated = await updateMyProfile({ fullName, email });
            setProfile(updated);
            setProfileMessage({ type: "success", text: "Profil başarıyla güncellendi." });
            localStorage.setItem("fullName", updated.fullName);
        } catch (err) {
            setProfileMessage({ type: "error", text: err.message || "Güncelleme başarısız oldu." });
        } finally {
            setSavingProfile(false);
        }
    }

    async function handlePasswordSubmit(e) {
        e.preventDefault();
        setSavingPassword(true);
        setPasswordMessage(null);

        try {
            await changeMyPassword({ currentPassword, newPassword });
            setPasswordMessage({ type: "success", text: "Şifre başarıyla değiştirildi." });
            setCurrentPassword("");
            setNewPassword("");
        } catch (err) {
            setPasswordMessage({ type: "error", text: err.message || "Şifre değiştirilemedi." });
        } finally {
            setSavingPassword(false);
        }
    }

    async function handleSetup2FA() {
        try {
            const result = await setup2FA();
            setQrCode(result.qrCodeImageBase64);
            setTwoFactorMessage(null);
        } catch (err) {
            setTwoFactorMessage({ type: "error", text: "2FA kurulumu başlatılamadı." });
        }
    }

    async function handleConfirm2FA(e) {
        e.preventDefault();
        try {
            await confirm2FA(twoFactorCode);
            setTwoFactorMessage({ type: "success", text: "2FA başarıyla etkinleştirildi." });
            setQrCode(null);
            setTwoFactorCode("");
            await loadProfile();
        } catch (err) {
            setTwoFactorMessage({ type: "error", text: err.message || "Kod doğrulanamadı." });
        }
    }

    async function handleDisable2FA() {
        const confirmed = window.confirm("2FA'yı devre dışı bırakmak istediğinize emin misiniz?");
        if (!confirmed) return;

        try {
            await disable2FA();
            setTwoFactorMessage({ type: "success", text: "2FA devre dışı bırakıldı." });
            await loadProfile();
        } catch (err) {
            setTwoFactorMessage({ type: "error", text: "İşlem başarısız oldu." });
        }
    }

    if (!profile) return <p className="status-text">Yükleniyor...</p>;

    return (
        <div className="app-main">
            <form className="customer-form" onSubmit={handleProfileSubmit}>
                <h2>Profil Bilgilerim</h2>

                <div className="form-group">
                    <label>Kullanıcı Adı</label>
                    <input type="text" value={profile.username} disabled />
                </div>

                <div className="form-group">
                    <label>Ad Soyad *</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label>E-posta *</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label>Rol</label>
                    <input type="text" value={profile.role} disabled />
                </div>

                {profileMessage && (
                    <p className={profileMessage.type === "success" ? "field-error" : "field-error finance-error"}
                        style={profileMessage.type === "success" ? { color: "var(--teal-dark)" } : {}}>
                        {profileMessage.text}
                    </p>
                )}

                <div className="form-actions">
                    <button type="submit" disabled={savingProfile}>
                        {savingProfile ? "Kaydediliyor..." : "Bilgileri Güncelle"}
                    </button>
                </div>
            </form>

            <form className="customer-form" onSubmit={handlePasswordSubmit}>
                <h2>Şifre Değiştir</h2>

                <div className="form-group">
                    <label>Mevcut Şifre *</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Yeni Şifre *</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>

                {passwordMessage && (
                    <p className={passwordMessage.type === "success" ? "field-error" : "field-error finance-error"}
                        style={passwordMessage.type === "success" ? { color: "var(--teal-dark)" } : {}}>
                        {passwordMessage.text}
                    </p>
                )}

                <div className="form-actions">
                    <button type="submit" disabled={savingPassword}>
                        {savingPassword ? "Kaydediliyor..." : "Şifreyi Değiştir"}
                    </button>
                </div>
            </form>

            {profile.role === "Administrator" && (
                <div className="customer-form">
                    <h2>İki Faktörlü Doğrulama (2FA)</h2>

                    {!qrCode && (
                        <>
                            {profile.twoFactorEnabled ? (
                                <>
                                    <p style={{ fontSize: "0.85rem", color: "var(--teal-dark)", marginBottom: "1rem", fontWeight: 600 }}>
                                        ✓ İki faktörlü doğrulama şu anda etkin.
                                    </p>
                                    <div className="form-actions">
                                        <button type="button" className="danger" onClick={handleDisable2FA}>2FA'yı Kapat</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                                        Hesabınızın güvenliğini artırmak için Google Authenticator ile iki faktörlü doğrulama kurabilirsiniz.
                                    </p>
                                    <div className="form-actions">
                                        <button type="button" onClick={handleSetup2FA}>2FA Kurulumunu Başlat</button>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {qrCode && (
                        <form onSubmit={handleConfirm2FA}>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                                Google Authenticator uygulamanızla aşağıdaki QR kodu okutun, sonra üretilen 6 haneli kodu girin.
                            </p>
                            <img
                                src={`data:image/png;base64,${qrCode}`}
                                alt="2FA QR Kod"
                                style={{ display: "block", margin: "0 auto 1rem", width: "200px", height: "200px" }}
                            />
                            <div className="form-group">
                                <label>Doğrulama Kodu</label>
                                <input
                                    type="text"
                                    value={twoFactorCode}
                                    onChange={(e) => setTwoFactorCode(e.target.value)}
                                    maxLength={6}
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit">Onayla ve Etkinleştir</button>
                            </div>
                        </form>
                    )}

                    {twoFactorMessage && (
                        <p className={twoFactorMessage.type === "success" ? "field-error" : "field-error finance-error"}
                            style={twoFactorMessage.type === "success" ? { color: "var(--teal-dark)" } : {}}>
                            {twoFactorMessage.text}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default ProfilePage;