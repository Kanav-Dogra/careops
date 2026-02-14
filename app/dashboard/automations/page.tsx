"use client";

import { useEffect, useState } from "react";

export default function AutomationsPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function fetchRules() {
    try {
      const res = await fetch("/api/automations");
      const data = await res.json();

      setRules(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Rule fetch failed:", err);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRules();
  }, []);

  async function toggleRule(id: string) {
    await fetch(`/api/automations/${id}`, {
      method: "PATCH",
    });
    fetchRules();
  }

  async function createDefaultRules() {
    setCreating(true);

    const defaults = [
      { trigger: "New Lead", action: "Send Welcome Email" },
      { trigger: "Lead Converted", action: "Send Confirmation" },
      { trigger: "Booking Created", action: "Send Confirmation" },
      { trigger: "1 Day Before Booking", action: "Send Reminder" },
      { trigger: "After Booking", action: "Send Intake Form" },
      { trigger: "Inventory Below Threshold", action: "Send Vendor Alert" },
    ];

    for (const rule of defaults) {
      await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rule),
      });
    }

    setCreating(false);
    fetchRules();
  }

  if (loading) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold">Loading Automations...</h1>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-10">
      <h1 className="text-3xl font-bold">Automation Engine</h1>

      {rules.length === 0 && (
        <button
          onClick={createDefaultRules}
          disabled={creating}
          className={`px-4 py-2 rounded ${
            creating ? "bg-gray-400" : "bg-black text-white"
          }`}
        >
          {creating ? "Initializing..." : "Initialize Default Rules"}
        </button>
      )}

      <div className="space-y-6">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white p-6 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-lg">{rule.trigger}</p>
              <p className="text-gray-500 text-sm mt-1">
                → {rule.action}
              </p>
            </div>

            <button
              onClick={() => toggleRule(rule.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                rule.active
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              {rule.active ? "Active" : "Disabled"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
