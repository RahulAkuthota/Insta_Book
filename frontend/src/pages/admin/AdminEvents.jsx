import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { getAdminEvents } from "../../api/admin.api";

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [eventFilter, setEventFilter] = useState("active");
  const [loading, setLoading] = useState(true);

  const fetchEvents = async (filter = eventFilter) => {
    try {
      setLoading(true);
      const res = await getAdminEvents(filter);
      setEvents(res?.data?.data || []);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents("active");
  }, []);

  const renderEventStatusClass = (event) => {
    if (event.isExpired) return "bg-red-100 text-red-700";
    if (!event.isPublished) return "bg-amber-100 text-amber-700";
    return "bg-emerald-100 text-emerald-700";
  };

  const getEventStatusText = (event) => {
    if (event.isExpired) return "Expired";
    if (!event.isPublished) return "Unpublished";
    return "Active";
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Admin Event Dashboard</h1>
        <NavLink
          to="/admin/organizers"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Pending Organizer Requests
        </NavLink>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-slate-700">Filter:</label>
        <select
          value={eventFilter}
          onChange={(e) => {
            const value = e.target.value;
            setEventFilter(value);
            fetchEvents(value);
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="active">Active Events</option>
          <option value="expired">Expired Events</option>
          <option value="unpublished">Unpublished Events</option>
          <option value="published">Published Events</option>
          <option value="all">All Events</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-xl border bg-white p-5 text-sm text-gray-500">
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border bg-white p-5 text-sm text-gray-500">
          No events found for selected filter.
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event._id} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-600">
                    {event.category} · {event.location}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(event.date).toDateString()} · {event.startTime}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${renderEventStatusClass(
                    event
                  )}`}
                >
                  {getEventStatusText(event)}
                </span>
              </div>

              <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                <p className="font-semibold">Organizer Details</p>
                <p>
                  {event.organizerId?.userId?.name || "N/A"} ·{" "}
                  {event.organizerId?.userId?.email || "N/A"}
                </p>
                <p>
                  Org: {event.organizerId?.organizationName || "N/A"} · Phone:{" "}
                  {event.organizerId?.phone || "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
