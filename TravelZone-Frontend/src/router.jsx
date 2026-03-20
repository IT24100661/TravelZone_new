// src/router.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

import GuideDashboardPage from "./pages/guide/GuideDashboardPage";
import GuideProfilePage from "./pages/guide/GuideProfilePage";
import GuideAvailabilityPage from "./pages/guide/GuideAvailabilityPage";
import GuideBookingsPage from "./pages/guide/GuideBookingsPage";

import HotelDashboardPage from "./pages/hotel/HotelDashboardPage";
import HotelListingsPage from "./pages/hotel/HotelListingsPage";
import HotelRoomsPage from "./pages/hotel/HotelRoomsPage";
import HotelReservationsPage from "./pages/hotel/HotelReservationsPage";

import TouristDashboardPage from "./pages/tourist/TouristDashboardPage";
import GuideSearchPage from "./pages/tourist/GuideSearchPage";
import GuideDetailPage from "./pages/tourist/GuideDetailPage";
import HotelSearchPage from "./pages/tourist/HotelSearchPage";
import HotelDetailPage from "./pages/tourist/HotelDetailPage";
import TouristGuideBookingsPage from "./pages/tourist/TouristGuideBookingsPage";
import TouristReservationsPage from "./pages/tourist/TouristReservationsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/tourist" replace />,
  },

  {
    path: "/guide",
    element: (
      <ProtectedRoute allowedRoles={["GUIDE"]}>
        <DashboardLayout role="GUIDE" />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <GuideDashboardPage /> },
      { path: "profile", element: <GuideProfilePage /> },
      { path: "availability", element: <GuideAvailabilityPage /> },
      { path: "bookings", element: <GuideBookingsPage /> },
    ],
  },

  {
    path: "/hotel",
    element: (
      <ProtectedRoute allowedRoles={["HOTEL_OWNER"]}>
        <DashboardLayout role="HOTEL_OWNER" />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HotelDashboardPage /> },
      { path: "listings", element: <HotelListingsPage /> },
      { path: "rooms", element: <HotelRoomsPage /> },
      { path: "reservations", element: <HotelReservationsPage /> },
    ],
  },

  {
    path: "/tourist",
    element: (
      <ProtectedRoute allowedRoles={["TOURIST"]}>
        <DashboardLayout role="TOURIST" />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <TouristDashboardPage /> },
      { path: "guides", element: <GuideSearchPage /> },
      { path: "guides/:guideId", element: <GuideDetailPage /> },
      { path: "hotels", element: <HotelSearchPage /> },
      { path: "hotels/:hotelId", element: <HotelDetailPage /> },
      { path: "guide-bookings", element: <TouristGuideBookingsPage /> },
      { path: "reservations", element: <TouristReservationsPage /> },
    ],
  },
]);
