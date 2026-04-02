import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "./ui";

export default function ProtectedRoute({ role }) {
  const { isAuthenticated, loading, user } = useAuth();

  // ⏳ Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <Spinner size={32} />
          <p className="text-ink-muted text-sm font-medium">
            Loading session…
          </p>
        </div>
      </div>
    );
  }

  // ❌ Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

 // ✅ Admin check
if (role === "ADMIN" && !user?.systemUser) {
  return <Navigate to="/dashboard" replace />;
}

  // ✅ Allowed
  return <Outlet />;
}