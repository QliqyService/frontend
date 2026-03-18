import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../lib/auth";


export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return <div className="page-shell">Loading session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
