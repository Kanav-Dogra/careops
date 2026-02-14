"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function PublicLeadForm() {
  const params = useParams();
  const businessId = params.businessId as string;

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/leads/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          businessId,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Submission failed");
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setError("Submission failed");
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-2xl font-bold text-center">
          Thank you! We will contact you soon.
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow space-y-4 w-96"
      >
        <h2 className="text-xl font-bold mb-4">
          Contact Us
        </h2>

        <input
          placeholder="Full Name"
          required
          className="w-full border p-2 rounded"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="Email"
          required
          className="w-full border p-2 rounded"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <textarea
          placeholder="Message"
          required
          className="w-full border p-2 rounded"
          value={form.message}
          onChange={(e) =>
            setForm({ ...form, message: e.target.value })
          }
        />

        {error && (
          <p className="text-red-500 text-sm">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className={`w-full py-2 rounded ${
            loading
              ? "bg-gray-400 text-white"
              : "bg-black text-white"
          }`}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
