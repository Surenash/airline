import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Wraps any component and ensures the user has a valid admin JWT.
 * Validates the token client-side by checking its expiry claim.
 * If invalid or expired, redirects to /admin/login.
 */
function parseJwtExpiry(token) {
    try {
        if (!token) return null;
        const base64Url = token.split(".")[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        const payload = JSON.parse(jsonPayload);
        return payload.exp ? payload.exp * 1000 : null; // convert to ms
    } catch (e) {
        console.error("JWT parse error:", e);
        return null;
    }
}

export default function ProtectedAdminRoute({ children }) {
    const navigate = useNavigate();

    useEffect(() => {
        const token = sessionStorage.getItem("admin_token");
        if (!token) {
            navigate("/admin/login", { replace: true });
            return;
        }
        const expiry = parseJwtExpiry(token);
        if (!expiry || Date.now() > expiry) {
            sessionStorage.removeItem("admin_token");
            navigate("/admin/login", { replace: true });
        }
    }, [navigate]);

    const token = sessionStorage.getItem("admin_token");
    const expiry = parseJwtExpiry(token);
    if (!token || !expiry || Date.now() > expiry) {
        return null; // will redirect via useEffect
    }

    return children;
}
