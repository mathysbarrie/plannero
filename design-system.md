# Design System: Architectural Clarity

Style: Notion-like, grilles strictes, monochrome, bordures nettes
Scale: Refined (small, elegant sizing)

## Reference Implementation

```tsx
// REQUIRED DEPENDENCIES:
// - lucide-react (npm install lucide-react)
// - framer-motion (npm install framer-motion)
// - clsx tailwind-merge (npm install clsx tailwind-merge)

"use client";

import React, { useState } from "react";
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
  LayoutDashboard,
  ClipboardList,
  Settings,
  Bell
} from "lucide-react";
import { motion } from "framer-motion";
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

const StatCard = ({ label, value, trend, icon: Icon }: any) => (
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

const BookingRow = ({ name, service, time, status }: any) => (
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

const ServiceCard = ({ title, price, icon: Icon, features }: any) => (
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
```

## Design Tokens

### Colors
- **Background**: `#FDFDFD` (off-white)
- **Primary Text**: `neutral-900`
- **Secondary Text**: `neutral-400`, `neutral-500`
- **Borders**: `neutral-200` (default), `neutral-400` (hover), `neutral-900` (active)
- **Accent Success**: `emerald-50/600/700`
- **Accent Warning**: `amber-50/700`
- **Dark Elements**: `neutral-900` (buttons, active states)

### Typography
- **Headings**: `font-light` or `font-medium`, `tracking-tight`
- **Labels**: `text-[10px]` or `text-[11px]`, `uppercase`, `tracking-[0.1em]` or `tracking-widest`, `font-semibold` or `font-bold`
- **Body**: `text-[13px]` or `text-sm`, `font-medium`
- **Values/Numbers**: `text-xl font-light tracking-tight`

### Spacing & Layout
- **Grid borders**: Use border-l, border-t on container, border-r, border-b on items for seamless grid
- **Padding**: `p-4` to `p-6` for cards
- **Gaps**: `gap-0` for grid borders, `gap-4` to `gap-8` for normal spacing

### Components Style

#### Buttons
- Primary: `bg-neutral-900 text-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider hover:bg-neutral-800`
- Secondary: `border border-neutral-200 hover:border-neutral-400`
- Icon button: `p-1.5 bg-neutral-50 border border-neutral-100`

#### Cards
- `bg-white border border-neutral-200 hover:border-neutral-400 transition-colors`
- No rounded corners (sharp edges)

#### Badges
- `px-2 py-0.5 rounded-full text-[10px] font-medium border tracking-tight`
- Variants: neutral, success, warning

#### Navigation
- Active: `text-neutral-900`
- Inactive: `text-neutral-400 hover:text-neutral-600`
- Style: `text-[11px] uppercase tracking-widest font-semibold`

#### Tables/Lists
- Row: `py-3 px-4 border-b border-neutral-100 last:border-0 hover:bg-neutral-50`
- Show actions on hover: `opacity-0 group-hover:opacity-100`

### Visual Effects
- **Background pattern**: Subtle dot grid
  ```tsx
  <div
    className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-1]"
    style={{
      backgroundImage: `radial-gradient(#000 0.5px, transparent 0.5px)`,
      backgroundSize: '24px 24px'
    }}
  />
  ```
- **Transitions**: `transition-colors duration-300` or `transition-all`
- **No rounded corners** on most elements (sharp, architectural feel)
- **No shadows** (rely on borders for depth)

### Key Principles
1. **Monochrome first** - Use neutral grays as the primary palette
2. **Sharp edges** - No border-radius on cards/containers
3. **Grid-based** - Use visible borders to create grid structures
4. **Uppercase labels** - Small, tracked labels for hierarchy
5. **Minimal decoration** - Content-focused, no unnecessary embellishments
6. **Hover states** - Subtle border color changes, not shadow/scale effects
