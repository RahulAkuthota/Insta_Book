import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Events from "../pages/events/Events.jsx";
import EventDetails from "../pages/EventDetails.jsx";
import MyBookings from "../pages/booking/ MyBookings.jsx";
import AdminRoute from "./AdminRoute";
import PendingOrganizers from "../pages/admin/PendingOrganizers";
import OrganizerRoute from "./OrganizerRoute";
import OrganizerLayout from "../pages/organizer/OrganizerLayout";
import CreateEvent from "../pages/organizer/CreateEvent";
import OrganizerEvent from "../pages/organizer/OrganizerEvent.jsx";
import OrganizerDashboard from "../pages/organizer/Dashboard.jsx";
import OrganizerAnalytics from "../pages/organizer/Dashboard.jsx";
import EventAnalytics from "../pages/organizer/EventAnalytics.jsx";
import ManageTickets from "../pages/organizer/ManageTickets.jsx";
import BookingSuccess from "../pages/booking/BookingSuccess";

const AppRoutes = () => {
  return (
    <Routes>
      {/* public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* protected */}
      <Route
        path="/events"
        element={
          // <PrivateRoute>
          <Events />
          // </PrivateRoute>
        }
      />

      <Route
        path="/events/:eventId"
        element={
          // <PrivateRoute>
          <EventDetails />
          // </PrivateRoute>
        }
      />

      {/* default */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Events />
          </PrivateRoute>
        }
      />

      <Route
        path="/mybookings"
        element={
          <PrivateRoute>
            <MyBookings />
          </PrivateRoute>
        }
      />
      <Route
        path="/booking-success"
        element={
          <PrivateRoute>
            <BookingSuccess />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/organizers"
        element={
          <AdminRoute>
            <PendingOrganizers />
          </AdminRoute>
        }
      />

      <Route
        path="/organizer"
        element={
          <OrganizerRoute>
            <OrganizerLayout />
          </OrganizerRoute>
        }
      >
        <Route path="events" element={<OrganizerEvent />} />
        <Route path="dashboard" element={<OrganizerDashboard />} />
        <Route path="create-event" element={<CreateEvent />} />
        <Route path="analytics" element={<OrganizerAnalytics />} />
        <Route path="events/:eventId/analytics" element={<EventAnalytics />} />
        <Route path="events/:eventId/tickets" element={<ManageTickets />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
