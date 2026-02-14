"use client";
import { useEffect, useState } from "react";

const statuses = ["New", "Contacted", "Converted", "Lost"];

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    const res = await fetch("/api/leads");
    const data = await res.json();
    setLeads(Array.isArray(data) ? data : []);
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    fetchLeads();
  }

  async function convertToBooking(lead: any) {
    await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: "2026-02-15",
        time: "10:00",
        email: lead.email,
      }),
    });

    updateStatus(lead.id, "Converted");
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-8">
        Leads Workflow
      </h1>

      <div className="grid grid-cols-4 gap-6">
        {statuses.map((status) => (
          <div
            key={status}
            className="bg-gray-100 p-4 rounded-xl min-h-[500px]"
          >
            <h2 className="font-semibold mb-4 text-center">
              {status}
            </h2>

            <div className="space-y-4">
              {leads
                .filter((lead) => lead.status === status)
                .map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-white p-4 rounded-lg shadow"
                  >
                    <p className="font-medium">
                      {lead.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {lead.email}
                    </p>

                    <select
                      value={lead.status}
                      onChange={(e) =>
                        updateStatus(
                          lead.id,
                          e.target.value
                        )
                      }
                      className="w-full border p-1 rounded text-sm mt-2"
                    >
                      {statuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>

                    {status !== "Converted" && (
                      <button
                        onClick={() =>
                          convertToBooking(lead)
                        }
                        className="w-full bg-black text-white text-sm py-1 rounded mt-2"
                      >
                        Convert to Booking
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
