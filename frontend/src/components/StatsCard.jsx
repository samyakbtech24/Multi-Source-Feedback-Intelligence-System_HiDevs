import React from "react";

export default function StatsCard({ title, value, icon, description, badgeColor = "bg-slate-100 text-slate-600 border-slate-200" }) {
  return (
    <div className="relative overflow-hidden bg-white border border-slate-200 rounded-xl p-5 shadow-none">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">{title}</p>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-lg border ${badgeColor}`}>
          {icon}
        </div>
      </div>
      {description && (
        <p className="mt-3 text-xs text-slate-400 font-semibold">
          {description}
        </p>
      )}
    </div>
  );
}
