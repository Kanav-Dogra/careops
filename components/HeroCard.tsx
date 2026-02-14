"use client";
import { motion } from "framer-motion";

interface Props {
  percentage: number;
  converted: number;
  total: number;
}

export default function HeroCard({
  percentage,
  converted,
  total,
}: Props) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 
                 rounded-3xl p-10 shadow-2xl text-white 
                 flex justify-between items-center"
    >
      {/* Left Side Content */}
      <div>
        <h2 className="text-xl font-medium tracking-wide opacity-90">
          Conversion Health
        </h2>

        <p className="text-6xl font-extrabold mt-4">
          {percentage}%
        </p>

        <p className="mt-3 text-lg opacity-80">
          {converted} / {total} Leads Converted
        </p>

        <div className="mt-4 text-sm opacity-70">
          Real-time operational performance indicator
        </div>
      </div>

      {/* Animated Circular Progress */}
      <div className="relative w-40 h-40">
        <svg
          className="transform -rotate-90"
          width="160"
          height="160"
        >
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="12"
            fill="transparent"
          />

          {/* Progress circle */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            stroke="white"
            strokeWidth="12"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold">
          {percentage}%
        </div>
      </div>
    </motion.div>
  );
}
