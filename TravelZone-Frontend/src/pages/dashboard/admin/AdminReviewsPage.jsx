import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { Trash2, AlertCircle, Search, Star } from "lucide-react";

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

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const load = () => {
    setLoading(true);
    api.get("/api/admin/reviews")
      .then(r => setReviews(r.data))
      .catch(() => setError("Failed to load reviews"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try { await api.delete(`/api/admin/reviews/${id}`); load(); }
    catch { setError("Failed to delete review"); }
  };

  const filtered = reviews.filter(r =>
    r.reviewerName?.toLowerCase().includes(search.toLowerCase()) ||
    r.targetName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--tz-text)" }}>Reviews</h1>
        <p style={{ color: "var(--tz-text-muted)", fontSize: "0.875rem" }}>Moderate all platform reviews</p>
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
          placeholder="Search reviewer or target…"
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

      {/* Review cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--tz-text-muted)" }}>
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--tz-text-faint)" }}>
            No reviews found
          </div>
        ) : filtered.map(r => (
          <div
            key={r.id}
            style={{
              background: "var(--tz-card-bg)",
              border: "1px solid var(--tz-card-border)",
              borderRadius: "1.1rem",
              padding: "1.25rem 1.5rem",
            }}
          >
            <div style={{
              display: "flex", alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "1rem", flexWrap: "wrap",
            }}>
              <div style={{ flex: 1 }}>
                {/* Reviewer info row */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  marginBottom: "0.5rem", flexWrap: "wrap",
                }}>
                  <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--tz-text)" }}>
                    {r.reviewerName}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--tz-text-muted)" }}>
                    {r.reviewerEmail}
                  </span>
                  <span style={{
                    background: "var(--tz-surface-2)", borderRadius: "0.5rem",
                    padding: "0.15rem 0.55rem", fontSize: "0.72rem",
                    fontWeight: 600, color: "var(--tz-text-muted)",
                  }}>
                    → {r.targetType}: {r.targetName}
                  </span>
                  {/* Star rating */}
                  <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < (r.rating || 0) ? "#f59e0b" : "none"}
                        color={i < (r.rating || 0) ? "#f59e0b" : "#94a3b8"}
                      />
                    ))}
                  </span>
                </div>

                {/* Comment */}
                <p style={{ fontSize: "0.875rem", color: "var(--tz-text-muted)", lineHeight: 1.6, margin: 0 }}>
                  {r.comment || <em style={{ color: "var(--tz-text-faint)" }}>No comment</em>}
                </p>

                {/* Date */}
                <p style={{ fontSize: "0.75rem", color: "var(--tz-text-faint)", marginTop: "0.4rem" }}>
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                </p>
              </div>

              {/* Actions — RedButton replaces btn-3d-red */}
              <RedButton
                onClick={() => handleDelete(r.id)}
                icon={Trash2}
                style={{ padding: "0.4rem 0.8rem", flexShrink: 0 }}
              >
                Delete
              </RedButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}