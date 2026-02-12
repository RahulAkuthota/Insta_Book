import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative left-1/2 mt-auto w-screen -translate-x-1/2 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-gray-300">
      {/* TOP SECTION */}
      <div className="mx-auto max-w-7xl px-6 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {/* BRAND */}
        <div>
          <h3 className="text-lg font-bold text-white">InstaBook</h3>
          <p className="mt-2 text-sm text-gray-400">
            Discover and book events seamlessly with a fast and secure platform.
          </p>
        </div>

        {/* EVENTS */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase">
            Events
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/events" className="transition hover:text-indigo-300">
                Browse Events
              </Link>
            </li>
            <li>
              <Link to="/mybookings" className="transition hover:text-indigo-300">
                My Bookings
              </Link>
            </li>
          </ul>
        </div>

        {/* ORGANIZER */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase">
            Organizer
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/organizer/dashboard" className="transition hover:text-indigo-300">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/organizer/create-event" className="transition hover:text-indigo-300">
                Create Event
              </Link>
            </li>
          </ul>
        </div>

        {/* LEGAL */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase">
            Legal
          </h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="cursor-pointer transition hover:text-indigo-300">
              Privacy Policy
            </li>
            <li className="cursor-pointer transition hover:text-indigo-300">
              Terms & Conditions
            </li>
          </ul>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-slate-800/80 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} InstaBook. All rights reserved.</p>
          <p>Built with ❤️ for seamless bookings</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
