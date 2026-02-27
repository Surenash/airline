import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Wraps any component and ensures the user has a valid admin JWT.
 * Validates the token client-side by checking its expiry claim.
 * If invalid or expired, redirects to /admin/login.
 */
function parseJwtExpiry(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp ? payload.exp * 1000 : null; // convert to ms
    } catch {
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
