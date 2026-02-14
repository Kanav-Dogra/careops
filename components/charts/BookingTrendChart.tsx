"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function BookingTrendChart({ bookings }: any) {
  const grouped: any = {};

  bookings.forEach((b: any) => {
    const date = new Date(b.createdAt).toLocaleDateString();
    grouped[date] = (grouped[date] || 0) + 1;
  });

  const data = {
    labels: Object.keys(grouped),
    datasets: [
      {
        label: "Bookings Over Time",
        data: Object.values(grouped),
        borderColor: "#6366f1",
        backgroundColor: "#6366f1",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h3 className="font-semibold mb-4">
        Booking Trend
      </h3>
      <Line data={data} />
    </div>
  );
}
