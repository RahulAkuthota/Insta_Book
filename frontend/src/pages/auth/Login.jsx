import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { loginUser, resendVerification } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState(null);
  const [notVerified, setNotVerified] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const from = location.state?.from || "/events";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg(null);
    setNotVerified(false);
    setLoading(true);

    try {
      const res = await loginUser({ email, password });
      setUser(res.data.data);

      toast.success("Logged in successfully", {
        style: {
          color: "#065f46",
          background: "#ecfdf5",
          border: "1px solid #a7f3d0",
        },
      });

      navigate(from, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message;

      if (message === "EMAIL_NOT_VERIFIED") {
        setErrMsg("Your email is not verified");
        setNotVerified(true);
        return;
      }

      setErrMsg(message || "Login failed");
      toast.error(message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification({ email });
      toast.success("Verification link sent to your email 📧");
    } catch {
      toast.error("Failed to send verification email");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:grid md:grid-cols-2">
      {/* LEFT */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Sign in
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Welcome back. Please login to continue.
          </p>

          {errMsg && (
            <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {errMsg}
            </div>
          )}

          {notVerified && (
            <div className="mb-4 text-center">
              <button
                onClick={handleResend}
                className="text-sm font-medium text-indigo-600 hover:underline"
              >
                Verify email?
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full rounded-md bg-gray-900 py-2.5 text-white font-medium hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-600 text-center">
            Don’t have an account?{" "}
            <Link to="/register" className="text-indigo-600 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="hidden md:flex items-center justify-center bg-gray-900 text-white">
        <div className="max-w-md px-8">
          <h2 className="text-3xl font-semibold mb-4">
            Welcome to InstaBook
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Book events effortlessly with a clean, secure platform.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
