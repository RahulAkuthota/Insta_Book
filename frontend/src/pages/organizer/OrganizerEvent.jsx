import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  getOrganizerEvents,
  togglePublishEvent,
} from "../../api/events.api";

/* -------- Utils -------- */
const formatTime = (time) => {
  if (!time) return "--";
  const [h, m] = time.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${suffix}`;
};

/* -------- Component -------- */
const OrganizerEvent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // eventId

  const fetchEvents = async () => {
    try {
      const res = await getOrganizerEvents();
      setEvents(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handlePublishToggle = async (id) => {
    try {
      setActionLoading(id);
      const res = await togglePublishEvent(id);
      toast.success(res.data.message);
      fetchEvents();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Action failed"
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* -------- Loading -------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-500">
        Loading your events...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          My Events
        </h1>

        <NavLink
          to="/organizer/create-event"
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Create Event
        </NavLink>
      </div>

      {/* -------- Empty State -------- */}
      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white p-10 text-center text-gray-500">
          You haven’t created any events yet.
        </div>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="rounded-2xl bg-white border p-6 shadow-sm flex flex-col md:flex-row md:justify-between gap-6"
            >
              {/* LEFT */}
              <div className="space-y-2">
                <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-600">
                  {event.category}
                </span>

                <h2 className="text-xl font-semibold text-gray-900">
                  {event.title}
                </h2>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {event.description}
                </p>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>📍 {event.location}</p>
                  <p>
                    📅{" "}
                    {new Date(event.date).toDateString()}
                  </p>
                  <p>⏰ {formatTime(event.startTime)}</p>
                </div>

                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    event.isPublished
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {event.isPublished
                    ? "Published"
                    : "Draft"}
                </span>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col gap-3 justify-center min-w-[180px]">
                <button
                  disabled={actionLoading === event._id}
                  onClick={() =>
                    handlePublishToggle(event._id)
                  }
                  className={`rounded-lg px-5 py-2 text-sm font-semibold text-white transition ${
                    event.isPublished
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } ${
                    actionLoading === event._id
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {actionLoading === event._id
                    ? "Processing..."
                    : event.isPublished
                    ? "Unpublish"
                    : "Publish"}
                </button>

                <NavLink
                  to={`/organizer/events/${event._id}/analytics`}
                  className="rounded-lg px-5 py-2 text-sm font-medium border text-center hover:bg-gray-50"
                >
                  View Analytics
                </NavLink>

                <NavLink
                  to={`/organizer/events/${event._id}/tickets`}
                  className="rounded-lg px-5 py-2 text-sm font-medium border text-center hover:bg-gray-50"
                >
                  Manage Tickets
                </NavLink>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizerEvent;
