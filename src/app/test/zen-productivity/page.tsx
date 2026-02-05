// REQUIRED DEPENDENCIES:
// - framer-motion (npm install framer-motion)
// - lucide-react (npm install lucide-react)
// - clsx (npm install clsx)
// - tailwind-merge (npm install tailwind-merge)

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  DollarSign,
  Users,
  Sparkles,
  Plus,
  ChevronRight,
  Clock,
  MoreHorizontal,
  LayoutDashboard,
  Settings,
  MessageSquare,
  ClipboardList,
  type LucideIcon
} from 'lucide-react';
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

const StatCard = ({ title, value, icon: Icon, trend }: { title: string, value: string, icon: LucideIcon, trend?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/60 backdrop-blur-md border border-white/40 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-start justify-between"
  >
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-semibold text-slate-800 tracking-tight">{value}</h3>
      {trend && <p className="text-emerald-500 text-xs mt-2 font-medium">{trend}</p>}
    </div>
    <div className="bg-emerald-50 p-3 rounded-2xl">
      <Icon className="w-5 h-5 text-emerald-600" />
    </div>
  </motion.div>
);

const MiniCalendar = () => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const activeDays = [12, 14, 15, 22]; // Mock booking days

  return (
    <div className="bg-white/60 backdrop-blur-md border border-white/40 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-semibold text-slate-800">Schedule</h4>
        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">October</span>
      </div>
      <div className="grid grid-cols-7 gap-y-3 gap-x-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
          <span key={d} className="text-[10px] text-center font-bold text-slate-300">{d}</span>
        ))}
        {days.slice(0, 31).map((d) => (
          <div key={d} className="flex flex-col items-center">
            <button className={cn(
              "w-8 h-8 rounded-xl text-xs flex items-center justify-center transition-all",
              d === 14 ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" :
              activeDays.includes(d) ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-slate-500 hover:bg-slate-50"
            )}>
              {d}
            </button>
            {activeDays.includes(d) && d !== 14 && <div className="w-1 h-1 bg-emerald-300 rounded-full mt-1" />}
          </div>
        ))}
      </div>
    </div>
  );
};

const BookingItem = ({ name, service, time, status }: { name: string, service: string, time: string, status: 'pending' | 'completed' | 'ongoing' }) => (
  <div className="group flex items-center justify-between p-4 rounded-2xl hover:bg-white/80 transition-all cursor-pointer border border-transparent hover:border-slate-100 hover:shadow-sm">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
        <Users className="w-5 h-5" />
      </div>
      <div>
        <h5 className="text-sm font-semibold text-slate-700">{name}</h5>
        <p className="text-xs text-slate-400">{service}</p>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <div className="hidden md:flex items-center gap-2 text-slate-400">
        <Clock className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">{time}</span>
      </div>
      <span className={cn(
        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
        status === 'completed' ? "bg-emerald-50 text-emerald-600" :
        status === 'ongoing' ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
      )}>
        {status}
      </span>
      <button className="text-slate-300 hover:text-slate-600">
        <MoreHorizontal className="w-5 h-5" />
      </button>
    </div>
  </div>
);

const ServiceCard = ({ title, price, duration, color }: { title: string, price: string, duration: string, color: string }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-white/60 backdrop-blur-md border border-white/40 p-5 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.01)] group relative overflow-hidden"
  >
    <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-10 rounded-full transition-transform group-hover:scale-110", color)} />
    <h5 className="text-base font-semibold text-slate-800 mb-1">{title}</h5>
    <div className="flex items-center gap-2 text-slate-400 mb-4">
      <Clock className="w-3.5 h-3.5" />
      <span className="text-xs">{duration}</span>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-lg font-bold text-slate-800">{price}</span>
      <button className="p-2 rounded-xl bg-slate-900 text-white hover:bg-emerald-600 transition-colors">
        <Plus className="w-4 h-4" />
      </button>
    </div>
  </motion.div>
);

/**
 * PAGE COMPONENT
 */
export default function ZenProductivityDashboard() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="min-h-screen bg-[#F9FBFA] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/40 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-blue-100/30 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-[1440px] mx-auto flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-72 h-screen sticky top-0 flex-col p-8 border-r border-slate-100/50">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">CleanZen</span>
          </div>

          <nav className="space-y-2 flex-1">
            {[
              { icon: LayoutDashboard, label: 'Overview' },
              { icon: CalendarIcon, label: 'Bookings' },
              { icon: Users, label: 'Clients' },
              { icon: ClipboardList, label: 'Services' },
              { icon: MessageSquare, label: 'Reviews' },
              { icon: Settings, label: 'Settings' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group",
                  activeTab === item.label
                    ? "bg-white shadow-sm border border-slate-100 text-slate-900"
                    : "text-slate-400 hover:text-slate-600 hover:translate-x-1"
                )}
              >
                <item.icon className={cn("w-5 h-5", activeTab === item.label ? "text-emerald-500" : "text-slate-400 group-hover:text-slate-600")} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100/50">
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-widest mb-2">Pro Plan</p>
            <p className="text-xs text-emerald-700/70 mb-4 leading-relaxed">You have 12 pending booking requests to review.</p>
            <button className="w-full py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100">
              Review Now
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-12 z-10">
          <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Good morning, Elias</h1>
              <p className="text-slate-400 mt-1 font-medium">Here&apos;s what&apos;s happening with your business today.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                <CalendarIcon className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 group">
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                <span className="font-semibold text-sm">New Booking</span>
              </button>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard title="Total Bookings" value="128" icon={CalendarIcon} trend="+12% from last month" />
            <StatCard title="Revenue" value="$4,820.00" icon={DollarSign} trend="+8% from last month" />
            <StatCard title="Active Clients" value="42" icon={Users} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Bookings List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/40 border border-white/60 p-8 rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.02)] backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-slate-800">Upcoming Appointments</h3>
                  <button className="text-emerald-600 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                    View all <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <BookingItem name="Sarah Jenkins" service="Deep Kitchen Clean" time="09:00 AM" status="ongoing" />
                  <BookingItem name="Marcus Holloway" service="Full Home Refresh" time="11:30 AM" status="pending" />
                  <BookingItem name="Elena Rodriguez" service="Window Special" time="02:00 PM" status="pending" />
                  <BookingItem name="Office Hub Inc." service="Commercial Cleaning" time="05:00 PM" status="completed" />
                </div>
              </div>

              {/* Services Grid */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800 px-2">Popular Services</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <ServiceCard title="Eco Refresh" price="$85" duration="2 hrs" color="bg-emerald-400" />
                  <ServiceCard title="Deep Scrub" price="$140" duration="4 hrs" color="bg-blue-400" />
                  <ServiceCard title="Moving Out" price="$210" duration="6 hrs" color="bg-amber-400" />
                </div>
              </div>
            </div>

            {/* Right Column: Widgets */}
            <div className="space-y-8">
              <MiniCalendar />

              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform">
                  <Sparkles className="w-24 h-24" />
                </div>
                <h4 className="text-lg font-bold mb-2 relative z-10">Expand Your Team?</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 relative z-10">You&apos;ve reached 90% capacity this week. Consider adding a new cleaner to your roster.</p>
                <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold text-sm hover:bg-emerald-50 transition-colors relative z-10">
                  Post a Job Opening
                </button>
              </div>

              <div className="bg-white/60 backdrop-blur-md border border-white/40 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <h4 className="font-semibold text-slate-800 mb-4">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                  {['Invoice', 'Reports', 'Vouchers', 'Support'].map(action => (
                    <button key={action} className="p-3 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:border-emerald-200 hover:text-emerald-600 transition-all">
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Quick Action FAB - Refined for Zen Vibe */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(16,185,129,0.3)] z-50 group"
      >
        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span className="absolute right-full mr-4 bg-white text-slate-800 px-4 py-2 rounded-xl text-sm font-bold shadow-xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Customer Support
        </span>
      </motion.button>
    </div>
  );
}
