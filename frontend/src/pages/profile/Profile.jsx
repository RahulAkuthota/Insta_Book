import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-600">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your account information.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Name
            </p>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {user.name}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email
            </p>
            <p className="mt-2 break-all text-base font-semibold text-slate-900">
              {user.email}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Role
            </p>
            <p className="mt-2 inline-block rounded-full bg-cyan-100 px-3 py-1 text-sm font-semibold text-cyan-700">
              {user.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
