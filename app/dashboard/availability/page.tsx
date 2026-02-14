"use client";

import { useEffect, useState } from "react";

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    day: "Monday",
    startTime: "",
    endTime: "",
  });

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // 🔥 Fetch Business Role Only
  async function fetchBusinessContext() {
    try {
      const res = await fetch("/api/business");
      const data = await res.json();

      if (data?.role) {
        setRole(data.role);
      }
    } catch (error) {
      console.error("Business fetch error:", error);
    }
  }

  async function fetchSlots() {
    const res = await fetch("/api/availability");
    const data = await res.json();
    setSlots(data);
    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      await fetchBusinessContext();
      await fetchSlots();
    }
    init();
  }, []);

  async function addSlot(e: any) {
    e.preventDefault();

    if (!form.startTime || !form.endTime) {
      alert("Please enter valid time range");
      return;
    }

    if (form.startTime >= form.endTime) {
      alert("Start time must be before end time");
      return;
    }

    const res = await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form), // 🔥 no businessId needed
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Failed to add slot");
      return;
    }

    setForm({
      day: "Monday",
      startTime: "",
      endTime: "",
    });

    fetchSlots();
  }

  async function deleteSlot(id: string) {
    await fetch(`/api/availability/${id}`, {
      method: "DELETE",
    });

    fetchSlots();
  }

  if (role === "Staff") {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold text-red-600">
          Access Denied — Owner Only
        </h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold">
          Loading Availability...
        </h1>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-10">

      <h1 className="text-3xl font-bold">
        Working Hours & Availability
      </h1>

      {/* Add Slot Form */}
      <form
        onSubmit={addSlot}
        className="bg-white p-6 rounded-xl shadow space-y-4 w-96"
      >
        <select
          className="w-full border p-2 rounded"
          value={form.day}
          onChange={(e) =>
            setForm({ ...form, day: e.target.value })
          }
        >
          {days.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>

        <input
          type="time"
          className="w-full border p-2 rounded"
          value={form.startTime}
          onChange={(e) =>
            setForm({ ...form, startTime: e.target.value })
          }
          required
        />

        <input
          type="time"
          className="w-full border p-2 rounded"
          value={form.endTime}
          onChange={(e) =>
            setForm({ ...form, endTime: e.target.value })
          }
          required
        />

        <button className="bg-black text-white px-4 py-2 rounded w-full">
          Save Working Hours
        </button>
      </form>

      {/* Slot List */}
      <div className="space-y-6">
        {slots.length === 0 && (
          <p className="text-gray-500">
            No availability configured yet.
          </p>
        )}

        {slots.map((slot) => (
          <div
            key={slot.id}
            className="bg-white p-6 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">
                {slot.day}
              </p>
              <p className="text-sm text-gray-600">
                {slot.startTime} - {slot.endTime}
              </p>
            </div>

            <button
              onClick={() => deleteSlot(slot.id)}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
