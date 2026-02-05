"use client";

import Link from "next/link";

const designs = [
  {
    id: "architectural-clarity",
    name: "Architectural Clarity",
    emoji: "🏛️",
    description: "Notion style - grilles strictes, monochrome, bordures nettes",
    scale: "Refined",
  },
  {
    id: "zen-productivity",
    name: "Zen Productivity",
    emoji: "☁️",
    description: "Espaces blancs, flous subtils, environnement calme",
    scale: "Balanced",
  },
  {
    id: "glass-precision",
    name: "Glass Precision",
    emoji: "💎",
    description: "Apple aesthetic - translucidité, verre dépoli, premium",
    scale: "Refined",
  },
];

export default function TestIndexPage() {
  return (
    <div className="min-h-screen bg-neutral-50 p-8 md:p-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
            UI Test Lab
          </p>
          <h1 className="text-3xl font-light text-neutral-900 tracking-tight">
            Design Directions
          </h1>
          <p className="text-neutral-500 mt-2">
            Compare les différentes approches visuelles pour Plannero
          </p>
        </div>

        <div className="space-y-4">
          {designs.map((design) => (
            <Link
              key={design.id}
              href={`/test/${design.id}`}
              className="group block p-6 bg-white border border-neutral-200 hover:border-neutral-400 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{design.emoji}</span>
                  <div>
                    <h2 className="text-lg font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors">
                      {design.name}
                    </h2>
                    <p className="text-sm text-neutral-500 mt-0.5">
                      {design.description}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-neutral-100 px-2 py-1">
                  {design.scale}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 p-6 bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Les styles &quot;Organic Utility&quot; et &quot;Kinetic Efficiency&quot; n&apos;ont pas pu être générés (quota Gemini atteint).
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            ← Retour au Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
