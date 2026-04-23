import { useEffect, useState } from "react";
import api from "../../../api/axios";
import {
  Users, MapPin, Building2, CalendarCheck,
  BedDouble, CreditCard, Star, TrendingUp,
  Clock, DollarSign
} from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div style={{
    background: "var(--tz-card-bg)", border: "1px solid var(--tz-card-border)",
    borderRadius: "1.25rem", padding: "1.5rem",
    boxShadow: "0 4px 0px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.06)"
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
      <div style={{
        width: "2.75rem", height: "2.75rem", borderRadius: "0.875rem",
        background: color, display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 0px rgba(0,0,0,0.2), 0 6px 16px rgba(0,0,0,0.15)"
      }}>
        <Icon size={18} color="#fff" />
      </div>
    </div>
    <p style={{ fontSize: "1.85rem", fontWeight: 900, color: "var(--tz-text)", lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: "0.8rem", color: "var(--tz-text-muted)", marginTop: "0.35rem", fontWeight: 600 }}>{label}</p>
    {sub && <p style={{ fontSize: "0.72rem", color: "var(--tz-text-faint)", marginTop: "0.2rem" }}>{sub}</p>}
  </div>
);

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/admin/stats")
      .then(r => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: "2rem", color: "var(--tz-text-muted)" }}>Loading stats…</div>
  );

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0.5rem 0" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--tz-text)", letterSpacing: "-0.02em" }}>
          Admin Dashboard
        </h1>
        <p style={{ color: "var(--tz-text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Platform-wide overview
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <StatCard icon={Users}        label="Total Users"        value={stats?.totalUsers ?? 0}        color="linear-gradient(145deg,#2563eb,#1d4ed8)" />
        <StatCard icon={MapPin}       label="Guides"             value={stats?.totalGuides ?? 0}       color="linear-gradient(145deg,#7c3aed,#6d28d9)" />
        <StatCard icon={Building2}    label="Hotels"             value={stats?.totalHotels ?? 0}       color="linear-gradient(145deg,#0891b2,#0e7490)" />
        <StatCard icon={CalendarCheck} label="Guide Bookings"   value={stats?.totalBookings ?? 0}     color="linear-gradient(145deg,#059669,#047857)"
          sub={`${stats?.pendingBookings ?? 0} pending`} />
        <StatCard icon={BedDouble}    label="Hotel Reservations" value={stats?.totalReservations ?? 0} color="linear-gradient(145deg,#d97706,#b45309)"
          sub={`${stats?.pendingReservations ?? 0} pending`} />
        <StatCard icon={CreditCard}   label="Payments"           value={stats?.totalPayments ?? 0}     color="linear-gradient(145deg,#dc2626,#b91c1c)" />
        <StatCard icon={DollarSign}   label="Total Revenue"      value={`LKR${(stats?.totalRevenue ?? 0).toFixed(2)}`} color="linear-gradient(145deg,#16a34a,#15803d)" />
        <StatCard icon={Star}         label="Reviews"            value={stats?.totalReviews ?? 0}      color="linear-gradient(145deg,#ea580c,#c2410c)" />
      </div>

      {/* Quick links */}
      <div style={{
        background: "var(--tz-card-bg)", border: "1px solid var(--tz-card-border)",
        borderRadius: "1.25rem", padding: "1.5rem"
      }}>
        <p style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--tz-text-muted)", marginBottom: "1rem" }}>
          Quick Actions
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {[
            { label: "Manage Users",        href: "/dashboard/admin/users" },
            { label: "Manage Guides",       href: "/dashboard/admin/guides" },
            { label: "Manage Hotels",       href: "/dashboard/admin/hotels" },
            { label: "View All Bookings",   href: "/dashboard/admin/bookings" },
            { label: "View Payments",       href: "/dashboard/admin/payments" },
          ].map(item => (
            <a key={item.href} href={item.href} className="btn-3d-slate" style={{ textDecoration: "none", fontSize: "0.82rem", padding: "0.55rem 1.1rem" }}>
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}