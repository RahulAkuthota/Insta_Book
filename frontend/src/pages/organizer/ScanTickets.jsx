import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  getOrganizerBookings,
  markOrganizerBookingUsed,
  scanOrganizerBooking,
} from "../../api/booking.api";

const ScanTickets = () => {
  const scannerRef = useRef(null);
  const isUnmountedRef = useRef(false);
  const scanningRef = useRef(false);

  const [scannerActive, setScannerActive] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [markingUsed, setMarkingUsed] = useState(false);
  const [scannerMessage, setScannerMessage] = useState(
    "Camera preview appears here"
  );
  const [manualQr, setManualQr] = useState("");
  const [currentBooking, setCurrentBooking] = useState(null);
  const [usedBookings, setUsedBookings] = useState([]);
  const [usedLoading, setUsedLoading] = useState(true);

  const stopScanner = async () => {
    if (!scannerRef.current) {
      scanningRef.current = false;
      setScannerActive(false);
      return;
    }

    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
      await scannerRef.current.clear();
    } catch {}
    finally {
      scannerRef.current = null;
      scanningRef.current = false;
      if (!isUnmountedRef.current) {
        setScannerActive(false);
        setScannerMessage("Camera preview appears here");
      }
    }
  };

  const loadUsedBookings = async () => {
    try {
      setUsedLoading(true);
      const res = await getOrganizerBookings({ checkInStatus: "USED" });
      setUsedBookings(res?.data?.data || []);
    } catch {
      toast.error("Failed to load used tickets");
    } finally {
      setUsedLoading(false);
    }
  };

  useEffect(() => {
    loadUsedBookings();
    return () => {
      isUnmountedRef.current = true;
      stopScanner();
    };
  }, []);

  const lookupBooking = async (qrData) => {
    if (!qrData) return;
    try {
      setLookupLoading(true);
      const res = await scanOrganizerBooking(qrData);
      setCurrentBooking(res?.data?.data || null);
    } catch (err) {
      setCurrentBooking(null);
      toast.error(err.response?.data?.message || "Invalid QR ticket");
    } finally {
      setLookupLoading(false);
    }
  };

  const startScanner = async () => {
    if (scannerActive || scanningRef.current) return;
    try {
      scanningRef.current = true;
      setScannerMessage("Starting camera...");
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("organizer-qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.floor(minEdge * 0.75);
            return { width: size, height: size };
          },
        },
        async (decodedText) => {
          if (!decodedText) return;
          await stopScanner();
          setManualQr(decodedText);
          await lookupBooking(decodedText);
        },
        () => {}
      );

      setScannerActive(true);
      setScannerMessage("Scanning...");
    } catch (err) {
      scanningRef.current = false;
      setScannerActive(false);
      scannerRef.current = null;
      const denied = err?.name === "NotAllowedError";
      if (denied) {
        setScannerMessage("Camera permission denied");
        toast.error("Camera permission denied");
        return;
      }
      setScannerMessage("Unable to access camera");
      toast.error("Unable to access camera for scanning");
    }
  };

  const handleMarkUsed = async () => {
    if (!currentBooking?._id || currentBooking.checkInStatus === "USED") return;
    try {
      setMarkingUsed(true);
      const res = await markOrganizerBookingUsed(currentBooking._id);
      const updated = res?.data?.data;
      setCurrentBooking(updated);
      setUsedBookings((prev) => [updated, ...prev.filter((b) => b._id !== updated._id)]);
      toast.success("Ticket marked as used");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark ticket as used");
    } finally {
      setMarkingUsed(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Scan Tickets</h1>
        <p className="mt-1 text-sm text-slate-600">
          Scan attendee QR and mark verified bookings as used.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div
            id="organizer-qr-reader"
            className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
          />
          <p className="mt-2 text-xs text-slate-500">{scannerMessage}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {!scannerActive ? (
              <button
                onClick={startScanner}
                className="rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 py-2 text-sm font-semibold text-white hover:from-indigo-700 hover:to-cyan-700"
              >
                Start Camera Scan
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Stop Scan
              </button>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium text-slate-700">Manual QR Input</label>
            <textarea
              rows={3}
              value={manualQr}
              onChange={(e) => setManualQr(e.target.value)}
              placeholder="Paste QR content here"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-300"
            />
            <button
              onClick={() => lookupBooking(manualQr)}
              disabled={lookupLoading || !manualQr.trim()}
              className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {lookupLoading ? "Fetching..." : "Fetch Booking"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Scanned Booking</h2>
          {!currentBooking ? (
            <p className="mt-3 text-sm text-slate-500">No ticket scanned yet.</p>
          ) : (
            <div className="mt-4 space-y-3 text-sm">
              <p><span className="font-semibold">Event:</span> {currentBooking.eventId?.title}</p>
              <p><span className="font-semibold">Attendee:</span> {currentBooking.userId?.name}</p>
              <p><span className="font-semibold">Email:</span> {currentBooking.userId?.email}</p>
              <p><span className="font-semibold">Ticket Type:</span> {currentBooking.ticketId?.type}</p>
              <p><span className="font-semibold">Quantity:</span> {currentBooking.quantity}</p>
              <p>
                <span className="font-semibold">Booking Status:</span>{" "}
                {currentBooking.bookingStatus}
              </p>
              <p>
                <span className="font-semibold">Check-in:</span>{" "}
                <span
                  className={
                    currentBooking.checkInStatus === "USED"
                      ? "font-semibold text-green-700"
                      : "font-semibold text-amber-700"
                  }
                >
                  {currentBooking.checkInStatus}
                </span>
              </p>

              <button
                onClick={handleMarkUsed}
                disabled={
                  markingUsed ||
                  currentBooking.bookingStatus !== "CONFIRMED" ||
                  currentBooking.checkInStatus === "USED"
                }
                className="mt-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {markingUsed ? "Marking..." : "Mark as used"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Used Tickets</h2>
        {usedLoading ? (
          <p className="mt-3 text-sm text-slate-500">Loading used tickets...</p>
        ) : usedBookings.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No used tickets yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {usedBookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm"
              >
                <p className="font-semibold text-slate-900">{booking.eventId?.title}</p>
                <p className="text-slate-600">
                  {booking.userId?.name} · {booking.userId?.email}
                </p>
                <p className="text-slate-600">
                  {booking.ticketId?.type} · Qty {booking.quantity}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanTickets;
