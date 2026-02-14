"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Leads", href: "/dashboard/leads" },
  { name: "Bookings", href: "/dashboard/bookings" },
  { name: "Forms", href: "/dashboard/forms" },
  { name: "Automations", href: "/dashboard/automations" },
  { name: "Inventory", href: "/dashboard/inventory" },
  { name: "Team", href: "/dashboard/team" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-black text-white min-h-screen p-6 space-y-6">
      <h1 className="text-2xl font-bold">CareOps</h1>

      <div className="space-y-3">
        {links.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`block px-4 py-2 rounded-lg transition ${
              pathname === link.href
                ? "bg-white text-black"
                : "hover:bg-gray-800"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
