import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EmailVerified = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <span className="text-3xl">✅</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Email Verified
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Your email has been successfully verified.
          Redirecting to login…
        </p>
      </div>
    </div>
  );
};

export default EmailVerified;
