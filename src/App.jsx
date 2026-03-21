import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/app/Dashboard';
import Guests from './pages/app/Guests';
import GuestProfile from './pages/app/GuestProfile';
import Pipeline from './pages/app/Pipeline';
import Episodes from './pages/app/Episodes';
import EpisodeDetail from './pages/app/EpisodeDetail';
import Bookings from './pages/app/Bookings';
import Notes from './pages/app/Notes';
import Followups from './pages/app/Followups';
import Settings from './pages/app/Settings';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
              <Route path="followups" element={<Followups />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            {/* Redirect old /admin URLs to /app */}
            <Route path="/admin/*" element={<Navigate to="/app" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
