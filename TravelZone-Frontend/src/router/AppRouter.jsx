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
// ✅ NEW imports
import PaymentsPage from "../pages/dashboard/payments/PaymentsPage";
import ReviewsPage from "../pages/dashboard/reviews/ReviewsPage";

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
        <Route path="guides"            element={<GuidesPage />} />
        <Route path="guides/:guideId"   element={<GuideDetailPage />} />
        <Route path="hotels"            element={<HotelsPage />} />
        <Route path="hotels/:hotelId"   element={<HotelDetailPage />} />
        <Route path="bookings"          element={<MyBookingsPage />} />
        <Route path="payments"          element={<PaymentsPage />} />   {/* ✅ NEW */}
        <Route path="my-reviews"        element={<ReviewsPage />} />    {/* ✅ NEW */}

        {/* ── Guide ───────────────────────────────── */}
        <Route path="guide-profile"     element={<GuideProfilePage />} />
        <Route path="guide-bookings"    element={<GuideBookingRequestsPage />} />
        <Route path="guide-payments"    element={<PaymentsPage />} />   {/* ✅ NEW */}
        <Route path="guide-reviews"     element={<ReviewsPage />} />    {/* ✅ NEW */}

        {/* ── Hotel Owner ─────────────────────────── */}
        <Route path="my-hotels"         element={<MyHotelsPage />} />
        <Route path="rooms"             element={<ManageRoomsPage />} />
        <Route path="hotel-reservations" element={<HotelReservationsPage />} />
        <Route path="hotel-payments"    element={<PaymentsPage />} />   {/* ✅ NEW */}
        <Route path="hotel-reviews"     element={<ReviewsPage />} />    {/* ✅ NEW */}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;