// REQUIRED DEPENDENCIES:
// - lucide-react (npm install lucide-react)
// - framer-motion (npm install framer-motion)
// - clsx (npm install clsx)
// - tailwind-merge (npm install tailwind-merge)

"use client";

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  TrendingUp,
  Users,
  Plus,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Home,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * UTILS
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * COMPONENTS
 */

const GlassCard = ({ children, className, hover = true }: { children: React.ReactNode, className?: string, hover?: boolean }) => (
  <div className={cn(
    "relative group overflow-hidden rounded-xl border border-white/20 bg-white/40 dark:bg-black/20 backdrop-blur-md shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]",
    hover && "transition-all duration-300 hover:bg-white/50 hover:border-white/40 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.12)]",
    className
  )}>
    {/* Subtle Inner Glow */}
    <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 to-transparent opacity-50" />
    <div className="relative z-10">{children}</div>
  </div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' }) => {
  const styles = {
    default: "bg-blue-500/10 text-blue-600 border-blue-200/50",
    success: "bg-emerald-500/10 text-emerald-600 border-emerald-200/50",
    warning: "bg-amber-500/10 text-amber-600 border-amber-200/50",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border backdrop-blur-sm", styles[variant])}>
      {children}
    </span>
  );
};

const MiniCalendar = () => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dates = Array.from({ length: 31 }, (_, i) => i + 1);
  const activeDate = 14;

  return (
    <GlassCard className="p-4" hover={false}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Schedule</h3>
        <div className="flex gap-2">
          <button className="p-1 hover:bg-white/50 rounded-md transition-colors"><ChevronLeft size={14} className="text-slate-500" /></button>
          <button className="p-1 hover:bg-white/50 rounded-md transition-colors"><ChevronRight size={14} className="text-slate-500" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-2 text-center">
        {days.map(d => <span key={d} className="text-[10px] font-bold text-slate-400">{d}</span>)}
        {dates.slice(0, 28).map(d => (
          <div key={d} className="relative flex justify-center items-center py-1">
            <span className={cn(
              "text-[11px] w-6 h-6 flex items-center justify-center rounded-full cursor-pointer transition-all",
              d === activeDate ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" : "text-slate-600 hover:bg-white/60"
            )}>
              {d}
            </span>
            {d === 16 && <div className="absolute bottom-0 w-1 h-1 bg-amber-400 rounded-full" />}
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

const StatCard = ({ title, value, icon: Icon, trend }: { title: string, value: string, icon: React.ElementType, trend: string }) => (
  <GlassCard className="p-4 flex flex-col gap-1 min-w-[160px]">
    <div className="flex justify-between items-start">
      <div className="p-2 bg-blue-500/10 rounded-lg">
        <Icon size={16} className="text-blue-600" />
      </div>
      <span className="text-[10px] font-medium text-emerald-600 bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
        {trend}
      </span>
    </div>
    <div className="mt-2">
      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-tight">{title}</p>
      <h2 className="text-xl font-semibold text-slate-900 leading-none mt-1">{value}</h2>
    </div>
  </GlassCard>
);

const BookingRow = ({ name, service, time, status }: { name: string, service: string, time: string, status: 'Completed' | 'In Progress' | 'Pending' }) => (
  <div className="group flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/40 transition-all border border-transparent hover:border-white/40">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
        {name.split(' ').map(n => n[0]).join('')}
      </div>
      <div>
        <h4 className="text-xs font-semibold text-slate-800">{name}</h4>
        <p className="text-[10px] text-slate-500 flex items-center gap-1">
          <Clock size={10} /> {time} • {service}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <Badge variant={status === 'Completed' ? 'success' : status === 'In Progress' ? 'default' : 'warning'}>
        {status}
      </Badge>
      <button className="text-slate-400 hover:text-slate-600 transition-colors">
        <MoreHorizontal size={14} />
      </button>
    </div>
  </div>
);

const ServiceCard = ({ title, price, icon: Icon, color }: { title: string, price: string, icon: React.ElementType, color: string }) => (
  <GlassCard className="p-3 flex items-center gap-3 cursor-pointer">
    <div className={cn("p-2 rounded-lg", color)}>
      <Icon size={14} className="text-white" />
    </div>
    <div className="flex-1">
      <h4 className="text-[11px] font-bold text-slate-800">{title}</h4>
      <p className="text-[10px] text-slate-500">Starts at {price}</p>
    </div>
  </GlassCard>
);

/**
 * PAGE COMPONENT
 */
export default function CleaningDashboard() {
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[0%] right-[-5%] w-[30%] h-[30%] bg-indigo-400/10 blur-[100px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600">PureFlow Dashboard</span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">System Overview</h1>
            <p className="text-xs text-slate-500 font-medium">Monitoring 14 active cleaners across 3 regions</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search analytics..."
                className="bg-white/50 border border-slate-200/60 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-48 transition-all backdrop-blur-sm"
              />
            </div>
            <div className="relative p-2 bg-white/80 border border-slate-200/60 rounded-lg cursor-pointer hover:bg-white transition-colors">
              <Bell size={16} className="text-slate-600" />
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white" />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Bookings Today" value="12" icon={CalendarIcon} trend="+18%" />
          <StatCard title="Total Revenue" value="$2,440.00" icon={TrendingUp} trend="+12.5%" />
          <StatCard title="Active Clients" value="184" icon={Users} trend="+4%" />
          <StatCard title="Satisfaction" value="98%" icon={ShieldCheck} trend="+0.2%" />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-12 gap-6">

          {/* Left Column: Recent Activity */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <GlassCard className="p-1" hover={false}>
              <div className="p-4 border-b border-white/20 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Recent Bookings</h3>
                  <p className="text-[10px] text-slate-500">Live updates from your booking engine</p>
                </div>
                <button className="text-[10px] font-bold text-blue-600 uppercase tracking-wider hover:opacity-70 transition-opacity">View All</button>
              </div>
              <div className="p-2 space-y-1">
                <BookingRow name="Sarah Jenkins" service="Deep Clean" time="09:00 AM" status="In Progress" />
                <BookingRow name="Michael Chen" service="Standard Clean" time="11:30 AM" status="Pending" />
                <BookingRow name="Aria Montgomery" service="Move Out" time="01:00 PM" status="Pending" />
                <BookingRow name="Robert Fox" service="Eco-Friendly" time="02:15 PM" status="Completed" />
                <BookingRow name="Eleanor Rigby" service="Standard Clean" time="04:00 PM" status="Completed" />
              </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassCard className="p-4" hover={false}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <Home size={16} className="text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800">Operational Health</h4>
                    <p className="text-[10px] text-slate-500">All systems operational</p>
                  </div>
                </div>
                <div className="flex items-end gap-1.5 h-12">
                  {[40, 70, 45, 90, 65, 80, 55, 95, 70, 85].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.05, duration: 0.5 }}
                      className="flex-1 bg-indigo-400/20 rounded-t-sm relative group"
                    >
                      <div className="absolute inset-0 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-sm" />
                    </motion.div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-4 flex items-center justify-between" hover={true}>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">Staff Payouts</h4>
                  <p className="text-xl font-bold text-slate-900 mt-1">$12,400</p>
                  <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Fully Paid
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-blue-500 -rotate-45" />
              </GlassCard>
            </div>
          </div>

          {/* Right Column: Sidebar Widgets */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <MiniCalendar />

            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Service Catalog</h3>
              <ServiceCard
                title="Premium Deep Clean"
                price="$180"
                icon={Sparkles}
                color="bg-purple-500"
              />
              <ServiceCard
                title="Standard Recurring"
                price="$110"
                icon={Home}
                color="bg-blue-500"
              />
              <ServiceCard
                title="Move-In/Out Special"
                price="$250"
                icon={Plus}
                color="bg-indigo-500"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Quick Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <AnimatePresence>
          {isQuickActionOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-16 right-0 mb-2 min-w-[200px]"
            >
              <GlassCard className="p-2 border-white/40 shadow-2xl" hover={false}>
                <button className="w-full flex items-center gap-3 p-2 hover:bg-white/60 rounded-lg transition-colors text-left">
                  <div className="w-7 h-7 rounded bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <CalendarIcon size={14} />
                  </div>
                  <span className="text-[11px] font-medium text-slate-700">Schedule Booking</span>
                </button>
                <button className="w-full flex items-center gap-3 p-2 hover:bg-white/60 rounded-lg transition-colors text-left">
                  <div className="w-7 h-7 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <Users size={14} />
                  </div>
                  <span className="text-[11px] font-medium text-slate-700">Add New Client</span>
                </button>
                <div className="h-px bg-white/20 my-1" />
                <button className="w-full flex items-center gap-3 p-2 hover:bg-white/60 rounded-lg transition-colors text-left">
                  <div className="w-7 h-7 rounded bg-slate-500/10 flex items-center justify-center text-slate-600">
                    <TrendingUp size={14} />
                  </div>
                  <span className="text-[11px] font-medium text-slate-700">Export Report</span>
                </button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-all duration-300 active:scale-95",
            isQuickActionOpen
              ? "bg-slate-900 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/40"
          )}
        >
          <motion.div
            animate={{ rotate: isQuickActionOpen ? 45 : 0 }}
          >
            <Plus size={18} />
          </motion.div>
          <span className="text-xs font-bold uppercase tracking-wider">Quick Action</span>
        </button>
      </div>
    </div>
  );
}
