import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  createTicket,
  deleteTicket,
  getEventTickets
} from "../../api/ticket.api.js";


const ALL_TICKET_TYPES = ["FREE", "GENERAL", "PLATINUM"];

const ticketLabel = {
  FREE: "Free",
  GENERAL: "General",
  PLATINUM: "Platinum",
};

const ManageTickets = () => {
  const { eventId } = useParams();

  const [tickets, setTickets] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [type, setType] = useState("");
  const [price, setPrice] = useState(""); // ✅ string
  const [totalSeats, setTotalSeats] = useState("");
  const [creating, setCreating] = useState(false);

  const resetCreateForm = () => {
    setType("");
    setPrice("");
    setTotalSeats("");
  };

  const fetchTickets = async () => {
    try {
       
      const res = await getEventTickets(eventId);
 
      // Case 1: API returns { tickets, event }
      if (res.data.data?.tickets) {
        setTickets(res.data.data.tickets);
        setEvent(res.data.data.event);
      }
      // Case 2: API returns only tickets array
      else if (Array.isArray(res.data.data)) {
        setTickets(res.data.data);
        // ✅ DO NOT reset event here
      } else {
        setTickets([]);
      }
    } catch (err) {
      // ❌ No error toast for "no tickets"
      if (err.response?.status !== 404) {
        toast.error("Failed to load tickets");
      }
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchTickets();
  }, [eventId]);

  /* -------- CREATE -------- */
  const existingTypes = Array.isArray(tickets)
    ? tickets.map((t) => t.type)
    : [];

  const availableTypes = ALL_TICKET_TYPES.filter(
    (t) => !existingTypes.includes(t)
  );

  const handleCreate = async () => {
    if (!type) return toast.error("Select ticket type");
    if (Number(totalSeats) <= 0)
      return toast.error("Seats must be greater than 0");
    if (type !== "FREE" && Number(price) <= 0)
      return toast.error("Price must be greater than 0");

    try {
      setCreating(true);

      await createTicket(eventId, {
        type,
        price: type === "FREE" ? 0 : Number(price),
        totalSeats: Number(totalSeats),
      });

      toast.success("Ticket created 🎉");
      setShowCreate(false);
      resetCreateForm();
      fetchTickets();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Create failed"
      );
    } finally {
      setCreating(false);
    }
  };

  /* -------- DELETE -------- */
  const handleDelete = async (ticketId) => {
    if (!confirm("Delete this ticket?")) return;
    try {
      await deleteTicket(ticketId);
      toast.success("Ticket deleted");
      fetchTickets();
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        Loading tickets...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Manage Tickets</h1>

        <div className="flex gap-3">

          {!event?.isPublished && availableTypes.length > 0 && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <span className="text-lg">+</span>
              Create Ticket
            </button>
          )}
        </div>
      </div>

      {/* TICKET LIST */}
      {tickets.length === 0 ? (
        <div className="text-center text-gray-500">
          No tickets created yet
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const booked =
              ticket.totalSeats - ticket.availableSeats;

            return (
              <div
                key={ticket._id}
                className="rounded-xl bg-white border p-5 flex justify-between items-center"
              >
                <div className="space-y-1">
                  <h3 className="font-semibold">
                    {ticketLabel[ticket.type]} Ticket
                  </h3>

                  <p className="text-sm text-gray-600">
                    Price: ₹{ticket.price}
                  </p>

                  <p className="text-sm text-gray-600">
                    🎟 Booked:{" "}
                    <span className="font-medium">
                      {booked}
                    </span>{" "}
                    · Remaining:{" "}
                    <span className="font-medium">
                      {ticket.availableSeats}
                    </span>
                  </p>
                </div>

                {!event?.isPublished &&
                  ticket.availableSeats ===
                    ticket.totalSeats && (
                    <button
                      onClick={() =>
                        handleDelete(ticket._id)
                      }
                      className="rounded-lg px-4 py-2 text-sm text-red-600 border hover:bg-red-50"
                    >
                      Delete
                    </button>
                  )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-semibold">
              Create Ticket
            </h3>

            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value)
              }
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="">
                Select Ticket Type
              </option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>
                  {ticketLabel[t]}
                </option>
              ))}
            </select>

            <input
              type="number"
              disabled={type === "FREE"}
              value={type === "FREE" ? "" : price}
              min={0}
              onChange={(e) =>
                setPrice(e.target.value)
              }
              placeholder="Price"
              className={`w-full rounded-lg border px-3 py-2 ${
                type === "FREE"
                  ? "bg-gray-100 cursor-not-allowed"
                  : ""
              }`}
            />

            <input
              type="number"
              value={totalSeats}
              onChange={(e) =>
                setTotalSeats(e.target.value)
              }
              placeholder="Total Seats"
              className="w-full rounded-lg border px-3 py-2"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreate(false);
                  resetCreateForm();
                }}
                className="px-4 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                disabled={creating}
                className={`px-5 py-2 text-sm font-semibold text-white rounded-lg ${
                  creating
                    ? "bg-indigo-400"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTickets;
