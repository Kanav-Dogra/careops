"use client";

import { useEffect, useState } from "react";

export default function BookingDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  async function fetchBookings() {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();

      setBookings(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Booking fetch error:", err);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    fetchBookings();
  }

  async function deleteBooking(id: string) {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    await fetch(`/api/bookings/${id}`, {
      method: "DELETE",
    });

    fetchBookings();
  }

  const filteredBookings =
    filter === "All"
      ? bookings
      : bookings.filter((b) => b.status === filter);

  if (loading) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold">Loading bookings...</h1>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-10">
      <h1 className="text-3xl font-bold">Booking Overview</h1>

      <div className="flex gap-4">
        {["All", "Scheduled", "Completed", "Cancelled"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg ${
              filter === type ? "bg-black text-white" : "bg-gray-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {filteredBookings.length === 0 && (
          <p className="text-gray-500">No bookings found.</p>
        )}

        {filteredBookings.map((booking) => {
          const intakeCompleted =
            booking.intakeSubmission && booking.intakeSubmission.id;

          return (
            <div
              key={booking.id}
              className="bg-white p-6 rounded-xl shadow space-y-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">
                    {booking.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    {booking.date} at {booking.time}
                  </p>
                </div>

                <div className="flex gap-3 items-center">
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      booking.status === "Scheduled"
                        ? "bg-blue-100 text-blue-700"
                        : booking.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {booking.status}
                  </span>

                  {intakeCompleted ? (
                    <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
                      Intake Completed
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
                      Intake Pending
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() =>
                    updateStatus(booking.id, "Completed")
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Mark Completed
                </button>

                <button
                  onClick={() =>
                    updateStatus(booking.id, "Cancelled")
                  }
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={() =>
                    deleteBooking(booking.id)
                  }
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
