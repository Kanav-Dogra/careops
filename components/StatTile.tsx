"use client";
import { motion } from "framer-motion";

export default function StatTile({ title, value, color }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl p-6 shadow-md relative"
    >
      <div
        className={`w-10 h-10 rounded-full ${color} absolute -top-4 left-6 shadow`}
      />

      <p className="text-gray-500 mt-6">
        {title}
      </p>

      <h3 className="text-3xl font-bold mt-2">
        {value}
      </h3>
    </motion.div>
  );
}
