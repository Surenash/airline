import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plane, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import "../AdminDashboard.css";

const API_BASE = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function AdminLoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.detail || "Login failed.");
                return;
            }
            // Store token in sessionStorage (cleared on tab close) — safer than localStorage
            sessionStorage.setItem("admin_token", data.access_token);
            navigate("/admin");
        } catch {
            setError("Cannot reach the backend. Is the server running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-root">
            <div className="admin-login-card">
                {/* Logo */}
                <div className="admin-login-logo">
                    <div className="admin-login-icon">
                        <Plane size={28} />
                    </div>
                    <h1 className="admin-login-title">SkyLux Management</h1>
                    <p className="admin-login-subtitle">Admin Portal — Sign in to continue</p>
                </div>

                {/* Dev credentials hint */}
                <div style={{ background: '#1a2332', border: '1px solid #30363d', borderRadius: 8, padding: '10px 14px', marginBottom: 8, fontSize: 12, color: '#8b949e', textAlign: 'center' }}>
                    <strong style={{ color: '#58a6ff' }}>Dev Login:</strong> &nbsp;
                    <code style={{ color: '#e6edf3' }}>admin</code> / <code style={{ color: '#e6edf3' }}>admin123</code>
                </div>

                {/* Error */}
                {error && (
                    <div className="admin-login-error">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin} className="admin-login-form">
                    <div className="admin-login-field">
                        <label htmlFor="admin-username">Username</label>
                        <div className="admin-login-input-wrap">
                            <User size={16} className="admin-login-input-icon" />
                            <input
                                id="admin-username"
                                type="text"
                                placeholder="admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoFocus
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div className="admin-login-field">
                        <label htmlFor="admin-password">Password</label>
                        <div className="admin-login-input-wrap">
                            <Lock size={16} className="admin-login-input-icon" />
                            <input
                                id="admin-password"
                                type={showPw ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="admin-login-eye"
                                onClick={() => setShowPw((v) => !v)}
                                tabIndex={-1}
                            >
                                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="admin-login-btn" disabled={loading}>
                        {loading ? (
                            <span className="admin-spinner admin-spinner-sm" />
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <p className="admin-login-footer">
                    Unauthorised access is prohibited and monitored.
                </p>
            </div>
        </div>
    );
}
