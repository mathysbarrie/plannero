// REQUIRED DEPENDENCIES:
// - lucide-react (npm install lucide-react)
// - framer-motion (npm install framer-motion)
// - clsx tailwind-merge (npm install clsx tailwind-merge)

"use client";

import React from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Sparkles,
  ShieldCheck,
  Zap,
  ClipboardList,
  Settings,
  Bell,
  type LucideIcon
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Badge = ({ children, variant = "neutral" }: { children: React.ReactNode, variant?: "neutral" | "success" | "warning" }) => {
  const variants = {
    neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border tracking-tight", variants[variant])}>
      {children}
    </span>
  );
};

const StatCard = ({ label, value, trend, icon: Icon }: { label: string; value: string; trend: string; icon: LucideIcon }) => (
  <div className="p-4 bg-white border border-neutral-200 flex flex-col gap-1 hover:border-neutral-400 transition-colors duration-300">
    <div className="flex items-center justify-between mb-2">
      <div className="p-1.5 bg-neutral-50 border border-neutral-100">
        <Icon size={14} className="text-neutral-500" />
      </div>
      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
        <TrendingUp size={10} /> {trend}
      </span>
    </div>
    <span className="text-[11px] uppercase tracking-[0.1em] text-neutral-400 font-semibold">{label}</span>
    <span className="text-xl font-light tracking-tight text-neutral-900">{value}</span>
  </div>
);

const MiniCalendar = () => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="bg-white border border-neutral-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] font-medium text-neutral-800">October 2023</span>
        <div className="flex gap-1">
          <button className="p-1 hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all">
            <ChevronLeft size={14} />
          </button>
          <button className="p-1 hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-2 text-center">
        {weekDays.map(d => (
          <span key={d} className="text-[10px] text-neutral-400 font-bold">{d}</span>
        ))}
        {days.slice(0, 31).map(d => (
          <button
            key={d}
            className={cn(
              "text-[11px] h-7 w-7 flex items-center justify-center mx-auto transition-all relative",
              d === 24 ? "bg-neutral-900 text-white font-medium" : "text-neutral-600 hover:bg-neutral-50",
              [12, 18, 24, 25].includes(d) && d !== 24 && "after:content-[''] after:absolute after:bottom-1 after:w-1 after:h-1 after:bg-neutral-300 after:rounded-full"
            )}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
};

const BookingRow = ({ name, service, time, status }: { name: string; service: string; time: string; status: string }) => (
  <div className="group flex items-center justify-between py-3 px-4 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
    <div className="flex flex-col">
      <span className="text-[13px] font-medium text-neutral-800">{name}</span>
      <span className="text-[11px] text-neutral-400">{service}</span>
    </div>
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-1.5 text-neutral-400">
        <Clock size={12} />
        <span className="text-[11px] tabular-nums">{time}</span>
      </div>
      <Badge variant={status === "Confirmed" ? "success" : "warning"}>{status}</Badge>
      <button className="opacity-0 group-hover:opacity-100 transition-opacity">
        <MoreHorizontal size={14} className="text-neutral-400" />
      </button>
    </div>
  </div>
);

const ServiceCard = ({ title, price, icon: Icon, features }: { title: string; price: string; icon: LucideIcon; features: string[] }) => (
  <div className="p-5 border border-neutral-200 bg-white hover:border-neutral-900 transition-all group cursor-pointer flex flex-col h-full">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-neutral-900 text-white">
        <Icon size={16} />
      </div>
      <span className="text-[11px] font-bold text-neutral-900 tracking-tighter uppercase">{price}</span>
    </div>
    <h3 className="text-sm font-medium mb-1 text-neutral-900">{title}</h3>
    <p className="text-[11px] text-neutral-500 mb-4 leading-relaxed">Tailored cleaning for {title.toLowerCase()} environments.</p>
    <div className="mt-auto space-y-1.5">
      {features.map((f: string) => (
        <div key={f} className="flex items-center gap-2 text-[10px] text-neutral-400 uppercase tracking-wide">
          <CheckCircle2 size={10} className="text-neutral-300" />
          {f}
        </div>
      ))}
    </div>
  </div>
);

// --- Page Main ---

export default function CleaningDashboard() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white pb-20">
      {/* Top Navigation - Refined & Bordered */}
      <nav className="border-b border-neutral-200 bg-white sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-neutral-900 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rotate-45" />
              </div>
              <span className="text-[13px] font-bold tracking-tight uppercase">ClarityClean</span>
            </div>

            <div className="hidden md:flex gap-6">
              {['Dashboard', 'Bookings', 'Schedule', 'Team'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className={cn(
                    "text-[11px] uppercase tracking-widest font-semibold transition-colors",
                    item === 'Dashboard' ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
                  )}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors">
              <Bell size={16} />
            </button>
            <div className="h-4 w-[1px] bg-neutral-200" />
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-7 h-7 bg-neutral-100 rounded-full border border-neutral-200 flex items-center justify-center text-[10px] font-bold overflow-hidden group-hover:border-neutral-400 transition-colors">
                JD
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-6 pt-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="neutral">OCTOBER 24, 2023</Badge>
              <span className="text-[11px] text-neutral-400 font-medium">·</span>
              <span className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">Operational Status: High Efficiency</span>
            </div>
            <h1 className="text-2xl font-light tracking-tight text-neutral-900">Operations Control</h1>
          </div>

          <button className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all active:scale-95">
            <Plus size={14} strokeWidth={3} />
            New Booking
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-l border-t border-neutral-200 mb-12">
          <div className="border-r border-b border-neutral-200">
            <StatCard label="Bookings Today" value="14" trend="+12%" icon={Calendar} />
          </div>
          <div className="border-r border-b border-neutral-200">
            <StatCard label="Total Revenue" value="$2,480.00" trend="+8%" icon={DollarSign} />
          </div>
          <div className="border-r border-b border-neutral-200">
            <StatCard label="Active Clients" value="124" trend="+5%" icon={Users} />
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-12 gap-8">

          {/* Left Column - Core Data */}
          <div className="col-span-12 lg:col-span-8 space-y-12">

            {/* Recent Bookings Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-neutral-400">Queue / Priority High</h2>
                <button className="text-[10px] uppercase font-bold text-neutral-900 border-b border-neutral-900 pb-0.5">View Archive</button>
              </div>
              <div className="border border-neutral-200 bg-white overflow-hidden">
                <BookingRow name="Alexander Wright" service="Residential / Deep Clean" time="09:00 AM" status="Confirmed" />
                <BookingRow name="Morgan Stanley Ltd." service="Commercial / Weekly" time="11:30 AM" status="In Progress" />
                <BookingRow name="Sienna Miller" service="Move-in Special" time="02:00 PM" status="Confirmed" />
                <BookingRow name="Thomas Varky" service="Residential / Standard" time="04:15 PM" status="Pending" />
              </div>
            </section>

            {/* Service Grid Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-neutral-400">Services / Catalog</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ServiceCard
                  title="Eco Standard"
                  price="$85/hr"
                  icon={Sparkles}
                  features={["Organic Agents", "2 Cleaners", "Same Day"]}
                />
                <ServiceCard
                  title="Deep Restorative"
                  price="$140/hr"
                  icon={ShieldCheck}
                  features={["Steam Sanitize", "3 Cleaners", "Detailed Audit"]}
                />
                <ServiceCard
                  title="Express Refresh"
                  price="$60/hr"
                  icon={Zap}
                  features={["Surface Focus", "1 Cleaner", "Quick Turn"]}
                />
              </div>
            </section>
          </div>

          {/* Right Column - Utilities */}
          <div className="col-span-12 lg:col-span-4 space-y-8">

            <section>
              <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-4">Scheduler / Oct</h2>
              <MiniCalendar />
            </section>

            <section>
              <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-px border border-neutral-200 bg-neutral-200">
                {[
                  { label: 'Export Logs', icon: ClipboardList },
                  { label: 'Team Map', icon: Users },
                  { label: 'System Prefs', icon: Settings },
                  { label: 'Live Support', icon: Bell },
                ].map((action) => (
                  <button
                    key={action.label}
                    className="flex flex-col items-center justify-center p-6 bg-white hover:bg-neutral-50 transition-colors gap-2 group"
                  >
                    <action.icon size={16} className="text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 group-hover:text-neutral-900">{action.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <div className="p-6 bg-neutral-900 text-white flex flex-col gap-4">
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold mb-1 opacity-50">System Quote</h3>
                <p className="text-sm font-light italic leading-relaxed">&quot;Clarity is the result of intentional architecture.&quot;</p>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">Uptime: 99.9%</p>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Subtle Grid Background Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-1]"
        style={{
          backgroundImage: `radial-gradient(#000 0.5px, transparent 0.5px)`,
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
}
