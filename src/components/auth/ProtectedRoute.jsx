import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (
  allowedRoles &&
  !allowedRoles.some(
    (role) => role.toLowerCase() === user.role?.toLowerCase()
  )
) {
  return <Navigate to="/" replace />;
}

  return <Outlet />;
}

export default ProtectedRoute;