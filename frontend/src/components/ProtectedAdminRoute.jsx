import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || "http://localhost:8000";

/**
 * Wraps any component and ensures the user has a valid admin JWT.
 * If not, redirects to /admin/login.
 */
export default function ProtectedAdminRoute({ children }) {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const token = sessionStorage.getItem("admin_token");
        if (!token) {
            navigate("/admin/login", { replace: true });
            return;
        }
        // Verify token is still valid with the backend
        fetch(`${API_BASE}/api/admin/verify`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => {
                if (!r.ok) throw new Error("invalid");
                setChecking(false);
            })
            .catch(() => {
                sessionStorage.removeItem("admin_token");
                navigate("/admin/login", { replace: true });
            });
    }, [navigate]);

    if (checking) {
        return (
            <div className="admin-loader">
                <div className="admin-spinner" />
                <p>Verifying session…</p>
            </div>
        );
    }

    return children;
}
