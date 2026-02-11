import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../api/auth.api";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);


  const navigate = useNavigate();

  // ✅ validations
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg(null);

    // ❌ block invalid submit
    if (!isEmailValid) {
      setErrMsg("Please enter a valid email id");
      return;
    }

    if (!isPasswordValid) {
      setErrMsg("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await registerUser({ name, email, password });

      toast.success("Verification link sent to your email 📧", {
        duration: 4000,
      });

      navigate("/login", {
        state: { fromRegister: true, email },
      });
    } catch (err) {
      setErrMsg(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:grid md:grid-cols-2">
      {/* LEFT */}
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
            {/* NAME */}
            <input
              type="text"
              placeholder="Name"
              className="w-full rounded-md border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            {/* EMAIL */}
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-md border px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {!isEmailValid && email && (
                <p className="mt-1 text-xs text-red-600">
                  Please enter a valid email id
                </p>
              )}
            </div>

            {/* PASSWORD */}
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


            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-gray-900 py-2.5 text-white disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="mt-6 text-sm text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-medium">
              Sign in
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
            Discover events, book tickets, and enjoy seamless experiences.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
