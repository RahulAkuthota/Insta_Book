import { useState } from "react";
import { forgotPassword } from "../../api/auth.api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate=useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    try {
      setLoading(true);

      await forgotPassword({ email });

      toast.success("If email exists, reset link sent 📧", {
        duration: 3000,
      });
      navigate("/login", {
      replace: true,
      });
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      // small delay feels smoother with toast
      setTimeout(() => setLoading(false), 300);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative">
      {/* 🔒 UI BLOCKER */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="relative bg-white p-6 rounded-lg shadow w-80"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">
          Forgot Password
        </h2>

        <input
          type="email"
          required
          placeholder="Enter email"
          className="w-full rounded-md border px-3 py-2 mb-4 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-md bg-indigo-600 py-2 text-white font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Sending…
            </>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
