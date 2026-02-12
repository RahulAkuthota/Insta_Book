import { useEffect, useState } from "react";
import { getEvents } from "../../api/events.api";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";
import toast from "react-hot-toast";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getEvents();
        setEvents(res?.data?.data || []);
      } catch {
        toast.error("Failed to load events");
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
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* ---------- PAGE CONTENT ---------- */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl space-y-6 p-6">
          <div className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-700 via-blue-600 to-cyan-600 p-6 text-white shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-100">
              Discover
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              Find Your Next Event
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100 sm:text-base">
              Browse workshops, concerts, meetups, and more. Search by title,
              location, date, or time.
            </p>
          </div>

          {/* 🔎 SEARCH BAR */}
          <input
            type="text"
            placeholder="Search events by name, location, date or time…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
          />

          {/* LOADING */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="flex h-[40vh] items-center justify-center">
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-10 text-center">
                <p className="text-lg font-semibold text-slate-800">
                  No events found
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Try a different keyword for title, place, date, or time.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Link key={event._id} to={`/events/${event._id}`}>
                  <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg">
                    <p className="inline-block rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 uppercase">
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

                    <p className="mt-4 text-sm font-semibold text-cyan-700 transition group-hover:text-indigo-700">
                      View details →
                    </p>
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
