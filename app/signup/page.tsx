"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    businessName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Signup failed");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Signup failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow space-y-4 w-96"
      >
        <h2 className="text-2xl font-bold">
          Create Business
        </h2>

        <input
          placeholder="Business Name"
          className="w-full border p-2 rounded"
          required
          value={form.businessName}
          onChange={(e) =>
            setForm({ ...form, businessName: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          required
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          required
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          disabled={loading}
          className={`w-full py-2 rounded ${
            loading
              ? "bg-gray-400 text-white"
              : "bg-black text-white"
          }`}
        >
          {loading ? "Creating..." : "Create Business"}
        </button>
      </form>
    </div>
  );
}
