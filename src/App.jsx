import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/app/Dashboard';
import Guests from './pages/app/Guests';
import GuestProfile from './pages/app/GuestProfile';
import Pipeline from './pages/app/Pipeline';
import Episodes from './pages/app/Episodes';
import EpisodeDetail from './pages/app/EpisodeDetail';
import Bookings from './pages/app/Bookings';
import Notes from './pages/app/Notes';
import Settings from './pages/app/Settings';
import AdminIndex from './pages/admin/AdminIndex';
import AdminGuests from './pages/admin/AdminGuests';
import AdminEpisodes from './pages/admin/AdminEpisodes';
import AdminBookings from './pages/admin/AdminBookings';
import AdminNotes from './pages/admin/AdminNotes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="guests" element={<Guests />} />
            <Route path="guests/:id" element={<GuestProfile />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="episodes" element={<Episodes />} />
            <Route path="episodes/:id" element={<EpisodeDetail />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="notes" element={<Notes />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminIndex />} />
            <Route path="guests" element={<AdminGuests />} />
            <Route path="episodes" element={<AdminEpisodes />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="notes" element={<AdminNotes />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
