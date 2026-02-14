"use client";
import { motion } from "framer-motion";

export default function Timeline({ lead, bookings }: any) {
  const relatedBooking = bookings.find(
    (b: any) => b.email === lead.email
  );

  const getStatusColor = (status: string) => {
    if (status === "Converted") return "bg-green-500";
    if (status === "Contacted") return "bg-yellow-500";
    if (status === "Lost") return "bg-red-500";
    return "bg-blue-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white shadow-md rounded-2xl p-6 mb-6"
    >
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">
          {lead.name}
        </h3>
        <span
          className={`text-white text-xs px-3 py-1 rounded-full ${getStatusColor(
            lead.status
          )}`}
        >
          {lead.status}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <p>Lead Submitted</p>
        </div>

        {relatedBooking ? (
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <p>
              Booking {relatedBooking.status} –{" "}
              {relatedBooking.date} at {relatedBooking.time}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <p>No Booking Yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
