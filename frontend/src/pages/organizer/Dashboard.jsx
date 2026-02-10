import { useEffect, useState } from "react";
import { getOrganizerAnalytics } from "../../api/organizer.api";
import { toast } from "react-hot-toast";

const StatCard = ({ title, value, color }) => (
  <div className="rounded-2xl bg-white p-6 shadow-sm">
    <p className="text-sm text-gray-500">{title}</p>
    <p className={`mt-2 text-3xl font-bold ${color}`}>
      {value}
    </p>
  </div>
);

const OrganizerAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getOrganizerAnalytics();
        setStats(res.data.data);
      } catch (err) {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Analytics Overview
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Events"
          value={stats.totalEvents}
          color="text-indigo-600"
        />

        <StatCard
          title="Upcoming Events"
          value={stats.upcomingEvents}
          color="text-blue-600"
        />

        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          color="text-green-600"
        />

        <StatCard
          title="Tickets Booked"
          value={stats.totalTicketsBooked}
          color="text-purple-600"
        />
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-gray-600">
          📊 These stats update in real‑time as users book tickets.
        </p>
      </div>
    </div>
  );
};

export default OrganizerAnalytics;
