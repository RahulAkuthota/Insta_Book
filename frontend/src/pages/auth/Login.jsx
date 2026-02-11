import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { loginUser, resendVerification } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState(null);
  const [notVerified, setNotVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const fromRegister = location.state?.fromRegister;
  const from = location.state?.from || "/events";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg(null);
    setNotVerified(false);
    setLoading(true);

    try {
      const res = await loginUser({ email, password });
      setUser(res.data.data);

      toast.success("Logged in successfully");
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

          {fromRegister && (
            <div className="mb-4 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
              We’ve sent a verification link to your email.
              Please verify before logging in.
            </div>
          )}

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
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-md border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

             <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full rounded-md border px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

            {/* 🔑 FORGOT PASSWORD */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-indigo-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-gray-900 py-2.5 text-white disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-center">
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
          <p className="text-gray-300 text-sm">
            Book events effortlessly with a clean, secure platform.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
