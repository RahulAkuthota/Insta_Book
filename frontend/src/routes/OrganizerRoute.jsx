import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OrganizerRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || user.role !== "ORGANIZER") {
    return <Navigate to="/events" replace />;
  }

  return children;
};

export default OrganizerRoute;
