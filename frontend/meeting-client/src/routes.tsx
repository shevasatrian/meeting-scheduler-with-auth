import { BrowserRouter, Routes, Route } from "react-router-dom";
import BookingPage from "./pages/Booking/BookingPage";
import BookingsPage from "./pages/Dashboard/DashboardPage";
import SettingsPage from "./pages/Settings/SettingsPage";
import LoginPage from "./pages/Auth/LoginPage";
import SidebarLayout from "./components/Layout/SidebarLayout";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login: TANPA sidebar */}
        <Route path="/login" element={<LoginPage />} />

        {/* Semua halaman lain ada sidebar */}
        <Route
          element={<SidebarLayout />}
        >
          {/* Public */}
          <Route path="/" element={<BookingPage />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

