import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardHome from "../pages/dashboard/DashboardHome";
import ProfilePage from "../pages/dashboard/ProfilePage";
import GuideProfilePage from "../pages/dashboard/guide/GuideProfilePage";
import GuideBookingRequestsPage from "../pages/dashboard/guide/GuideBookingRequestsPage";
import GuidesPage from "../pages/dashboard/tourist/GuidesPage";
import GuideDetailPage from "../pages/dashboard/tourist/GuideDetailPage";
import HotelsPage from "../pages/dashboard/tourist/HotelsPage";
import HotelDetailPage from "../pages/dashboard/tourist/HotelDetailPage";
import MyBookingsPage from "../pages/dashboard/tourist/MyBookingsPage";
import MyHotelsPage from "../pages/dashboard/hotel/MyHotelsPage";
import ManageRoomsPage from "../pages/dashboard/hotel/ManageRoomsPage";
import HotelReservationsPage from "../pages/dashboard/hotel/HotelReservationsPage";
import HomePage from "../pages/public/HomePage";
import PaymentsPage from "../pages/dashboard/payments/PaymentsPage";
import ReviewsPage from "../pages/dashboard/reviews/ReviewsPage";

// ── Admin imports ────────────────────────────────────────
import AdminOverviewPage     from "../pages/dashboard/admin/AdminOverviewPage";
import AdminUsersPage        from "../pages/dashboard/admin/AdminUsersPage";
import AdminGuidesPage       from "../pages/dashboard/admin/AdminGuidesPage";
import AdminHotelsPage       from "../pages/dashboard/admin/AdminHotelsPage";
import AdminBookingsPage     from "../pages/dashboard/admin/AdminBookingsPage";
import AdminReservationsPage from "../pages/dashboard/admin/AdminReservationsPage";
import AdminPaymentsPage     from "../pages/dashboard/admin/AdminPaymentsPage";
import AdminReviewsPage      from "../pages/dashboard/admin/AdminReviewsPage";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
      >
        <Route index element={<DashboardHome />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* ── Tourist ─────────────────────────────── */}
        <Route path="guides"             element={<GuidesPage />} />
        <Route path="guides/:guideId"    element={<GuideDetailPage />} />
        <Route path="hotels"             element={<HotelsPage />} />
        <Route path="hotels/:hotelId"    element={<HotelDetailPage />} />
        <Route path="bookings"           element={<MyBookingsPage />} />
        <Route path="payments"           element={<PaymentsPage />} />
        <Route path="my-reviews"         element={<ReviewsPage />} />

        {/* ── Guide ───────────────────────────────── */}
        <Route path="guide-profile"      element={<GuideProfilePage />} />
        <Route path="guide-bookings"     element={<GuideBookingRequestsPage />} />
        <Route path="guide-payments"     element={<PaymentsPage />} />
        <Route path="guide-reviews"      element={<ReviewsPage />} />

        {/* ── Hotel Owner ─────────────────────────── */}
        <Route path="my-hotels"          element={<MyHotelsPage />} />
        <Route path="rooms"              element={<ManageRoomsPage />} />
        <Route path="hotel-reservations" element={<HotelReservationsPage />} />
        <Route path="hotel-payments"     element={<PaymentsPage />} />
        <Route path="hotel-reviews"      element={<ReviewsPage />} />

        {/* ── Admin ───────────────────────────────── */}
        <Route path="admin"              element={<AdminOverviewPage />} />
        <Route path="admin/users"        element={<AdminUsersPage />} />
        <Route path="admin/guides"       element={<AdminGuidesPage />} />
        <Route path="admin/hotels"       element={<AdminHotelsPage />} />
        <Route path="admin/bookings"     element={<AdminBookingsPage />} />
        <Route path="admin/reservations" element={<AdminReservationsPage />} />
        <Route path="admin/payments"     element={<AdminPaymentsPage />} />
        <Route path="admin/reviews"      element={<AdminReviewsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;