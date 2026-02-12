import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { applyOrganizer } from "../../api/organizer.api";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  // Apply Organizer Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [organizationName, setOrganizationName] = useState("");
  const [phone, setPhone] = useState("");
  const [orgError, setOrgError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const navbarRef = useRef(null);

  const resetApplyState = () => {
    setOrganizationName("");
    setPhone("");
    setOrgError("");
    setPhoneError("");
    setSubmitResult(null);
    setSubmitMessage("");
    setLoading(false);
  };


  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
    setUserMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!navbarRef.current) return;
      if (!navbarRef.current.contains(event.target)) {
        setOpen(false);
        setUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    setUserMenu(false);

    toast.success("Logged out successfully", {
      duration: 2000,
    });

    navigate("/events", { replace: true });
  };

  // Validation
  const handleOrgChange = (e) => {
    const value = e.target.value.trimStart();
    setOrganizationName(value);
    setOrgError(value.trim().length < 3 ? "Min 3 characters required" : "");
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhone(value);
    setPhoneError(/^[6-9]\d{9}$/.test(value) ? "" : "Invalid mobile number");
  };

  const handleApplyOrganizer = async () => {
    try {
      setLoading(true);
      setSubmitResult(null);

      await applyOrganizer({
        organizationName: organizationName.trim(),
        phone,
      });

      setSubmitResult("success");
      setSubmitMessage(
        "Application submitted. You’ll be notified after admin approval."
      );
    } catch (err) {
      setSubmitResult("error");
      setSubmitMessage(
        err.response?.data?.message || "Application failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled =
    loading ||
    !!orgError ||
    !!phoneError ||
    !organizationName.trim() ||
    phone.length !== 10;

  return (
    <>
      <header
        ref={navbarRef}
        className="sticky top-0 z-40 border-b border-cyan-100 bg-white/90 shadow-sm backdrop-blur"
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-xl font-bold text-indigo-700"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-sm text-white shadow-sm">
                IB
              </span>
              InstantBook
            </Link>

            {/* Desktop */}
            <div className="hidden md:flex items-center gap-6 relative">
              <NavLink to="/events" className="nav-link">
                Events
              </NavLink>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenu(!userMenu)}
                    className="rounded-lg px-2 py-1 text-sm font-medium text-slate-700 transition hover:bg-indigo-50"
                  >
                    Hi, {user.name} ▾
                  </button>

                  {userMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg z-50">
                      <NavLink
                        to="/profile"
                        onClick={() => setUserMenu(false)}
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        Profile
                      </NavLink>
                      <NavLink
                        to="/mybookings"
                        onClick={() => setUserMenu(false)}
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        My Bookings
                      </NavLink>

                      {/* ORGANIZER OPTIONS */}
                      {user.role === "ORGANIZER" && (
                        <>
                          <NavLink
                            to="/organizer/events"
                            onClick={() => setUserMenu(false)}
                            className="block px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            My Events
                          </NavLink>

                          <NavLink
                            to="/organizer/create-event"
                            onClick={() => setUserMenu(false)}
                            className="block px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Create Event
                          </NavLink>

                          <NavLink
                            to="/organizer/scanner"
                            onClick={() => setUserMenu(false)}
                            className="block px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Scan Tickets
                          </NavLink>
                        </>
                      )}

                      {/* ADMIN OPTIONS */}
                        {user.role === "ADMIN" && (
                        <>
                          <NavLink
                            to="/admin/organizers"
                            onClick={() => setUserMenu(false)}
                            className="block px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Pending Requests
                          </NavLink>
                          <NavLink
                            to="/admin/events"
                            onClick={() => setUserMenu(false)}
                            className="block px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Events Dashboard
                          </NavLink>
                          </>
                      )}

                      {/* APPLY ORGANIZER */}
                      {user.role === "USER" && (
                        <button
                          onClick={() => {
                            setShowApplyModal(true);
                            setUserMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Apply to Become Organizer
                        </button>
                      )}



                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <NavLink to="/login" className="nav-link">
                    Login
                  </NavLink>
                  <NavLink to="/register" className="nav-link">
                    Register
                  </NavLink>
                </>
              )}
            </div>

            {/* Mobile button */}
            <div className="md:hidden flex items-center gap-2">
              {user?.name && (
                <span className="max-w-[120px] truncate rounded-full bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-700">
                  Hi, {user.name}
                </span>
              )}
              <button
                className="rounded-lg border border-slate-200 px-3 py-1 text-xl text-slate-700 transition hover:bg-slate-100"
                onClick={() => setOpen(!open)}
                aria-label="Toggle navigation menu"
              >
                ☰
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {open && (
            <div className="md:hidden mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
              {user && (
                <div className="border-b border-slate-200 bg-cyan-50/70 px-5 py-3">
                  <p className="text-sm font-semibold text-slate-800">
                    Hi, {user.name}
                  </p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              )}
              <NavLink
                to="/events"
                onClick={() => setOpen(false)}
                className="block px-5 py-3 text-sm font-medium hover:bg-gray-50"
              >
                Events
              </NavLink>

              {user ? (
                <>
                  <NavLink
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="block px-5 py-3 text-sm font-medium hover:bg-gray-50"
                  >
                    Profile
                  </NavLink>
                  <NavLink
                    to="/mybookings"
                    onClick={() => setOpen(false)}
                    className="block px-5 py-3 text-sm font-medium hover:bg-gray-50"
                  >
                    My Bookings
                  </NavLink>

                  {user.role === "ORGANIZER" && (
                    <>
                      <NavLink
                        to="/organizer/events"
                        onClick={() => setOpen(false)}
                        className="block px-5 py-3 text-sm font-medium hover:bg-gray-50"
                      >
                        My Events
                      </NavLink>

                      <NavLink
                        to="/organizer/create-event"
                        onClick={() => setOpen(false)}
                        className="block px-5 py-3 text-sm font-medium hover:bg-gray-50"
                      >
                        Create Event
                      </NavLink>

                      <NavLink
                        to="/organizer/scanner"
                        onClick={() => setOpen(false)}
                        className="block px-5 py-3 text-sm font-medium hover:bg-gray-50"
                      >
                        Scan Tickets
                      </NavLink>
                    </>
                  )}

                  {user.role === "ADMIN" && (
                    <>
                      <NavLink
                        to="/admin/organizers"
                        onClick={() => setOpen(false)}
                        className="block px-5 py-3 text-sm font-medium hover:bg-gray-50"
                      >
                        Pending Requests
                      </NavLink>
                      <NavLink
                        to="/admin/events"
                        onClick={() => setOpen(false)}
                        className="block px-5 py-3 text-sm font-medium hover:bg-gray-50"
                      >
                        Events Dashboard
                      </NavLink>
                    </>
                  )}

                  {user.role === "USER" && (
                    <button
                      onClick={() => {
                        setShowApplyModal(true);
                        setOpen(false);
                      }}
                      className="block w-full text-left px-5 py-3 text-sm font-medium hover:bg-gray-50"
                    >
                      Apply to Become Organizer
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="block px-5 py-3 text-sm font-medium hover:bg-gray-50"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="block px-5 py-3 text-sm font-medium hover:bg-gray-50"
                  >
                    Register
                  </NavLink>
                </>
              )}
            </div>
          )}
        </nav>
      </header>

      {/* APPLY ORGANIZER MODAL */}
      {showApplyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => {
            setShowApplyModal(false);
            resetApplyState();
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold">Apply to Become Organizer</h3>
            <p className="mt-1 text-sm text-gray-600">
              Admin approval is required.
            </p>

            <div className="mt-5 space-y-4">
              <input
                type="text"
                placeholder="Organization Name"
                value={organizationName}
                onChange={handleOrgChange}
                className="w-full rounded-lg border px-3 py-2"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                maxLength={10}
                onChange={handlePhoneChange}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>
            {orgError && <p className="mt-2 text-sm text-red-600">{orgError}</p>}
            {phoneError && (
              <p className="mt-2 text-sm text-red-600">{phoneError}</p>
            )}

            {submitResult && (
              <p
                className={`mt-3 text-sm ${
                  submitResult === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {submitMessage}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowApplyModal(false);
                  resetApplyState();
                }}
                className="px-4 py-2 text-sm text-gray-600"
              >
                Close
              </button>

              {!submitResult && (
                <button
                  disabled={isSubmitDisabled}
                  onClick={handleApplyOrganizer}
                  className={`rounded-lg px-5 py-2 text-sm font-semibold text-white ${
                    isSubmitDisabled
                      ? "bg-indigo-400"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
