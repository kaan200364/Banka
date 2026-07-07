import { useState } from "react";
import { login } from "../api/authApi";

function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const result = await login(username, password);
            localStorage.setItem("token", result.token);
            localStorage.setItem("username", result.username);
            localStorage.setItem("fullName", result.fullName);
            localStorage.setItem("role", result.role);
            localStorage.setItem("userID", result.userID);
            onLoginSuccess(result);
        } catch (err) {
            setError(err.message || "Kullanıcı adı veya şifre hatalı.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">
            <form className="login-form" onSubmit={handleSubmit}>
                <h1>CSF Yönetim Sistemi</h1>
                <p className="login-subtitle">Devam etmek için giriş yapın</p>

                <div className="form-group">
                    <label>Kullanıcı Adı</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="form-group">
                    <label>Şifre</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {error && <p className="field-error">{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </button>
            </form>
        </div>
    );
}

export default Login;