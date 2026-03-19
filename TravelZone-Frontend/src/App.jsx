import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import ProfilePage from "./pages/user/ProfilePage";
import EditProfilePage from "./pages/user/EditProfilePage";
import GuideSearchPage from "./pages/guides/GuideSearchPage";
import GuideDetailPage from "./pages/guides/GuideDetailPage";
import AddGuideProfilePage from "./pages/guides/AddGuideProfilePage";
import GuideBookingsPage from "./pages/guides/GuideBookingsPage";
import HotelSearchPage from "./pages/hotels/HotelSearchPage";
import HotelDetailPage from "./pages/hotels/HotelDetailPage";
import AddHotelPage from "./pages/hotels/AddHotelPage";
import ReservationsPage from "./pages/hotels/ReservationsPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/guides" element={<GuideSearchPage />} />
        <Route path="/guides/:guideId" element={<GuideDetailPage />} />
        <Route path="/hotels" element={<HotelSearchPage />} />
        <Route path="/hotels/:hotelId" element={<HotelDetailPage />} />

        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId/edit"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guides/add"
          element={
            <ProtectedRoute>
              <AddGuideProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guides/bookings"
          element={
            <ProtectedRoute>
              <GuideBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotels/add"
          element={
            <ProtectedRoute>
              <AddHotelPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hotels/reservations"
          element={
            <ProtectedRoute>
              <ReservationsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
