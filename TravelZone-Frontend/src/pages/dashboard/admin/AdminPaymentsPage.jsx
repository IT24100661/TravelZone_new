import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { AlertCircle, Search } from "lucide-react";

const statusColors = {
  COMPLETED: { bg: "rgba(16,185,129,0.12)",  color: "#059669", border: "rgba(16,185,129,0.3)" },
  PENDING:   { bg: "rgba(245,158,11,0.12)",  color: "#d97706", border: "rgba(245,158,11,0.3)" },
  FAILED:    { bg: "rgba(239,68,68,0.12)",   color: "#dc2626", border: "rgba(239,68,68,0.3)" },
  REFUNDED:  { bg: "rgba(99,102,241,0.12)",  color: "#4f46e5", border: "rgba(99,102,241,0.3)" },
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    api.get("/api/admin/payments")
      .then(r => setPayments(r.data))
      .catch(() => setError("Failed to load payments"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = payments.filter(p =>
    p.payerName?.toLowerCase().includes(search.toLowerCase()) ||
    p.payerEmail?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = payments
    .filter(p => p.status === "COMPLETED")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--tz-text)" }}>Payments</h1>
          <p style={{ color: "var(--tz-text-muted)", fontSize: "0.875rem" }}>All platform payments</p>
        </div>
        <div style={{ background: "var(--tz-card-bg)", border: "1px solid var(--tz-card-border)", borderRadius: "0.875rem", padding: "0.875rem 1.25rem" }}>
          <p style={{ fontSize: "0.72rem", color: "var(--tz-text-muted)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Total Revenue</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 900, color: "#16a34a" }}>LKR{totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: "1rem" }}><AlertCircle size={14} /> {error}</div>}

      <div style={{ position: "relative", marginBottom: "1.25rem", maxWidth: "380px" }}>
        <Search size={15} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--tz-text-muted)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search payer…"
          style={{ width: "100%", background: "var(--tz-input-bg)", border: "1px solid var(--tz-input-border)", color: "var(--tz-text)", borderRadius: "0.875rem", padding: "0.6rem 1rem 0.6rem 2.5rem", fontSize: "0.875rem", outline: "none" }} />
      </div>

      <div style={{ background: "var(--tz-card-bg)", border: "1px solid var(--tz-card-border)", borderRadius: "1.25rem", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--tz-border)" }}>
                {["Payer", "Type", "Amount", "Status", "Stripe ID", "Date"].map(h => (
                  <th key={h} style={{ padding: "0.875rem 1.25rem", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, color: "var(--tz-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "var(--tz-text-muted)" }}>Loading…</td></tr>
              ) : filtered.map(p => {
                const sc = statusColors[p.status] || statusColors.PENDING;
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--tz-border)" }}>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--tz-text)" }}>{p.payerName}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--tz-text-muted)" }}>{p.payerEmail}</div>
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <span style={{ background: "var(--tz-surface-2)", color: "var(--tz-text-muted)", borderRadius: "0.5rem", padding: "0.2rem 0.6rem", fontSize: "0.75rem", fontWeight: 600 }}>
                        {p.type || "—"}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem", fontWeight: 700, fontSize: "0.9rem", color: "#16a34a" }}>
                      LKR{p.amount?.toFixed(2) ?? "—"}
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, borderRadius: "999px", padding: "0.2rem 0.65rem", fontSize: "0.72rem", fontWeight: 700 }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.75rem", color: "var(--tz-text-faint)", fontFamily: "monospace" }}>
                      {p.stripeId ? p.stripeId.substring(0, 20) + "…" : "—"}
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.82rem", color: "var(--tz-text-muted)" }}>
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}