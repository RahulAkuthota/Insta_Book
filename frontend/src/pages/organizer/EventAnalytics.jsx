import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEventAnalytics } from "../../api/organizer.api";
import { toast } from "react-hot-toast";

const StatCard = ({ title, value, color }) => (
  <div className="rounded-2xl bg-white p-6 shadow-sm">
    <p className="text-sm text-gray-500">{title}</p>
    <p className={`mt-2 text-3xl font-bold ${color}`}>
      {value}
    </p>
  </div>
);

const EventAnalytics = () => {
  const { eventId } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getEventAnalytics(eventId);
        setStats(res.data.data);
      } catch (err) {
        toast.error("Failed to load event analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [eventId]);

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
        {stats.eventTitle} – Analytics
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          color="text-indigo-600"
        />

        <StatCard
          title="Tickets Booked"
          value={stats.ticketsBooked}
          color="text-green-600"
        />

        <StatCard
          title="Status"
          value={stats.isPublished ? "Published" : "Draft"}
          color={
            stats.isPublished
              ? "text-green-600"
              : "text-yellow-600"
          }
        />
      </div>
    </div>
  );
};

export default EventAnalytics;
