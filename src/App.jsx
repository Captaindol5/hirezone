import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingState from './components/LoadingState';

import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import PortalSelectPage from './pages/PortalSelectPage';
import LoginPage from './pages/LoginPage';
import CandidatePortal from './pages/portals/CandidatePortal';
import InterviewerPortal from './pages/portals/InterviewerPortal';
import HrPipelinePortal from './pages/portals/HrPipelinePortal';
import ManagerAnalyticsPortal from './pages/portals/ManagerAnalyticsPortal';

const RoleBasedRedirect = () => {
  const { userRole, loading } = useAuth();

  if (loading) {
    return <LoadingState title="Checking access" message="Loading your workspace permissions..." />;
  }

  if (userRole === 'candidate') return <Navigate to="/portal/candidate" replace />;
  if (userRole === 'interviewer') return <Navigate to="/portal/interviewer" replace />;
  if (userRole === 'hr' || userRole === 'hiring_manager') return <Navigate to="/portal/hr" replace />;
  if (userRole === 'manager') return <Navigate to="/portal/analytics" replace />;

  return <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingState title="Initializing HireZone" message="Setting up your secure workspace..." />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/login" element={<PortalSelectPage />} />
        <Route path="/login/:role" element={<LoginPage />} />
        <Route path="/dashboard" element={<RoleBasedRedirect />} />

        <Route path="/portal/candidate" element={
          <ProtectedRoute allowedRoles={['candidate']}>
            <CandidatePortal />
          </ProtectedRoute>
        } />
        <Route path="/portal/interviewer" element={
          <ProtectedRoute allowedRoles={['interviewer']}>
            <InterviewerPortal />
          </ProtectedRoute>
        } />
        <Route path="/portal/hr" element={
          <ProtectedRoute allowedRoles={['hr', 'hiring_manager', 'manager']}>
            <HrPipelinePortal />
          </ProtectedRoute>
        } />
        <Route path="/portal/analytics" element={
          <ProtectedRoute allowedRoles={['manager']}>
            <ManagerAnalyticsPortal />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;