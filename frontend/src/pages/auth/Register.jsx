import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../api/auth.api";
import { toast } from "react-hot-toast";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg(null);
    setLoading(true);

    try {
      await registerUser({ name, email, password });

      toast.success("Verification link sent to your email 📧", {
        style: {
          color: "#065f46",
          background: "#ecfdf5",
          border: "1px solid #a7f3d0",
        },
      });

      // ✅ go to login (NOT events)
      navigate("/login");
    } catch (err) {
      setErrMsg(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:grid md:grid-cols-2">
      {/* LEFT — FORM */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Create account
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Join InstaBook and start booking events.
          </p>

          {errMsg && (
            <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {errMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-gray-900 py-2.5 text-white font-medium hover:bg-gray-800 disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT — BRAND */}
      <div className="hidden md:flex items-center justify-center bg-gray-900 text-white">
        <div className="max-w-md px-8">
          <h2 className="text-3xl font-semibold mb-4">
            Welcome to InstaBook
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Discover events, book tickets, and enjoy seamless experiences.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
