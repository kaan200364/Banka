import { useState, useEffect } from "react";
import { getMyProfile, updateMyProfile, changeMyPassword } from "../api/authApi";

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

    useEffect(() => {
        getMyProfile().then((data) => {
            setProfile(data);
            setFullName(data.fullName);
            setEmail(data.email);
        }).catch(console.error);
    }, []);

    async function handleProfileSubmit(e) {
        e.preventDefault();
        setSavingProfile(true);
        setProfileMessage(null);

        try {
            const updated = await updateMyProfile({ fullName, email });
            setProfile(updated);
            setProfileMessage({ type: "success", text: "Profil başarıyla güncellendi." });

            // localStorage'daki ad bilgisini de güncelle (header'da doğru görünsün diye)
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
        </div>
    );
}

export default ProfilePage;