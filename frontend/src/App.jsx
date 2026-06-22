import React from "react";
import Dashboard from "./components/Dashboard";
import { Sparkles } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1e293b] font-sans selection:bg-violet-200 selection:text-violet-900">
      {/* Flat White Navigation Header with thin border, strictly no shadows or gradients */}
      <nav className="relative z-10 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-violet-100 rounded-lg text-violet-700">
                <Sparkles size={20} />
              </div>
              <span className="text-lg font-bold text-slate-800 tracking-tight">
                Feedback Intelligence Platform
              </span>
            </div>

            {/* Tech badges in soft pastel violet, strictly flat */}
            <div className="hidden sm:flex items-center gap-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-600 border border-violet-100">
                FastAPI
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-600 border border-violet-100">
                Gemini 2.5
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-600 border border-violet-100">
                React
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Layout Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Dashboard />
      </main>

      {/* Footer in clean light-gray flat border style */}
      <footer className="relative z-10 border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} AI Feedback Intelligence Platform MVP. Clean Pastel Edition.</p>
        </div>
      </footer>
    </div>
  );
}
