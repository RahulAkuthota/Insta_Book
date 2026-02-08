import { NavLink, Outlet } from "react-router-dom";

const OrganizerLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="px-6 py-5 text-xl font-bold text-indigo-600">
          Organizer
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavLink
            to="/organizer/dashboard"
            className={({ isActive }) =>
              `block rounded-lg px-4 py-2 text-sm font-medium ${
                isActive
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/organizer/events"
            className={({ isActive }) =>
              `block rounded-lg px-4 py-2 text-sm font-medium ${
                isActive
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            My Events
          </NavLink>

          <NavLink
            to="/organizer/create-event"
            className={({ isActive }) =>
              `block rounded-lg px-4 py-2 text-sm font-medium ${
                isActive
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            Create Event
          </NavLink>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1">
        {/* MOBILE HEADER */}
        <div className="md:hidden bg-white border-b px-4 py-3 font-semibold">
          Organizer Dashboard
        </div>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default OrganizerLayout;
