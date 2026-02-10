import { useSearchParams, useNavigate } from "react-router-dom";
import { useState , useEffect} from "react";
import { resetPassword } from "../../api/auth.api";
import { toast } from "react-hot-toast";

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await resetPassword(token, { password });
    toast.success("Password reset successful"); 
    navigate("/login", {
    replace: true, // this removes reset page from history
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
        <input
          type="password"
          required
          placeholder="New password"
          className="w-full border px-3 py-2 mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-indigo-600 text-white py-2 rounded">
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
