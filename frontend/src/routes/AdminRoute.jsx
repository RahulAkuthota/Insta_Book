import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // or loader

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/events" replace />;
  }

  return children;
};

export default AdminRoute;
