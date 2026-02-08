import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
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
              <Link to="/events" className="hover:text-indigo-400">
                Browse Events
              </Link>
            </li>
            <li>
              <Link to="/mybookings" className="hover:text-indigo-400">
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
              <Link to="/organizer/dashboard" className="hover:text-indigo-400">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/organizer/create-event" className="hover:text-indigo-400">
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
            <li className="hover:text-indigo-400 cursor-pointer">
              Privacy Policy
            </li>
            <li className="hover:text-indigo-400 cursor-pointer">
              Terms & Conditions
            </li>
          </ul>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} InstaBook. All rights reserved.</p>
          <p>Built with ❤️ for seamless bookings</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
