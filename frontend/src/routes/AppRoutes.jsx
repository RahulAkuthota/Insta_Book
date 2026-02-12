import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import OrganizerRoute from "./OrganizerRoute";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import EmailVerified from "../pages/auth/EmailVerified";

import Events from "../pages/events/Events.jsx";
import EventDetails from "../pages/EventDetails.jsx";
import MyBookings from "../pages/booking/MyBookings.jsx";
import BookingSuccess from "../pages/booking/BookingSuccess";
import Profile from "../pages/profile/Profile.jsx";

import PendingOrganizers from "../pages/admin/PendingOrganizers";
import AdminEvents from "../pages/admin/AdminEvents";

import OrganizerLayout from "../pages/organizer/OrganizerLayout";
import CreateEvent from "../pages/organizer/CreateEvent";
import OrganizerEvent from "../pages/organizer/OrganizerEvent.jsx";
import OrganizerDashboard from "../pages/organizer/Dashboard.jsx";
import OrganizerAnalytics from "../pages/organizer/Dashboard.jsx";
import EventAnalytics from "../pages/organizer/EventAnalytics.jsx";
import ManageTickets from "../pages/organizer/ManageTickets.jsx";
import ScanTickets from "../pages/organizer/ScanTickets.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx"
import ResetPassword from "../pages/auth/ResetPassword.jsx"

const AppRoutes = () => {
  return (
    <Routes>
      {/* -------- PUBLIC -------- */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/email-verified" element={<EmailVerified />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* -------- EVENTS -------- */}
      <Route path="/events" element={<Events />} />
      <Route path="/events/:eventId" element={<EventDetails />} />

      {/* -------- DEFAULT -------- */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Events />
          </PrivateRoute>
        }
      />

      {/* -------- USER -------- */}
      <Route
        path="/mybookings"
        element={
          <PrivateRoute>
            <MyBookings />
          </PrivateRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
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

      {/* -------- ADMIN -------- */}
      <Route
        path="/admin/organizers"
        element={
          <AdminRoute>
            <PendingOrganizers />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/events"
        element={
          <AdminRoute>
            <AdminEvents />
          </AdminRoute>
        }
      />

      {/* -------- ORGANIZER -------- */}
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
        <Route path="scanner" element={<ScanTickets />} />
        <Route path="analytics" element={<OrganizerAnalytics />} />
        <Route path="events/:eventId/analytics" element={<EventAnalytics />} />
        <Route path="events/:eventId/tickets" element={<ManageTickets />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
