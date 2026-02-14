"use client";
import { useState } from "react";

const statuses = ["New", "Contacted", "Converted", "Lost"];

export default function LeadBoard({ leads }: any) {
  const [data, setData] = useState(leads);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setData((prev: any) =>
      prev.map((lead: any) =>
        lead.id === id ? { ...lead, status } : lead
      )
    );
  }

  return (
    <div className="grid grid-cols-4 gap-6">
      {statuses.map((status) => (
        <div key={status} className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-4">{status}</h2>

          <div className="space-y-4">
            {data
              .filter((lead: any) => lead.status === status)
              .map((lead: any) => (
                <div
                  key={lead.id}
                  className="p-4 bg-gray-100 rounded-lg"
                >
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-sm text-gray-600">
                    {lead.email}
                  </p>

                  <div className="mt-3">
                    <select
                      value={lead.status}
                      onChange={(e) =>
                        updateStatus(lead.id, e.target.value)
                      }
                      className="border p-1 text-sm rounded"
                    >
                      {statuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
