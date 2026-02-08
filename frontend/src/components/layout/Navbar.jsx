import { useState } from "react";
import { Link, Navigate, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { applyOrganizer } from "../../api/organizer.api";
 import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();

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

const handleLogout = async () => {
  await logout();
  setOpen(false);
  setUserMenu(false);

  toast.error("Logged out successfully");

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
      <header className="bg-white shadow-sm">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/events" className="text-xl font-bold text-indigo-600">
              InstaBook
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
                    className="text-sm font-medium"
                  >
                    Hi, {user.name} ▾
                  </button>

                  {userMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg z-50">
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
            <button
              className="md:hidden text-xl"
              onClick={() => setOpen(!open)}
            >
              ☰
            </button>
          </div>

          {/* Mobile Menu */}
          {open && (
            <div className="md:hidden mt-4 rounded-xl bg-white shadow-md">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
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
