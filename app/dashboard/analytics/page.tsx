"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
);

export default function AnalyticsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    const [leadsRes, bookingsRes, inventoryRes] = await Promise.all([
      fetch("/api/leads"),
      fetch("/api/bookings"),
      fetch("/api/inventory"),
    ]);

    const leadsData = await leadsRes.json();
    const bookingsData = await bookingsRes.json();
    const inventoryData = await inventoryRes.json();

    setLeads(leadsData);
    setBookings(bookingsData);
    setInventory(inventoryData);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold">Loading Analytics...</h1>
      </div>
    );
  }

  // 🔥 BOOKINGS PER DAY
  const bookingsPerDay: Record<string, number> = {};

  bookings.forEach((b) => {
    bookingsPerDay[b.date] =
      (bookingsPerDay[b.date] || 0) + 1;
  });

  const barData = {
    labels: Object.keys(bookingsPerDay),
    datasets: [
      {
        label: "Bookings Per Day",
        data: Object.values(bookingsPerDay),
        backgroundColor: "rgba(59,130,246,0.7)",
      },
    ],
  };

  // 🔥 BOOKING STATUS DISTRIBUTION
type BookingStatus = "Scheduled" | "Completed" | "Cancelled";

const statusCounts: Record<BookingStatus, number> = {
  Scheduled: 0,
  Completed: 0,
  Cancelled: 0,
};

bookings.forEach((b: any) => {
  const status = b.status as BookingStatus;

  if (status in statusCounts) {
    statusCounts[status]++;
  }
});


  const statusData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: [
  "rgba(59,130,246,0.7)",
  "rgba(34,197,94,0.7)",
  "rgba(239,68,68,0.7)",
],
      },
    ],
  };

  // 🔥 LEAD CONVERSION RATE
  const convertedLeads = leads.filter(
    (l) => l.status === "Converted"
  ).length;

  const conversionData = {
    labels: ["Converted", "Remaining"],
    datasets: [
      {
        data: [
          convertedLeads,
          leads.length - convertedLeads,
        ],
        backgroundColor: ["#22c55e", "#d1d5db"],
      },
    ],
  };

  // 🔥 LOW STOCK ITEMS
  const lowStock = inventory.filter(
    (i) => i.quantity <= i.threshold
  );

  return (
    <div className="p-10 space-y-10">

      <h1 className="text-3xl font-bold">
        Operations Analytics
      </h1>

      {/* STATS CARDS */}
      <div className="grid grid-cols-4 gap-6">

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Total Leads</p>
          <h2 className="text-2xl font-bold">
            {leads.length}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Total Bookings</p>
          <h2 className="text-2xl font-bold">
            {bookings.length}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Conversion Rate</p>
          <h2 className="text-2xl font-bold">
            {leads.length === 0
              ? "0%"
              : (
                  (convertedLeads / leads.length) *
                  100
                ).toFixed(1) + "%"}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Low Inventory</p>
          <h2 className="text-2xl font-bold text-red-600">
            {lowStock.length}
          </h2>
        </div>

      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-10">

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">
            Bookings Per Day
          </h2>
          <Bar data={barData} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">
            Booking Status Distribution
          </h2>
          <Doughnut data={statusData} />
        </div>

      </div>

      <div className="bg-white p-6 rounded-xl shadow w-1/2">
        <h2 className="font-semibold mb-4">
          Lead Conversion Breakdown
        </h2>
        <Doughnut data={conversionData} />
      </div>

    </div>
  );
}
