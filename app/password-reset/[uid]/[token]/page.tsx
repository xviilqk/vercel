"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const { uid, token } = params as { uid: string; token: string };
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/password-reset/${uid}/${token}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setError(data?.error || data?.detail || "Failed to reset password.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        {message && <p className="text-green-600 mb-2">{message}</p>}
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <input
          type="password"
          placeholder="Enter new password"
          className="w-full border px-3 py-2 mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <button disabled={loading} className="w-full bg-myOrage text-white py-2 rounded">
          {loading ? "Saving..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
