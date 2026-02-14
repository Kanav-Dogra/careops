"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

export default function PublicIntakePage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const formId = params.formId as string;
  const bookingId = searchParams.get("booking");

  const [formData, setFormData] = useState<any>(null);
  const [responses, setResponses] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ✅ Fetch form safely
  useEffect(() => {
    async function fetchForm() {
      try {
        const res = await fetch(`/api/intake/${formId}`);

        if (!res.ok) {
          setError("Form not found");
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (!data || !data.id) {
          setError("Invalid form");
          setLoading(false);
          return;
        }

        setFormData(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load form");
        setLoading(false);
      }
    }

    if (formId) {
      fetchForm();
    }
  }, [formId]);

  async function submitForm(e: any) {
    e.preventDefault();

    if (!bookingId) {
      setError(
        "Invalid booking reference. Please use the link sent to your email."
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/intake/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          responses,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Submission failed");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Submission failed");
      setSubmitting(false);
    }
  }

  // ---------------- UI STATES ----------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading form...</p>
      </div>
    );
  }

  if (error && !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-10 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold mb-2">
            Intake Submitted ✅
          </h2>
          <p className="text-gray-600">
            Thank you. Your information has been recorded.
          </p>
        </div>
      </div>
    );
  }

  // ---------------- MAIN FORM ----------------

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-6">
      <form
        onSubmit={submitForm}
        className="bg-white p-8 rounded-xl shadow w-full max-w-lg space-y-6"
      >
        <h1 className="text-2xl font-bold">
          {formData?.title}
        </h1>

        {formData?.fields?.map((field: any, index: number) => (
          <div key={index}>
            <label className="block text-sm mb-1 font-medium">
              {field.label}
            </label>

            {field.type === "textarea" ? (
              <textarea
                required
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                onChange={(e) =>
                  setResponses({
                    ...responses,
                    [field.label]: e.target.value,
                  })
                }
              />
            ) : (
              <input
                type={field.type || "text"}
                required
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                onChange={(e) =>
                  setResponses({
                    ...responses,
                    [field.label]: e.target.value,
                  })
                }
              />
            )}
          </div>
        ))}

        {error && (
          <p className="text-red-500 text-sm">
            {error}
          </p>
        )}

        <button
          disabled={submitting}
          className={`w-full py-3 rounded-lg transition ${
            submitting
              ? "bg-gray-400 text-white"
              : "bg-black text-white hover:opacity-90"
          }`}
        >
          {submitting ? "Submitting..." : "Submit Intake"}
        </button>
      </form>
    </div>
  );
}
