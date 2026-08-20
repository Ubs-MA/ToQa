import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth";

export default function ProtectedRoute({ admin = false, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="page-state">Checking your session...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (admin && user.role !== "admin") return <Navigate to="/" replace />;

  return children;
}
