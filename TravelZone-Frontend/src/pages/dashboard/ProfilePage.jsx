import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import api from "../../api/axios";
import {
  User, Mail, Phone, FileText, Save, Trash2,
  CheckCircle, AlertCircle, Pencil, X,
  MapPin, Calendar, Shield, Camera
} from "lucide-react";
import ImageUpload from "../../components/ui/ImageUpload";

/* ─────────────────────────────────────────────────────────
   ROLE COLOURS
───────────────────────────────────────────────────────── */
const roleGradient = {
  TOURIST:     { from: "#34d399", to: "#0d9488", shadow: "rgba(52,211,153,0.45)" },
  GUIDE:       { from: "#60a5fa", to: "#4f46e5", shadow: "rgba(96,165,250,0.45)" },
  HOTEL_OWNER: { from: "#a78bfa", to: "#7c3aed", shadow: "rgba(167,139,250,0.45)" },
  ADMIN:       { from: "#f87171", to: "#dc2626", shadow: "rgba(248,113,113,0.45)" },
};
const roleHeroBg = {
  TOURIST:     "linear-gradient(135deg,#065f46 0%,#0d9488 100%)",
  GUIDE:       "linear-gradient(135deg,#1d4ed8 0%,#4f46e5 100%)",
  HOTEL_OWNER: "linear-gradient(135deg,#5b21b6 0%,#7c3aed 100%)",
  ADMIN:       "linear-gradient(135deg,#9f1239 0%,#dc2626 100%)",
};
const roleHeroShadow = {
  TOURIST:     "0 6px 0px #064e3b, 0 12px 32px rgba(16,185,129,0.4)",
  GUIDE:       "0 6px 0px #1e3a8a, 0 12px 32px rgba(59,130,246,0.4)",
  HOTEL_OWNER: "0 6px 0px #3b0764, 0 12px 32px rgba(139,92,246,0.4)",
  ADMIN:       "0 6px 0px #7f1d1d, 0 12px 32px rgba(239,68,68,0.4)",
};

/* ─────────────────────────────────────────────────────────
   INFO ROW — read-only display
───────────────────────────────────────────────────────── */
function InfoRow({ icon: Icon, label, value, placeholder = "Not set" }) {
  return (
    <div className="info-row">
      <div className="info-row-icon">
        <Icon size={15} />
      </div>
      <div className="info-row-body">
        <span className="info-row-label">{label}</span>
        <span className={`info-row-value ${!value ? "info-row-empty" : ""}`}>
          {value || placeholder}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
function ProfilePage() {
  const { user, logout } = useAuth();

  /* ── server data (read-only display) ── */
  const [profile, setProfile] = useState(null);
  const [fetchError, setFetchError] = useState("");

  /* ── edit modal ── */
  const [showEdit, setShowEdit]     = useState(false);
  const [form, setForm]             = useState({ name: "", phone: "", bio: "", profilePicture: "" });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState("");
  const [error, setError]           = useState("");

  /* ── delete ── */
  const [deleteError, setDeleteError] = useState("");

  const role    = user?.role || "GUIDE";
  const grad    = roleGradient[role]   || roleGradient.GUIDE;
  const heroBg  = roleHeroBg[role]     || roleHeroBg.GUIDE;
  const heroShd = roleHeroShadow[role] || roleHeroShadow.GUIDE;

  /* ── fetch profile ── */
  const loadProfile = () => {
    if (!user?.id) return;
    api.get(`/api/users/${user.id}`)
      .then((res) => {
        setProfile(res.data);
        setFetchError("");
      })
      .catch(() => setFetchError("Could not load profile."));
  };

  useEffect(() => { loadProfile(); }, [user?.id]);

  /* ── open edit modal pre-filled ── */
  const openEdit = () => {
    if (!profile) return;
    setForm({
      name:           profile.name           || "",
      phone:          profile.phone          || "",
      bio:            profile.bio            || "",
      profilePicture: profile.profilePicture || "",
    });
    setPhotoPreview(profile.profilePicture || null);
    setError(""); setSuccess("");
    setShowEdit(true);
  };

  const closeEdit = () => {
    setShowEdit(false);
    setError(""); setSuccess("");
  };

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  /* ── save ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      await api.put(`/api/users/${user.id}`, form);
      setSuccess("Profile updated successfully!");
      loadProfile();               // refresh view
      setTimeout(() => {
        closeEdit();
      }, 1200);
    } catch (err) {
      setError(err?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ── delete ── */
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    try {
      await api.delete(`/api/users/${user.id}`);
      logout();
    } catch (err) {
      setDeleteError(err?.response?.data?.message || "Delete failed");
    }
  };

  const displayName  = profile?.name           || user?.name  || "—";
  const displayPhone = profile?.phone          || "";
  const displayBio   = profile?.bio            || "";
  const displayPhoto = profile?.profilePicture || "";
  const joinedDate   = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  /* ════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        /* ──────────────────────────────────────────
           HERO CARD
        ────────────────────────────────────────── */
        .profile-hero {
          position: relative; overflow: hidden;
          border-radius: 1.5rem;
          padding: 2rem 1.75rem;
          display: flex; align-items: center; gap: 1.5rem;
          margin-bottom: 1.5rem;
          inset: 0 1px 0 rgba(255,255,255,0.2);
        }
        .profile-hero-gloss {
          position: absolute; top: 0; left: 0; right: 0; height: 50%;
          border-radius: 1.5rem 1.5rem 0 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%);
          pointer-events: none;
        }
        .profile-hero-orb {
          position: absolute; top: -2rem; right: -2rem;
          width: 10rem; height: 10rem;
          background: rgba(255,255,255,0.07);
          border-radius: 9999px; filter: blur(28px); pointer-events: none;
        }
        .profile-hero-orb2 {
          position: absolute; bottom: -2.5rem; left: 25%;
          width: 7rem; height: 7rem;
          background: rgba(255,255,255,0.1);
          border-radius: 9999px; filter: blur(22px); pointer-events: none;
        }

        /* 3D avatar */
        .profile-avatar {
          position: relative; overflow: hidden; flex-shrink: 0;
          width: 5rem; height: 5rem; border-radius: 1.1rem;
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem; font-weight: 900; color: #fff;
          border: 2.5px solid rgba(255,255,255,0.32);
          box-shadow: 0 5px 0px rgba(0,0,0,0.28), 0 10px 24px rgba(0,0,0,0.22),
                      inset 0 1px 0 rgba(255,255,255,0.38);
          z-index: 2;
        }
        .profile-avatar::before {
          content: ""; position: absolute; top: 4px; left: 10%; width: 80%; height: 42%;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(255,255,255,0.42) 0%, transparent 100%);
          pointer-events: none;
        }
        .profile-avatar img {
          width: 100%; height: 100%; object-fit: cover;
          border-radius: calc(1.1rem - 2px); position: relative; z-index: 2;
        }

        .profile-role-pill {
          display: inline-block;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          color: rgba(255,255,255,0.92); font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 0.18rem 0.7rem; border-radius: 999px; margin-top: 0.3rem;
        }

        /* ──────────────────────────────────────────
           INFO CARD (view mode)
        ────────────────────────────────────────── */
        .profile-card {
          background: var(--tz-card-bg);
          border: 1px solid var(--tz-card-border);
          border-radius: 1.5rem; padding: 1.75rem;
          box-shadow: 0 4px 0px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.07);
          transition: background 0.3s ease, border-color 0.3s ease;
          margin-bottom: 1.25rem;
        }
        .profile-card-title {
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--tz-text-muted);
          margin-bottom: 1rem;
        }

        .info-row {
          display: flex; align-items: flex-start; gap: 0.875rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--tz-border);
        }
        .info-row:last-child { border-bottom: none; padding-bottom: 0; }
        .info-row-icon {
          width: 2rem; height: 2rem; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border-radius: 0.5rem;
          background: var(--tz-surface-2);
          color: var(--tz-text-muted);
        }
        .info-row-body { display: flex; flex-direction: column; gap: 0.1rem; }
        .info-row-label {
          font-size: 0.72rem; font-weight: 600; color: var(--tz-text-muted);
          letter-spacing: 0.04em; text-transform: uppercase;
        }
        .info-row-value {
          font-size: 0.9rem; font-weight: 500; color: var(--tz-text); line-height: 1.4;
        }
        .info-row-empty { color: var(--tz-text-faint) !important; font-style: italic; }

        /* bio multiline */
        .info-bio {
          font-size: 0.875rem; line-height: 1.65;
          color: var(--tz-text); white-space: pre-wrap;
        }
        .info-bio-empty { color: var(--tz-text-faint); font-style: italic; }

        /* ──────────────────────────────────────────
           EDIT PROFILE BUTTON
        ────────────────────────────────────────── */
        .btn-edit-profile {
          position: relative; overflow: hidden;
          display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
          width: 100%; padding: 0.85rem 1.5rem;
          font-weight: 700; font-size: 0.9rem; letter-spacing: 0.02em;
          color: #fff !important; border: none; border-radius: 1rem;
          cursor: pointer; outline: none;
          background: linear-gradient(175deg, #1d4ed8 0%, #2563eb 45%, #3b82f6 75%, #60a5fa 100%);
          transform: translateY(-2px);
          transition: transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.15s ease, filter 0.15s ease;
          box-shadow: 0 5px 0px #1e3a8a, 0 10px 24px rgba(59,130,246,0.45), 0 2px 6px rgba(0,0,0,0.3);
        }
        .btn-edit-profile::before {
          content: ""; position: absolute; top: 4px; left: 12%; width: 76%; height: 40%;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%);
          pointer-events: none; z-index: 1;
        }
        .btn-edit-profile::after {
          content: ""; position: absolute; bottom: 0; left: 0; width: 100%; height: 42%;
          border-radius: 0 0 1rem 1rem;
          background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.28) 100%);
          pointer-events: none; z-index: 0;
        }
        .btn-edit-profile > * { position: relative; z-index: 2; color: #fff !important; }
        .btn-edit-profile:hover {
          transform: translateY(-4px); filter: brightness(1.08);
          box-shadow: 0 7px 0px #1e3a8a, 0 16px 32px rgba(59,130,246,0.55), 0 4px 8px rgba(0,0,0,0.3);
        }
        .btn-edit-profile:active {
          transform: translateY(1px);
          box-shadow: 0 2px 0px #1e3a8a, 0 4px 10px rgba(59,130,246,0.3);
        }

        /* ──────────────────────────────────────────
           MODAL OVERLAY
        ────────────────────────────────────────── */
        .modal-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          animation: fadeIn 0.18s ease;
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

        .modal-box {
          background: var(--tz-surface);
          border: 1px solid var(--tz-border);
          border-radius: 1.5rem;
          width: 100%; max-width: 520px;
          max-height: 92vh; overflow-y: auto;
          box-shadow: 0 8px 0px rgba(0,0,0,0.2), 0 24px 60px rgba(0,0,0,0.35);
          animation: slideUp 0.22s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97) }
          to   { opacity: 1; transform: translateY(0)   scale(1)    }
        }

        /* modal header */
        .modal-header {
          position: sticky; top: 0; z-index: 10;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 1.5rem 1rem;
          border-bottom: 1px solid var(--tz-border);
          background: var(--tz-surface);
          border-radius: 1.5rem 1.5rem 0 0;
        }
        .modal-title {
          font-size: 1.05rem; font-weight: 800;
          color: var(--tz-text); letter-spacing: -0.01em;
        }
        .modal-close {
          width: 2rem; height: 2rem;
          display: flex; align-items: center; justify-content: center;
          border: none; background: var(--tz-surface-2);
          border-radius: 0.625rem; cursor: pointer;
          color: var(--tz-text-muted);
          transition: background 0.15s ease, color 0.15s ease;
        }
        .modal-close:hover {
          background: var(--tz-border); color: var(--tz-text);
        }

        .modal-body { padding: 1.5rem; }

        /* ──────────────────────────────────────────
           ALERTS
        ────────────────────────────────────────── */
        .alert-success {
          display: flex; align-items: center; gap: 0.5rem;
          background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3);
          color: #059669; padding: 0.75rem 1rem; border-radius: 0.875rem;
          font-size: 0.875rem; margin-bottom: 1.25rem;
        }
        .alert-error {
          display: flex; align-items: center; gap: 0.5rem;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
          color: #dc2626; padding: 0.75rem 1rem; border-radius: 0.875rem;
          font-size: 0.875rem; margin-bottom: 1.25rem;
        }
        .dark .alert-success { color: #34d399; }
        .dark .alert-error   { color: #f87171; }

        /* ──────────────────────────────────────────
           INPUTS
        ────────────────────────────────────────── */
        .input-group { margin-bottom: 1.1rem; }
        .input-label {
          display: block; font-size: 0.8rem; font-weight: 600;
          color: var(--tz-text); margin-bottom: 0.35rem; letter-spacing: 0.01em;
        }
        .input-wrap { position: relative; }
        .input-icon {
          position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%);
          color: var(--tz-text-muted); pointer-events: none;
          display: flex; align-items: center;
        }
        .input-icon-top {
          position: absolute; left: 0.875rem; top: 0.72rem;
          color: var(--tz-text-muted); pointer-events: none;
        }
        .field-input {
          width: 100%; background: var(--tz-input-bg);
          border: 1px solid var(--tz-input-border); color: var(--tz-text);
          border-radius: 0.875rem; padding: 0.65rem 1rem 0.65rem 2.5rem;
          font-size: 0.875rem; outline: none; font-family: inherit;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .field-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
        .field-input::placeholder { color: var(--tz-text-faint); }
        .field-input:disabled {
          background: var(--tz-surface-2); border-color: var(--tz-border-soft);
          color: var(--tz-text-muted); cursor: not-allowed; opacity: 0.7;
        }
        .field-textarea {
          width: 100%; background: var(--tz-input-bg);
          border: 1px solid var(--tz-input-border); color: var(--tz-text);
          border-radius: 0.875rem; padding: 0.65rem 1rem 0.65rem 2.5rem;
          font-size: 0.875rem; outline: none; resize: none; font-family: inherit;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .field-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
        .field-textarea::placeholder { color: var(--tz-text-faint); }

        .form-divider {
          border: none; border-top: 1px solid var(--tz-border); margin: 1.25rem 0;
        }

        /* ──────────────────────────────────────────
           SAVE BUTTON
        ────────────────────────────────────────── */
        .btn-save {
          position: relative; overflow: hidden;
          display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.72rem 1.6rem; font-weight: 700; font-size: 0.875rem;
          letter-spacing: 0.02em; color: #fff !important;
          border: none; border-radius: 0.875rem; cursor: pointer; outline: none;
          background: linear-gradient(175deg, #1d4ed8 0%, #2563eb 45%, #3b82f6 75%, #60a5fa 100%);
          transform: translateY(-2px);
          transition: transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.15s ease, filter 0.15s ease;
          box-shadow: 0 5px 0px #1e3a8a, 0 8px 20px rgba(59,130,246,0.45), 0 2px 6px rgba(0,0,0,0.3);
        }
        .btn-save::before {
          content: ""; position: absolute; top: 4px; left: 15%; width: 70%; height: 38%;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(255,255,255,0.42) 0%, transparent 100%);
          pointer-events: none; z-index: 1;
        }
        .btn-save::after {
          content: ""; position: absolute; bottom: 0; left: 0; width: 100%; height: 40%;
          border-radius: 0 0 0.875rem 0.875rem;
          background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.25) 100%);
          pointer-events: none; z-index: 0;
        }
        .btn-save > * { position: relative; z-index: 2; color: #fff !important; }
        .btn-save:hover {
          transform: translateY(-4px); filter: brightness(1.08);
          box-shadow: 0 7px 0px #1e3a8a, 0 14px 28px rgba(59,130,246,0.55), 0 4px 8px rgba(0,0,0,0.3);
        }
        .btn-save:active { transform: translateY(1px); }
        .btn-save:disabled { opacity: 0.55; cursor: not-allowed; transform: translateY(-2px); }

        /* cancel */
        .btn-cancel {
          position: relative; overflow: hidden;
          display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.72rem 1.4rem; font-weight: 700; font-size: 0.875rem;
          letter-spacing: 0.02em; color: var(--tz-text-muted) !important;
          border: 1px solid var(--tz-border); border-radius: 0.875rem;
          cursor: pointer; outline: none;
          background: var(--tz-surface-2);
          transform: translateY(-2px);
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
          box-shadow: 0 3px 0px var(--tz-border), 0 4px 10px rgba(0,0,0,0.06);
        }
        .btn-cancel > * { position: relative; z-index: 2; }
        .btn-cancel:hover {
          transform: translateY(-3px); background: var(--tz-border);
          color: var(--tz-text) !important;
          box-shadow: 0 5px 0px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08);
        }
        .btn-cancel:active { transform: translateY(1px); }

        /* ──────────────────────────────────────────
           DELETE BUTTON
        ────────────────────────────────────────── */
        .btn-delete {
          position: relative; overflow: hidden;
          display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.72rem 1.6rem; font-weight: 700; font-size: 0.875rem;
          letter-spacing: 0.02em; color: #fff !important;
          border: none; border-radius: 0.875rem; cursor: pointer; outline: none;
          background: linear-gradient(175deg, #7f1d1d 0%, #991b1b 35%, #b91c1c 70%, #dc2626 100%);
          transform: translateY(-2px);
          transition: transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.15s ease, filter 0.15s ease;
          box-shadow: 0 5px 0px #450a0a, 0 8px 20px rgba(185,28,28,0.5), 0 2px 6px rgba(0,0,0,0.35);
        }
        .btn-delete::before {
          content: ""; position: absolute; top: 4px; left: 15%; width: 70%; height: 38%;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 100%);
          pointer-events: none; z-index: 1;
        }
        .btn-delete::after {
          content: ""; position: absolute; bottom: 0; left: 0; width: 100%; height: 45%;
          border-radius: 0 0 0.875rem 0.875rem;
          background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.35) 100%);
          pointer-events: none; z-index: 0;
        }
        .btn-delete > * { position: relative; z-index: 2; color: #fff !important; }
        .btn-delete:hover {
          transform: translateY(-4px); filter: brightness(1.1);
          box-shadow: 0 7px 0px #450a0a, 0 14px 28px rgba(185,28,28,0.6), 0 4px 8px rgba(0,0,0,0.35);
        }
        .btn-delete:active { transform: translateY(1px); }
        .btn-delete:disabled { opacity: 0.55; cursor: not-allowed; transform: translateY(-2px); }
        .dark .btn-delete {
          color: #fca5a5 !important;
          background: linear-gradient(175deg, #1a0404 0%, #2d0808 35%, #450a0a 70%, #5c1010 100%);
          border: 1px solid #7f1d1d;
          box-shadow: 0 5px 0px #0f0202, 0 8px 20px rgba(127,29,29,0.55), 0 2px 6px rgba(0,0,0,0.5);
        }
        .dark .btn-delete > * { color: #fca5a5 !important; }
        .dark .btn-delete:hover {
          color: #fecaca !important; filter: brightness(1.15);
          background: linear-gradient(175deg, #2d0808 0%, #450a0a 35%, #5c1010 70%, #7f1d1d 100%);
          box-shadow: 0 7px 0px #0f0202, 0 14px 28px rgba(127,29,29,0.65), 0 4px 8px rgba(0,0,0,0.5);
        }
        .dark .btn-delete:hover > * { color: #fecaca !important; }

        /* ──────────────────────────────────────────
           DANGER ZONE
        ────────────────────────────────────────── */
        .danger-zone {
          border: 1px solid rgba(239,68,68,0.2); border-radius: 1rem;
          padding: 1.25rem 1.5rem;
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem; flex-wrap: wrap;
          background: rgba(239,68,68,0.03);
        }
        .dark .danger-zone {
          border-color: rgba(127,29,29,0.4);
          background: rgba(127,29,29,0.06);
        }
        .danger-zone-text h4 {
          font-size: 0.875rem; font-weight: 700; color: #dc2626; margin-bottom: 0.2rem;
        }
        .dark .danger-zone-text h4 { color: #f87171; }
        .danger-zone-text p {
          font-size: 0.78rem; color: var(--tz-text-muted); max-width: 32ch; line-height: 1.5;
        }

        /* ──────────────────────────────────────────
           SECTION LABEL
        ────────────────────────────────────────── */
        .section-title {
          font-size: 1.4rem; font-weight: 900; color: var(--tz-text);
          margin-bottom: 1.5rem; letter-spacing: -0.015em;
        }
      `}</style>

      <div className="max-w-2xl mx-auto">
        <h1 className="section-title">My Profile</h1>

        {fetchError && (
          <div className="alert-error" style={{ marginBottom: "1rem" }}>
            <AlertCircle size={15} /> {fetchError}
          </div>
        )}

        {/* ══════════════════════════════════════════
            HERO CARD
        ══════════════════════════════════════════ */}
        <div
          className="profile-hero"
          style={{ background: heroBg, boxShadow: heroShd + ", inset 0 1px 0 rgba(255,255,255,0.2)" }}
        >
          <div className="profile-hero-gloss" />
          <div className="profile-hero-orb" />
          <div className="profile-hero-orb2" />

          {/* Avatar */}
          <div
            className="profile-avatar"
            style={{
              background: displayPhoto
                ? "transparent"
                : `linear-gradient(145deg, ${grad.from}, ${grad.to})`,
            }}
          >
            {displayPhoto ? (
              <img src={displayPhoto} alt="Profile" />
            ) : (
              <span style={{ position: "relative", zIndex: 2 }}>
                {displayName?.charAt(0)?.toUpperCase() || "U"}
              </span>
            )}
          </div>

          {/* Info */}
          <div style={{ position: "relative", zIndex: 2, flex: 1 }}>
            <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.2rem", lineHeight: 1.3 }}>
              {displayName}
            </h2>
            <p style={{ color: "rgba(210,230,255,0.82)", fontSize: "0.82rem", marginTop: "0.15rem" }}>
              {user?.email}
            </p>
            <span className="profile-role-pill">{role?.replace("_", " ")}</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            INFO CARD — read-only details
        ══════════════════════════════════════════ */}
        <div className="profile-card">
          <p className="profile-card-title">Account Details</p>

          <InfoRow icon={User}     label="Full Name"  value={displayName} />
          <InfoRow icon={Mail}     label="Email"      value={user?.email} />
          <InfoRow icon={Phone}    label="Phone"      value={displayPhone} placeholder="No phone added" />
          <InfoRow icon={Shield}   label="Role"       value={role?.replace("_", " ")} />
          

          {/* Bio — separate block */}
          {(displayBio || true) && (
            <div style={{ paddingTop: "0.75rem" }}>
              <div className="info-row-icon" style={{ marginBottom: "0.5rem", display: "inline-flex" }}>
                <FileText size={15} />
              </div>
              <p className="profile-card-title" style={{ marginBottom: "0.4rem" }}>Bio</p>
              <p className={displayBio ? "info-bio" : "info-bio info-bio-empty"}>
                {displayBio || "No bio added yet."}
              </p>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════
            EDIT PROFILE BUTTON
        ══════════════════════════════════════════ */}
        <div style={{ marginBottom: "1.25rem" }}>
          <button className="btn-edit-profile" onClick={openEdit}>
            <Pencil size={16} />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* ══════════════════════════════════════════
            DANGER ZONE
        ══════════════════════════════════════════ */}
        <div className="profile-card">
          {deleteError && (
            <div className="alert-error" style={{ marginBottom: "1rem" }}>
              <AlertCircle size={15} /> {deleteError}
            </div>
          )}
          <div className="danger-zone">
            <div className="danger-zone-text">
              <h4>Delete Account</h4>
              <p>Permanently removes your account and all data. This cannot be undone.</p>
            </div>
            <button type="button" onClick={handleDelete} className="btn-delete">
              <Trash2 size={15} />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          EDIT MODAL
      ════════════════════════════════════════════ */}
      {showEdit && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeEdit()}>
          <div className="modal-box">

            {/* Header */}
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <div style={{
                  width: "2rem", height: "2rem", borderRadius: "0.625rem",
                  background: "linear-gradient(145deg,#2563eb,#4f46e5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 3px 0px #1e3a8a, 0 4px 12px rgba(59,130,246,0.4)"
                }}>
                  <Camera size={13} color="#fff" />
                </div>
                <span className="modal-title">Edit Profile</span>
              </div>
              <button className="modal-close" onClick={closeEdit} aria-label="Close">
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="modal-body">

              {success && (
                <div className="alert-success">
                  <CheckCircle size={15} /> {success}
                </div>
              )}
              {error && (
                <div className="alert-error">
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                {/* Full Name */}
                <div className="input-group">
                  <label className="input-label">Full Name *</label>
                  <div className="input-wrap">
                    <span className="input-icon"><User size={15} /></span>
                    <input
                      name="name" value={form.name} onChange={handleChange}
                      required placeholder="Your full name"
                      className="field-input"
                    />
                  </div>
                </div>

                {/* Email — readonly */}
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <div className="input-wrap">
                    <span className="input-icon"><Mail size={15} /></span>
                    <input
                      value={user?.email} disabled
                      className="field-input"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="input-group">
                  <label className="input-label">Phone</label>
                  <div className="input-wrap">
                    <span className="input-icon"><Phone size={15} /></span>
                    <input
                      name="phone" value={form.phone} onChange={handleChange}
                      placeholder="+94 77 000 0000"
                      className="field-input"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="input-group">
                  <label className="input-label">Bio</label>
                  <div className="input-wrap">
                    <span className="input-icon-top"><FileText size={15} /></span>
                    <textarea
                      name="bio" value={form.bio} onChange={handleChange}
                      rows={3} placeholder="Tell something about yourself..."
                      className="field-textarea"
                    />
                  </div>
                </div>

                {/* Profile picture */}
                <ImageUpload
                  label="Profile Picture"
                  preview={photoPreview}
                  onChange={(base64) => {
                    setPhotoPreview(base64);
                    setForm((p) => ({ ...p, profilePicture: base64 }));
                  }}
                  onClear={() => {
                    setPhotoPreview(null);
                    setForm((p) => ({ ...p, profilePicture: "" }));
                  }}
                  setError={setError}
                  maxMB={2}
                />

                <hr className="form-divider" />

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <button type="submit" disabled={loading} className="btn-save">
                    <Save size={15} />
                    <span>{loading ? "Saving…" : "Save Changes"}</span>
                  </button>
                  <button type="button" onClick={closeEdit} className="btn-cancel">
                    <X size={15} />
                    <span>Cancel</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProfilePage;