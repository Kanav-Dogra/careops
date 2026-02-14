// import { prisma } from "@/lib/prisma";
// import HeroCard from "@/components/HeroCard";
// import StatTile from "@/components/StatTile";
// import Timeline from "@/components/Timeline";
// import LeadFunnelChart from "@/components/charts/LeadFunnelChart";
// import BookingTrendChart from "@/components/charts/BookingTrendChart";
// import LogoutButton from "@/components/LogoutButton";

// export default async function Dashboard() {
//   const leads = await prisma.lead.findMany();
//   const bookings = await prisma.booking.findMany();
//   const inventory = await prisma.inventory.findMany();

//   const converted = leads.filter(
//     (lead) => lead.status === "Converted"
//   ).length;

//   const conversionRate =
//     leads.length === 0
//       ? 0
//       : Math.round((converted / leads.length) * 100);

//   const lowStockItems = inventory.filter(
//     (item) => item.quantity <= item.threshold
//   );

//   return (
//     <div className="min-h-screen bg-gray-100 p-10 space-y-10">

//       {/* 🔴 Top Bar */}
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold">
//           CareOps Command Center
//         </h1>

//         <LogoutButton />
//       </div>

//       {/* 🔴 HERO SECTION */}
//       <HeroCard
//         percentage={conversionRate}
//         converted={converted}
//         total={leads.length}
//       />

//       {/* 🟣 STAT GRID */}
//       <div className="grid grid-cols-4 gap-6">
//         <StatTile
//           title="Total Leads"
//           value={leads.length}
//           color="bg-blue-500"
//         />
//         <StatTile
//           title="Bookings"
//           value={bookings.length}
//           color="bg-indigo-500"
//         />
//         <StatTile
//           title="Completed"
//           value={converted}
//           color="bg-green-500"
//         />
//         <StatTile
//           title="Low Inventory"
//           value={lowStockItems.length}
//           color="bg-red-500"
//         />
//       </div>

//       {/* 📊 Charts Section */}
//       <div className="grid grid-cols-2 gap-6">
//         <LeadFunnelChart leads={leads} />
//         <BookingTrendChart bookings={bookings} />
//       </div>

//       {/* 🔴 Inventory Alert */}
//       {lowStockItems.length > 0 && (
//         <div className="bg-red-100 text-red-700 p-4 rounded-xl shadow">
//           ⚠ Inventory Alert: Some items are below threshold.
//         </div>
//       )}

//       {/* 🧾 Timeline Section */}
//       <div>
//         <h2 className="text-2xl font-semibold mb-6">
//           Recent Operations
//         </h2>

//         <div className="space-y-4">
//           {leads.map((lead) => (
//             <Timeline
//               key={lead.id}
//               lead={lead}
//               bookings={bookings}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
import { prisma } from "@/lib/prisma";
import HeroCard from "@/components/HeroCard";
import StatTile from "@/components/StatTile";
import Timeline from "@/components/Timeline";
import LeadFunnelChart from "@/components/charts/LeadFunnelChart";
import BookingTrendChart from "@/components/charts/BookingTrendChart";
import LogoutButton from "@/components/LogoutButton";
import { cookies } from "next/headers";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return <div className="p-10">Not logged in</div>;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { business: true },
  });

  if (!user) {
    return <div className="p-10">User not found</div>;
  }

  const businessId = user.businessId;

  const leads = await prisma.lead.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });

  const bookings = await prisma.booking.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });

  const inventory = await prisma.inventory.findMany({
    where: { businessId },
  });

  const converted = leads.filter(
    (lead) => lead.status === "Converted"
  ).length;

  const conversionRate =
    leads.length === 0
      ? 0
      : Math.round((converted / leads.length) * 100);

  const lowStockItems = inventory.filter(
    (item) => item.quantity <= item.threshold
  );

  const bookingLink = `http://localhost:3000/book/${businessId}`;

  return (
    <div className="min-h-screen bg-gray-100 p-10 space-y-10">

      {/* 🔴 Top Bar */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          CareOps Command Center
        </h1>

        <LogoutButton />
      </div>

      {/* 🔴 HERO SECTION */}
      <HeroCard
        percentage={conversionRate}
        converted={converted}
        total={leads.length}
      />

      {/* 🟣 STAT GRID */}
      <div className="grid grid-cols-4 gap-6">
        <StatTile
          title="Total Leads"
          value={leads.length}
          color="bg-blue-500"
        />
        <StatTile
          title="Bookings"
          value={bookings.length}
          color="bg-indigo-500"
        />
        <StatTile
          title="Converted"
          value={converted}
          color="bg-green-500"
        />
        <StatTile
          title="Low Inventory"
          value={lowStockItems.length}
          color="bg-red-500"
        />
      </div>

      {/* 🚀 QUICK ACTION PANEL */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-bold">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 gap-4">

          <a
            href="/dashboard/forms"
            className="bg-blue-600 text-white px-4 py-2 rounded text-center"
          >
            Manage Intake Forms
          </a>

          <a
            href="/dashboard/availability"
            className="bg-purple-600 text-white px-4 py-2 rounded text-center"
          >
            Set Availability
          </a>

          <a
            href="/dashboard/automations"
            className="bg-green-600 text-white px-4 py-2 rounded text-center"
          >
            Automation Engine
          </a>

          <a
            href={bookingLink}
            target="_blank"
            className="bg-black text-white px-4 py-2 rounded text-center"
          >
            Open Public Booking Page
          </a>

        </div>
      </div>

      {/* 📊 Charts Section (UNCHANGED) */}
      <div className="grid grid-cols-2 gap-6">
        <LeadFunnelChart leads={leads} />
        <BookingTrendChart bookings={bookings} />
      </div>

      {/* 🔴 Inventory Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl shadow">
          ⚠ Inventory Alert: Some items are below threshold.
        </div>
      )}

      {/* 🧾 Timeline Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">
          Recent Operations
        </h2>

        <div className="space-y-4">
          {leads.map((lead) => (
            <Timeline
              key={lead.id}
              lead={lead}
              bookings={bookings}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
