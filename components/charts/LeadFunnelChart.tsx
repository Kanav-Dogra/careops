"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function LeadFunnelChart({ leads }: any) {
  const counts = {
    New: leads.filter((l: any) => l.status === "New").length,
    Contacted: leads.filter((l: any) => l.status === "Contacted").length,
    Converted: leads.filter((l: any) => l.status === "Converted").length,
    Lost: leads.filter((l: any) => l.status === "Lost").length,
  };

  const data = {
    labels: ["New", "Contacted", "Converted", "Lost"],
    datasets: [
      {
        label: "Lead Funnel",
        data: [
          counts.New,
          counts.Contacted,
          counts.Converted,
          counts.Lost,
        ],
        backgroundColor: [
          "#3b82f6",
          "#f59e0b",
          "#10b981",
          "#ef4444",
        ],
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h3 className="font-semibold mb-4">
        Lead Funnel
      </h3>
      <Bar data={data} />
    </div>
  );
}
