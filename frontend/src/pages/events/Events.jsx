import { useEffect, useState } from "react";
import { getEvents } from "../../api/events.api";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getEvents();
        setEvents(res?.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch events", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  /* 🔍 SMART SEARCH */
  const filteredEvents = events.filter((event) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;

    const title = event.title.toLowerCase();
    const location = event.location.toLowerCase();
    const time = event.startTime.toLowerCase();
    const dateStr = new Date(event.date).toDateString().toLowerCase();

    return (
      title.includes(q) ||
      location.includes(q) ||
      time.includes(q) ||
      dateStr.includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ---------- PAGE CONTENT ---------- */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl p-6 space-y-6">
          {/* 🔎 SEARCH BAR */}
          <input
            type="text"
            placeholder="Search events by name, location, date or time…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border px-5 py-3 text-sm focus:ring-2 focus:ring-indigo-500"
          />

          {/* LOADING */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 rounded-lg bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="flex h-[40vh] items-center justify-center text-gray-500">
              No events found
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Link key={event._id} to={`/events/${event._id}`}>
                  <div className="rounded-xl bg-white border p-6 transition hover:border-indigo-300 hover:shadow-md">
                    <p className="text-xs font-medium text-indigo-600 uppercase">
                      {event.category}
                    </p>

                    <h3 className="mt-2 text-lg font-semibold text-gray-900">
                      {event.title}
                    </h3>

                    <div className="mt-3 text-sm text-gray-600">
                      📍 {event.location}
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      📅 {new Date(event.date).toDateString()} · ⏰{" "}
                      {event.startTime}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ---------- FOOTER (FULL WIDTH) ---------- */}
      <Footer />
    </div>
  );
};

export default Events;
