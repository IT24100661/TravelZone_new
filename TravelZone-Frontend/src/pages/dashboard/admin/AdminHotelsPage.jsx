import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { Trash2, Search, AlertCircle, Star } from "lucide-react";

const statusColors = {
  ACTIVE:    { bg: "rgba(16,185,129,0.12)",  color: "#059669", border: "rgba(16,185,129,0.3)"  },
  INACTIVE:  { bg: "rgba(100,116,139,0.12)", color: "#475569", border: "rgba(100,116,139,0.3)" },
  PENDING:   { bg: "rgba(245,158,11,0.12)",  color: "#d97706", border: "rgba(245,158,11,0.3)"  },
  SUSPENDED: { bg: "rgba(239,68,68,0.12)",   color: "#dc2626", border: "rgba(239,68,68,0.3)"   },
};
const STATUSES = ["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"];

/* ═══════════════════════════════════════════════════════
   RED BUTTON — fully inline, immune to dark-mode override
═══════════════════════════════════════════════════════ */
function RedButton({ onClick, icon: Icon, children, style: extra = {} }) {
  const [hovered, setHovered] = useState(false);
  const [active,  setActive]  = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.35rem",
        fontWeight: 700,
        fontSize: "0.78rem",
        letterSpacing: "0.02em",
        color: "#fff",
        border: "none",
        borderRadius: "0.65rem",
        cursor: "pointer",
        outline: "none",
        fontFamily: "inherit",
        WebkitFontSmoothing: "antialiased",
        background: "linear-gradient(175deg, #7f1d1d 0%, #991b1b 35%, #b91c1c 70%, #dc2626 100%)",
        transform: active
          ? "translateY(1px)"
          : hovered ? "translateY(-3px)" : "translateY(-2px)",
        boxShadow: active
          ? "0 2px 0px #450a0a, 0 4px 10px rgba(185,28,28,0.3)"
          : hovered
          ? "0 6px 0px #450a0a, 0 12px 24px rgba(185,28,28,0.55), 0 4px 8px rgba(0,0,0,0.3)"
          : "0 4px 0px #450a0a, 0 8px 18px rgba(185,28,28,0.45), 0 2px 6px rgba(0,0,0,0.3)",
        transition: "transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.15s ease",
        ...extra,
      }}
    >
      {/* Top gloss */}
      <span style={{
        position: "absolute", top: "3px", left: "14%", width: "72%", height: "38%",
        borderRadius: "999px", pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 100%)",
      }} />
      {/* Bottom shadow layer */}
      <span style={{
        position: "absolute", bottom: 0, left: 0, width: "100%", height: "40%",
        borderRadius: "0 0 0.65rem 0.65rem", pointerEvents: "none",
        background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.28) 100%)",
      }} />
      {Icon && (
        <Icon size={13} style={{ position: "relative", zIndex: 2, color: "#fff", flexShrink: 0 }} />
      )}
      <span style={{ position: "relative", zIndex: 2, color: "#fff" }}>
        {children}
      </span>
    </button>
  );
}

export default function AdminHotelsPage() {
  const [hotels, setHotels]   = useState([]);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const load = () => {
    setLoading(true);
    api.get("/api/admin/hotels")
      .then(r => setHotels(r.data))
      .catch(() => setError("Failed to load hotels"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    try { await api.put(`/api/admin/hotels/${id}/status`, { status }); load(); }
    catch { setError("Failed to update status"); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete hotel "${name}"?`)) return;
    try { await api.delete(`/api/admin/hotels/${id}`); load(); }
    catch { setError("Failed to delete hotel"); }
  };

  const filtered = hotels.filter(h =>
    h.name?.toLowerCase().includes(search.toLowerCase()) ||
    h.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--tz-text)" }}>Hotels</h1>
        <p style={{ color: "var(--tz-text-muted)", fontSize: "0.875rem" }}>Manage all listed hotels</p>
      </div>

      {error && (
        <div className="alert-error" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1.25rem", maxWidth: "380px" }}>
        <Search
          size={15}
          style={{
            position: "absolute", left: "0.875rem", top: "50%",
            transform: "translateY(-50%)", color: "var(--tz-text-muted)",
          }}
        />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search hotels…"
          style={{
            width: "100%",
            background: "var(--tz-input-bg)",
            border: "1px solid var(--tz-input-border)",
            color: "var(--tz-text)",
            borderRadius: "0.875rem",
            padding: "0.6rem 1rem 0.6rem 2.5rem",
            fontSize: "0.875rem",
            outline: "none",
          }}
        />
      </div>

      {/* Table */}
      <div style={{
        background: "var(--tz-card-bg)",
        border: "1px solid var(--tz-card-border)",
        borderRadius: "1.25rem",
        overflow: "hidden",
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--tz-border)" }}>
                {["Hotel", "Location", "Owner", "Rooms", "Rating", "Status", "Actions"].map(h => (
                  <th key={h} style={{
                    padding: "0.875rem 1.25rem", textAlign: "left",
                    fontSize: "0.72rem", fontWeight: 700,
                    color: "var(--tz-text-muted)", letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "var(--tz-text-muted)" }}>
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "var(--tz-text-faint)" }}>
                    No hotels found
                  </td>
                </tr>
              ) : filtered.map(h => {
                const sc = statusColors[h.status] || statusColors.INACTIVE;
                return (
                  <tr key={h.id} style={{ borderBottom: "1px solid var(--tz-border)" }}>

                    {/* Hotel name */}
                    <td style={{ padding: "0.875rem 1.25rem", fontWeight: 600, fontSize: "0.875rem", color: "var(--tz-text)" }}>
                      {h.name}
                    </td>

                    {/* Location */}
                    <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.85rem", color: "var(--tz-text-muted)" }}>
                      {h.location || "—"}
                    </td>

                    {/* Owner */}
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <div style={{ fontSize: "0.85rem", color: "var(--tz-text)" }}>{h.ownerName || "—"}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--tz-text-muted)" }}>{h.ownerEmail}</div>
                    </td>

                    {/* Rooms */}
                    <td style={{ padding: "0.875rem 1.25rem", fontSize: "0.85rem", color: "var(--tz-text)" }}>
                      {h.totalRooms ?? 0}
                    </td>

                    {/* Rating */}
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.85rem", color: "#d97706" }}>
                        <Star size={13} fill="#d97706" /> {h.rating?.toFixed(1) ?? "—"}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <select
                        value={h.status || "ACTIVE"}
                        onChange={e => handleStatus(h.id, e.target.value)}
                        style={{
                          background: sc.bg, color: sc.color,
                          border: `1px solid ${sc.border}`,
                          borderRadius: "999px", padding: "0.2rem 0.6rem",
                          fontSize: "0.72rem", fontWeight: 700,
                          cursor: "pointer", outline: "none",
                        }}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>

                    {/* Actions — RedButton replaces btn-3d-red */}
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <RedButton
                        onClick={() => handleDelete(h.id, h.name)}
                        icon={Trash2}
                        style={{ padding: "0.4rem 0.8rem" }}
                      >
                        Delete
                      </RedButton>
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