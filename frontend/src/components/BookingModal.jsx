import { useState } from "react";

const BookingModal = ({ ticket, onClose, onConfirm }) => {
  const [qty, setQty] = useState(1);

  const maxQty = ticket.availableSeats;
  const totalPrice =
    ticket.type === "FREE" ? 0 : qty * ticket.price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Confirm Booking
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {/* TICKET INFO */}
        <div className="space-y-2">
          <p className="font-medium">{ticket.type} Ticket</p>
          <p className="text-sm text-gray-600">
            Price:{" "}
            {ticket.type === "FREE" ? "Free" : `₹${ticket.price}`}
          </p>
        </div>

        {/* QUANTITY */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            min={1}
            max={maxQty}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-full rounded-lg border px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            {maxQty} seats available
          </p>
        </div>

        {/* PRICE */}
        <div className="mt-4 flex justify-between font-semibold">
          <span>Total</span>
          <span>{ticket.type === "FREE" ? "Free" : `₹${totalPrice}`}</span>
        </div>

        {/* ACTIONS */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(qty)}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
