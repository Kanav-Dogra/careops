"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PublicBookingPage() {
  const params = useParams();
  const businessId = params.businessId as string;

  const [availability, setAvailability] = useState<any[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // ✅ Fetch availability (backend already scopes business)
  useEffect(() => {
    async function fetchAvailability() {
      const res = await fetch("/api/availability");
      const data = await res.json();
      setAvailability(Array.isArray(data) ? data : []);
    }

    fetchAvailability();
  }, []);

  function generateTimeSlots(start: string, end: string) {
    const times = [];
    let current = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);

    while (current < endTime) {
      times.push(current.toTimeString().slice(0, 5));
      current.setMinutes(current.getMinutes() + 30);
    }

    return times;
  }

  function handleDateChange(selectedDate: string) {
    setForm({ ...form, date: selectedDate, time: "" });
    setError("");

    const selectedDay = new Date(selectedDate).toLocaleDateString("en-US", {
      weekday: "long",
    });

    const slot = availability.find((s: any) => s.day === selectedDay);

    if (!slot) {
      setAvailableTimes([]);
      return;
    }

    const times = generateTimeSlots(slot.startTime, slot.endTime);
    setAvailableTimes(times);
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        date: form.date,
        time: form.time,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      setError(data.message || "Booking failed");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Booking Confirmed 🎉</h2>
          <p className="mt-2 text-gray-600">
            Please check your email for intake form.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow space-y-4 w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4">Schedule Appointment</h2>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full border p-2 rounded"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          required
        />

        <input
          type="date"
          min={new Date().toISOString().split("T")[0]}
          className="w-full border p-2 rounded"
          value={form.date}
          onChange={(e) => handleDateChange(e.target.value)}
          required
        />

        {availableTimes.length > 0 && (
          <select
            className="w-full border p-2 rounded"
            value={form.time}
            onChange={(e) =>
              setForm({ ...form, time: e.target.value })
            }
            required
          >
            <option value="">Select Time</option>
            {availableTimes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}

        {form.date && availableTimes.length === 0 && (
          <p className="text-red-500 text-sm">
            No availability on selected day.
          </p>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button className="w-full bg-black text-white py-2 rounded">
          Confirm Booking
        </button>
      </form>
    </div>
  );
}
