import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingState from './LoadingState';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <LoadingState title="Verifying access" message="Checking your account and role permissions..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;