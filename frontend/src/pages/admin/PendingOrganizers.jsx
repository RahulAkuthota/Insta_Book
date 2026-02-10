import { useEffect, useState } from "react";
import {
  getPendingOrganizers,
  approveOrganizer,
  rejectOrganizer,
} from "../../api/admin.api";
import toast from "react-hot-toast";

const PendingOrganizers = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // organizerId

  const fetchOrganizers = async () => {
    try {
      const res = await getPendingOrganizers();
      setOrganizers(res.data.data || []);
    } catch {
      toast.error("Failed to load organizers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      await approveOrganizer(id);
      toast.success("Organizer approved");
      fetchOrganizers();
    } catch {
      toast.error("Approval failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(id);
      await rejectOrganizer(id);
      toast.error("Organizer rejected");
      fetchOrganizers();
    } catch {
      toast.error("Rejection failed");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-500">
        Loading pending organizers...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Pending Organizer Requests
      </h1>

      {organizers.length === 0 ? (
        <p className="text-gray-500">No pending requests</p>
      ) : (
        <div className="space-y-4">
          {organizers.map((o) => (
            <div
              key={o._id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border bg-white p-5"
            >
              {/* LEFT */}
              <div>
                <p className="font-semibold text-gray-900">
                  {o.organizationName}
                </p>
                <p className="text-sm text-gray-600">
                  {o.userId.name} · {o.userId.email}
                </p>
                <p className="text-sm text-gray-600">
                  📞 {o.phone}
                </p>
              </div>

              {/* RIGHT */}
              <div className="flex gap-3">
                <button
                  disabled={actionLoading === o._id}
                  onClick={() => handleApprove(o._id)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold text-white
                    ${
                      actionLoading === o._id
                        ? "bg-green-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }
                  `}
                >
                  {actionLoading === o._id ? "Approving..." : "Approve"}
                </button>

                <button
                  disabled={actionLoading === o._id}
                  onClick={() => handleReject(o._id)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold text-white
                    ${
                      actionLoading === o._id
                        ? "bg-red-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }
                  `}
                >
                  {actionLoading === o._id ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingOrganizers;
