import "../AdminDashboard.css";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, CartesianGrid, ReferenceLine,
    PieChart, Pie, Cell, Legend,
} from "recharts";
import {
    Users, Plane, DollarSign, TrendingUp,
    CheckCircle, XCircle, Clock, AlertCircle,
} from "lucide-react";

const API_BASE = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || "http://localhost:8000";

// ── Shared helpers ────────────────────────────────────────────────────────────
function fmtNum(n) {
    if (n == null) return "—";
    if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(Math.round(n));
}
function fmtMoney(n) {
    if (n == null) return "—";
    if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
    return `$${Number(n).toFixed(0)}`;
}
function fmtDate() {
    return new Date().toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}
const CHART_TOOLTIP_STYLE = {
    contentStyle: { background: "#161b22", border: "1px solid #30363d", borderRadius: 6, fontSize: 12 },
    labelStyle: { color: "#8b949e" },
};
function ChartTip({ active, payload, label, money }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="ex-tip">
            <p className="ex-tip-label">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>
                    {p.name}: {money ? fmtMoney(p.value) : fmtNum(p.value)}
                </p>
            ))}
        </div>
    );
}

// ── Destination spotlight data ────────────────────────────────────────────────
const DESTINATIONS = [
    { city: "Dubai", code: "DXB", weather: "☀️ 34°C", fact: "Busiest hub — 1,200+ weekly ops" },
    { city: "London", code: "LHR", weather: "🌧 12°C", fact: "Top transatlantic gateway" },
    { city: "Singapore", code: "SIN", weather: "🌤 30°C", fact: "Highest load factor this week: 91%" },
    { city: "New York", code: "JFK", weather: "🌥 8°C", fact: "SkyLux Platinum milestone: 5,000th pax" },
    { city: "Tokyo", code: "NRT", weather: "🌸 16°C", fact: "Sakura season — seats fully booked" },
];

// ── Analytics palette ─────────────────────────────────────────────────────────
const ANA_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981"];
const CLASS_COLORS = { economy: "#6366f1", "premium-economy": "#8b5cf6", business: "#06b6d4", first: "#f59e0b" };

// ── Status badge (analytics tab) ─────────────────────────────────────────────
function StatusBadge({ status }) {
    const cfg = {
        confirmed: { icon: CheckCircle, color: "#10b981", bg: "#10b98120" },
        cancelled: { icon: XCircle, color: "#f85149", bg: "#f8514920" },
        pending: { icon: Clock, color: "#f59e0b", bg: "#f59e0b20" },
        scheduled: { icon: CheckCircle, color: "#6366f1", bg: "#6366f120" },
        delayed: { icon: AlertCircle, color: "#f59e0b", bg: "#f59e0b20" },
        unknown: { icon: AlertCircle, color: "#6e7681", bg: "#6e768120" },
    };
    const c = cfg[status] || cfg.unknown;
    const Ico = c.icon;
    return (
        <span className="ana-badge" style={{ background: c.bg, color: c.color }}>
            <Ico size={11} /> {status}
        </span>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const navigate = useNavigate();

    // Shared nav state
    const [activeView, setActiveView] = useState("ops"); // "ops" | "analytics"

    // Ops data
    const [ops, setOps] = useState(null);
    const [fin, setFin] = useState(null);
    const [hubs, setHubs] = useState(null);

    // Analytics data
    const [stats, setStats] = useState(null);
    const [flightStatus, setFlightStatus] = useState([]);
    const [revenueByClass, setRevByClass] = useState([]);
    const [topRoutes, setTopRoutes] = useState([]);
    const [monthly, setMonthly] = useState([]);
    const [recentBookings, setRecentBk] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);

    // Fleet data
    const [fleet, setFleet] = useState([]);
    const [allFlights, setAllFlights] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [clock, setClock] = useState(fmtDate());
    const [destIdx, setDestIdx] = useState(0);

    useEffect(() => { const t = setInterval(() => setClock(fmtDate()), 30_000); return () => clearInterval(t); }, []);
    useEffect(() => { const t = setInterval(() => setDestIdx(i => (i + 1) % DESTINATIONS.length), 6_000); return () => clearInterval(t); }, []);

    const fetchAll = useCallback(async () => {
        const token = sessionStorage.getItem("admin_token");
        if (!token) { navigate("/admin/login", { replace: true }); return; }
        const h = { Authorization: `Bearer ${token}` };
        const safe = async (url) => {
            const r = await fetch(url, { headers: h });
            if (r.status === 401) { sessionStorage.removeItem("admin_token"); navigate("/admin/login", { replace: true }); return null; }
            return r.ok ? r.json() : null;
        };
        try {
            setLoading(true);
            const [o, f, hb, s, fs, rc, tr, mn, rb, ru] = await Promise.all([
                safe(`${API_BASE}/api/admin/ops`),
                safe(`${API_BASE}/api/admin/financials`),
                safe(`${API_BASE}/api/admin/hubs`),
                safe(`${API_BASE}/api/admin/stats`),
                safe(`${API_BASE}/api/admin/flights/status`),
                safe(`${API_BASE}/api/admin/revenue/by-class`),
                safe(`${API_BASE}/api/admin/routes/top`),
                safe(`${API_BASE}/api/admin/revenue/monthly`),
                safe(`${API_BASE}/api/admin/bookings/recent`),
                safe(`${API_BASE}/api/admin/users/recent`),
            ]);
            if (!o && !s) { setError("Backend unreachable"); return; }
            setOps(o); setFin(f); setHubs(hb);
            setStats(s); setFlightStatus(fs || []); setRevByClass(rc || []);
            setTopRoutes(tr || []); setMonthly(mn || []);
            setRecentBk(rb || []); setRecentUsers(ru || []);

            // New fleet & flights
            const fl = await safe(`${API_BASE}/api/admin/planes`);
            const af = await safe(`${API_BASE}/api/admin/flights`);
            setFleet(fl || []);
            setAllFlights(af || []);
        } catch { setError("Failed to connect to backend."); }
        finally { setLoading(false); }
    }, [navigate]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleLogout = () => { sessionStorage.removeItem("admin_token"); navigate("/admin/login", { replace: true }); };

    if (loading) return <div className="ex-center"><div className="ex-spinner" /><p className="ex-muted">Loading…</p></div>;
    if (error) return <div className="ex-center"><p className="ex-alert-text">{error}</p></div>;

    const delayAlert = ops?.weather_delay_pct > 15;
    const wowLabel = (() => {
        if (fin?.wow_pct == null) return "vs. last week: no data";
        const arrow = fin.wow_pct >= 0 ? "↑" : "↓";
        return `${arrow} ${Math.abs(fin.wow_pct)}% vs. last ${new Date(Date.now() - 7 * 86400000).toLocaleDateString("en-US", { weekday: "long" })}`;
    })();

    const dest = DESTINATIONS[destIdx];

    return (
        <div className="ex-root">

            {/* ── TOP HEADER ─────────────────────────────────────────────────────── */}
            <header className="ex-header">
                <div className="ex-header-left">
                    <span className="ex-logo">SKY<em>LUX</em></span>
                    <span className="ex-header-divider" />
                    <nav className="ex-tab-nav">
                        <button
                            className={`ex-tab-btn ${activeView === "ops" ? "active" : ""}`}
                            onClick={() => setActiveView("ops")}
                        >
                            Operations
                        </button>
                        <button
                            className={`ex-tab-btn ${activeView === "analytics" ? "active" : ""}`}
                            onClick={() => setActiveView("analytics")}
                        >
                            Analytics
                        </button>
                        <button
                            className={`ex-tab-btn ${activeView === "fleet" ? "active" : ""}`}
                            onClick={() => setActiveView("fleet")}
                        >
                            Fleet & Scheduling
                        </button>
                    </nav>
                </div>
                <div className="ex-header-right">
                    <span className="ex-clock">{clock}</span>
                    <button className="ex-logout" onClick={handleLogout}>Sign Out</button>
                </div>
            </header>

            {/* ══════════════════════════════════════════════════════════════════════
          TAB 1 — OPERATIONS COMMAND
      ═══════════════════════════════════════════════════════════════════════ */}
            {activeView === "ops" && (
                <>
                    {/* Hero */}
                    <section className="ex-hero">
                        <div className="ex-hero-primary">
                            <p className="ex-hero-label">System-Wide On-Time Performance</p>
                            <p className={`ex-hero-value ${ops?.otp < 80 ? "ex-red" : "ex-green"}`}>{ops?.otp ?? "—"}%</p>
                            <p className="ex-hero-sub">OTP (Today)</p>
                        </div>
                        <div className="ex-hero-secondary">
                            <p className="ex-hero-label">Active Flights</p>
                            <p className="ex-hero-value">{fmtNum(ops?.active_flights)}</p>
                            <p className="ex-hero-sub">Currently Scheduled</p>
                        </div>
                        <div className="ex-hero-divider" />
                        <div className="ex-hero-secondary">
                            <p className="ex-hero-label">Daily Pax Revenue (USD)</p>
                            <p className="ex-hero-value ex-purple">{fmtMoney(fin?.daily_revenue)}</p>
                            <p className="ex-hero-sub">{wowLabel}</p>
                        </div>
                        <div className="ex-hero-secondary">
                            <p className="ex-hero-label">Passengers Today</p>
                            <p className="ex-hero-value">{fmtNum(fin?.daily_passengers)}</p>
                            <p className="ex-hero-sub">Boarded</p>
                        </div>
                    </section>

                    {/* Grid */}
                    <div className="ex-grid">
                        {/* Zone A */}
                        <section className="ex-zone ex-zone-a">
                            <p className="ex-zone-label">A — Operations</p>
                            <div className="ex-metric-row">
                                <div className="ex-metric">
                                    <p className="ex-metric-label">Active Flights</p>
                                    <p className="ex-metric-value">{fmtNum(ops?.active_flights)}</p>
                                    <p className="ex-metric-sub">of {fmtNum(ops?.total_in_fleet)} fleet</p>
                                </div>
                                <div className="ex-metric">
                                    <p className="ex-metric-label">Grounded Aircraft</p>
                                    <p className={`ex-metric-value ${ops?.grounded_aircraft > 20 ? "ex-red" : ""}`}>{fmtNum(ops?.grounded_aircraft)}</p>
                                    <p className="ex-metric-sub">Cancelled / AOG</p>
                                </div>
                                <div className="ex-metric">
                                    <p className="ex-metric-label">Weather Delays</p>
                                    <p className={`ex-metric-value ${delayAlert ? "ex-red" : ""}`}>
                                        {fmtNum(ops?.weather_delays)}
                                        {delayAlert && <span className="ex-alert-pill">⚠ {ops.weather_delay_pct}%</span>}
                                    </p>
                                    <p className="ex-metric-sub">Delayed flights</p>
                                </div>
                            </div>
                        </section>

                        {/* Zone B */}
                        <section className="ex-zone ex-zone-b">
                            <p className="ex-zone-label">B — Financials (All-Time)</p>
                            <div className="ex-metric-row">
                                <div className="ex-metric">
                                    <p className="ex-metric-label">Daily Pax Revenue</p>
                                    <p className="ex-metric-value">{fmtMoney(fin?.daily_revenue)}</p>
                                    <p className={`ex-metric-sub ${(fin?.wow_pct ?? 0) >= 0 ? "ex-green-text" : "ex-red-text"}`}>{wowLabel}</p>
                                </div>
                                <div className="ex-metric">
                                    <p className="ex-metric-label">Cargo Revenue</p>
                                    <p className="ex-metric-value">{fmtMoney(fin?.cargo_revenue)}</p>
                                    <p className="ex-metric-sub">~12% of pax rev</p>
                                </div>
                                <div className="ex-metric">
                                    <p className="ex-metric-label">Fuel Costs</p>
                                    <p className="ex-metric-value">{fmtMoney(fin?.fuel_cost)}</p>
                                    <p className="ex-metric-sub">~28% of revenue</p>
                                </div>
                            </div>
                        </section>

                        {/* Zone C */}
                        <section className="ex-zone ex-zone-c">
                            <p className="ex-zone-label">C — Customer</p>
                            <div className="ex-metric-row">
                                <div className="ex-metric">
                                    <p className="ex-metric-label">Total Pax Boarded</p>
                                    <p className="ex-metric-value">{fmtNum(fin?.total_passengers)}</p>
                                    <p className="ex-metric-sub">All time</p>
                                </div>
                                <div className="ex-metric">
                                    <p className="ex-metric-label">Load Factor</p>
                                    <p className={`ex-metric-value ${(fin?.load_factor ?? 100) < 70 ? "ex-red" : "ex-green"}`}>{fin?.load_factor ?? "—"}%</p>
                                    <p className="ex-metric-sub">Pax / capacity</p>
                                </div>
                            </div>
                        </section>

                        {/* 7-day revenue trend */}
                        <section className="ex-zone ex-chart-wide">
                            <p className="ex-zone-label">Daily Revenue Trend (USD) — Last 7 Days</p>
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={fin?.daily_trend ?? []} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                                    <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="2 4" />
                                    <XAxis dataKey="day" tickFormatter={v => v ? v.slice(5) : ""} tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={v => fmtMoney(v)} tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} width={56} />
                                    <ReferenceLine y={0} stroke="#1e293b" />
                                    <Tooltip content={<ChartTip money />} />
                                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: "#6366f1" }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </section>

                        {/* Departures by Hub */}
                        <section className="ex-zone ex-chart-half">
                            <p className="ex-zone-label">Departures by Hub (Top 10)</p>
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={hubs?.departures ?? []} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                                    <XAxis type="number" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="hub" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
                                    <Tooltip content={<ChartTip />} />
                                    <Bar dataKey="count" name="Departures" fill="#6366f1" radius={[0, 3, 3, 0]} maxBarSize={14} />
                                </BarChart>
                            </ResponsiveContainer>
                        </section>

                        {/* Arrivals by Hub */}
                        <section className="ex-zone ex-chart-half">
                            <p className="ex-zone-label">Arrivals by Hub (Top 10)</p>
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={hubs?.arrivals ?? []} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                                    <XAxis type="number" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="hub" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
                                    <Tooltip content={<ChartTip />} />
                                    <Bar dataKey="count" name="Arrivals" fill="#6366f1" radius={[0, 3, 3, 0]} maxBarSize={14} />
                                </BarChart>
                            </ResponsiveContainer>
                        </section>

                        {/* Destination spotlight */}
                        <section className="ex-zone ex-dest">
                            <p className="ex-zone-label">✦ Destination Spotlight</p>
                            <div className="ex-dest-inner">
                                <div className="ex-dest-code">{dest.code}</div>
                                <div className="ex-dest-info">
                                    <p className="ex-dest-city">{dest.city}</p>
                                    <p className="ex-dest-weather">{dest.weather}</p>
                                    <p className="ex-dest-fact">{dest.fact}</p>
                                </div>
                            </div>
                            <div className="ex-dest-dots">
                                {DESTINATIONS.map((_, i) => <span key={i} className={`ex-dest-dot ${i === destIdx ? "active" : ""}`} />)}
                            </div>
                        </section>
                    </div>
                </>
            )}

            {/* ══════════════════════════════════════════════════════════════════════
          TAB 2 — ANALYTICS & BUSINESS INTELLIGENCE
      ═══════════════════════════════════════════════════════════════════════ */}
            {activeView === "analytics" && (
                <div className="ana-root">

                    {/* KPI Row */}
                    <div className="ana-kpi-grid">
                        {[
                            { icon: DollarSign, label: "Total Revenue", value: fmtMoney(stats?.total_revenue), sub: `Avg booking: ${fmtMoney(stats?.avg_booking_value)}`, color: "#6366f1" },
                            { icon: TrendingUp, label: "Total Bookings", value: fmtNum(stats?.total_bookings), sub: `${fmtNum(stats?.booking_status?.confirmed)} confirmed`, color: "#8b5cf6" },
                            { icon: Users, label: "Registered Users", value: fmtNum(stats?.total_users), sub: null, color: "#06b6d4" },
                            { icon: Plane, label: "Total Flights", value: fmtNum(stats?.total_flights), sub: null, color: "#f59e0b" },
                        ].map(({ icon: Icon, label, value, sub, color }) => (
                            <div className="ana-kpi-card" key={label}>
                                <div className="ana-kpi-icon" style={{ background: color + "20", color }}>
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <p className="ana-kpi-label">{label}</p>
                                    <p className="ana-kpi-value">{value}</p>
                                    {sub && <p className="ana-kpi-sub">{sub}</p>}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Row 1 */}
                    <div className="ana-grid-2">
                        {/* Booking status bar */}
                        <div className="ana-card">
                            <p className="ana-card-title">Booking Status Split</p>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart
                                    data={[
                                        { name: "Confirmed", value: stats?.booking_status?.confirmed ?? 0, fill: "#10b981" },
                                        { name: "Cancelled", value: stats?.booking_status?.cancelled ?? 0, fill: "#f85149" },
                                        { name: "Pending", value: stats?.booking_status?.pending ?? 0, fill: "#f59e0b" },
                                    ]}
                                >
                                    <XAxis dataKey="name" tick={{ fill: "#8b949e", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#8b949e", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip {...CHART_TOOLTIP_STYLE} />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                                        {[{ fill: "#10b981" }, { fill: "#f85149" }, { fill: "#f59e0b" }].map((c, i) => <Cell key={i} fill={c.fill} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Flight status */}
                        <div className="ana-card">
                            <p className="ana-card-title">Fleet Status Overview</p>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={flightStatus}>
                                    <XAxis dataKey="status" tick={{ fill: "#8b949e", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: "#8b949e", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip {...CHART_TOOLTIP_STYLE} />
                                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Charts Row 2 */}
                    <div className="ana-grid-2">
                        {/* Monthly Revenue */}
                        <div className="ana-card ana-col-2">
                            <p className="ana-card-title">Monthly Revenue & Bookings — Last 12 Months</p>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={monthly} margin={{ left: 0, right: 16 }}>
                                    <CartesianGrid vertical={false} stroke="#21262d" strokeDasharray="2 4" />
                                    <XAxis dataKey="month" tickFormatter={v => v?.slice(5) ?? ""} tick={{ fill: "#8b949e", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis yAxisId="l" tickFormatter={v => fmtMoney(v)} tick={{ fill: "#8b949e", fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                                    <YAxis yAxisId="r" orientation="right" tick={{ fill: "#8b949e", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTip money />} />
                                    <Legend wrapperStyle={{ color: "#8b949e", fontSize: 12 }} />
                                    <Line yAxisId="l" type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2} dot={false} />
                                    <Line yAxisId="r" type="monotone" dataKey="bookings" name="Bookings" stroke="#f59e0b" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Charts Row 3 */}
                    <div className="ana-grid-2">
                        {/* Revenue by Class — horizontal bar (no pie) */}
                        <div className="ana-card">
                            <p className="ana-card-title">Revenue by Seat Class</p>
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={revenueByClass} layout="vertical" margin={{ left: 8, right: 24 }}>
                                    <XAxis type="number" tickFormatter={v => fmtMoney(v)} tick={{ fill: "#8b949e", fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="seat_class" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                                    <Tooltip content={<ChartTip money />} />
                                    <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]} maxBarSize={20}>
                                        {revenueByClass.map((r, i) => <Cell key={i} fill={CLASS_COLORS[r.seat_class] || ANA_COLORS[i % ANA_COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>

                            {/* Breakdown table beneath */}
                            <table className="ana-table" style={{ marginTop: "1rem" }}>
                                <thead><tr><th>Class</th><th>Revenue</th><th>Bookings</th><th>Avg</th></tr></thead>
                                <tbody>
                                    {revenueByClass.map(r => (
                                        <tr key={r.seat_class}>
                                            <td><span className="ana-dot" style={{ background: CLASS_COLORS[r.seat_class] || "#6366f1" }} />{r.seat_class}</td>
                                            <td>{fmtMoney(r.revenue)}</td>
                                            <td>{fmtNum(r.count)}</td>
                                            <td>{fmtMoney(r.revenue / r.count)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Top Routes */}
                        <div className="ana-card">
                            <p className="ana-card-title">Top Routes by Bookings</p>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={topRoutes.slice(0, 6)} layout="vertical" margin={{ left: 8, right: 24 }}>
                                    <XAxis type="number" tick={{ fill: "#8b949e", fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="route" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                                    <Tooltip content={<ChartTip />} />
                                    <Bar dataKey="bookings" name="Bookings" fill="#6366f1" radius={[0, 4, 4, 0]} maxBarSize={18} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Tables Row */}
                    <div className="ana-grid-2">
                        {/* Recent Bookings */}
                        <div className="ana-card">
                            <div className="ana-card-header">
                                <p className="ana-card-title">Recent Bookings</p>
                                <span className="ana-badge-count">{recentBookings.length} shown</span>
                            </div>
                            <div className="ana-table-wrap">
                                <table className="ana-table">
                                    <thead><tr><th>ID</th><th>Passenger</th><th>Route</th><th>Class</th><th>Price</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {recentBookings.map(b => (
                                            <tr key={b.id}>
                                                <td className="ana-id">#{b.id}</td>
                                                <td>{b.user?.name || "—"}</td>
                                                <td>{b.flight ? `${b.flight.departure_airport_code}→${b.flight.arrival_airport_code}` : "—"}</td>
                                                <td>{b.seat_class}</td>
                                                <td>{fmtMoney(b.total_price)}</td>
                                                <td><StatusBadge status={b.status} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Users */}
                        <div className="ana-card">
                            <div className="ana-card-header">
                                <p className="ana-card-title">Recent Users</p>
                                <span className="ana-badge-count">{recentUsers.length} shown</span>
                            </div>
                            <div className="ana-table-wrap">
                                <table className="ana-table">
                                    <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Joined</th></tr></thead>
                                    <tbody>
                                        {recentUsers.map(u => (
                                            <tr key={u.id}>
                                                <td className="ana-id">#{u.id}</td>
                                                <td>
                                                    <div className="ana-user">
                                                        <span className="ana-avatar" style={{ background: "#6366f120", color: "#6366f1" }}>
                                                            {u.name?.charAt(0).toUpperCase()}
                                                        </span>
                                                        {u.name}
                                                    </div>
                                                </td>
                                                <td>{u.email}</td>
                                                <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════════
          TAB 3 — FLEET & SCHEDULING MANAGEMENT
      ═══════════════════════════════════════════════════════════════════════ */}
            {activeView === "fleet" && (
                <div className="fleet-root">
                    <section className="fleet-summary">
                        <div className="fleet-kpi">
                            <p className="fleet-kpi-label">Fleet Size</p>
                            <p className="fleet-kpi-val">{fleet.length}</p>
                            <p className="fleet-kpi-sub">Active Aircraft</p>
                        </div>
                        <div className="fleet-kpi">
                            <p className="fleet-kpi-label">Scheduled Today</p>
                            <p className="fleet-kpi-val">{ops?.active_flights}</p>
                            <p className="fleet-kpi-sub">System Wide</p>
                        </div>
                    </section>

                    <div className="fleet-grid">
                        <div className="fleet-sidebar">
                            <p className="fleet-section-title">Active Fleet</p>
                            <div className="fleet-list">
                                {fleet.map(p => (
                                    <div key={p.id} className="plane-card">
                                        <div className="plane-header">
                                            <span className="plane-model">{p.model}</span>
                                            <span className={`plane-status-dot ${p.status}`} />
                                        </div>
                                        <p className="plane-reg">{p.registration}</p>
                                        <div className="plane-capacity">
                                            <span>Eco: {p.capacity.economy}</span>
                                            <span>Bus: {p.capacity.business}</span>
                                            {p.capacity.first > 0 && <span>1st: {p.capacity.first}</span>}
                                        </div>
                                        {p.next_flight && (
                                            <div className="plane-next">
                                                <p className="next-label">Next: {p.next_flight.flight_number}</p>
                                                <p className="next-route">{p.next_flight.route} @ {new Date(p.next_flight.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="fleet-main">
                            <div className="fleet-header-row">
                                <p className="fleet-section-title">Flight Board (Recent & Upcoming)</p>
                                <span className="ana-badge-count">{allFlights.length} flights tracked</span>
                            </div>
                            <div className="ana-table-wrap">
                                <table className="ana-table">
                                    <thead>
                                        <tr>
                                            <th>Flight</th>
                                            <th>Route</th>
                                            <th>Departure</th>
                                            <th>Aircraft</th>
                                            <th>Base Price</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allFlights.map(f => (
                                            <tr key={f.id}>
                                                <td className="ana-id font-bold">{f.flight_number}</td>
                                                <td>{f.route}</td>
                                                <td>{new Date(f.departure_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                                <td>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-slate-300">{f.plane?.model}</span>
                                                        <span className="text-[10px] text-slate-500">{f.plane?.registration}</span>
                                                    </div>
                                                </td>
                                                <td>${f.base_price}</td>
                                                <td><StatusBadge status={f.status} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
