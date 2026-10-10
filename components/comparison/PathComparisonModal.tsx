"use client";

import React, { useState } from "react";
import { PathComparison } from "../../lib/types/roadmap";
import {
  X,
  GitCompare,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Brain
} from "lucide-react";

interface PathComparisonModalProps {
  currentRole: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PathComparisonModal({
  currentRole,
  isOpen,
  onClose
}: PathComparisonModalProps) {
  const [targetRoleB, setTargetRoleB] = useState("AI Engineer in Healthcare Tech");
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<PathComparison | null>(null);

  if (!isOpen) return null;

  const handleCompare = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/roadmaps/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleA: currentRole,
          roleB: targetRoleB
        })
      });
      if (res.ok) {
        const data = await res.json();
        setComparison(data);
      }
    } catch (err) {
      console.error("Comparison failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0F172A] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-cyan-400">
          <GitCompare className="h-5 w-5" />
          <h2 className="text-lg font-bold text-white">Dual Career Path Comparison</h2>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Compare shared foundational requirements against diverging specialized skills to optimize your study time.
        </p>

        {/* Inputs */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase">
              Current Target (Role A)
            </label>
            <div className="mt-1 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-cyan-300 font-medium">
              {currentRole}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase">
              Comparison Role (Role B)
            </label>
            <input
              type="text"
              value={targetRoleB}
              onChange={(e) => setTargetRoleB(e.target.value)}
              placeholder="e.g. Data Scientist in FinTech"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={loading || !targetRoleB.trim()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 py-2.5 text-xs font-semibold text-white shadow-lg hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-50 transition"
        >
          <Brain className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Analyzing Synergies & Skill Overlap..." : "Compare Career Paths"}
        </button>

        {/* Comparison Results */}
        {comparison && (
          <div className="mt-5 space-y-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs">
            {/* Overlap Metric */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-slate-400">Skill Competency Overlap:</span>
                <div className="text-xl font-extrabold text-cyan-400 font-mono">
                  {comparison.overlapPercentage}%
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Pivot Difficulty:</span>
                <div className="text-sm font-bold text-amber-400">
                  {comparison.pivotDifficulty}
                </div>
              </div>
            </div>

            {/* Shared Foundations */}
            <div>
              <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Shared Foundations (Learn Once, Apply to Both):
              </span>
              <ul className="mt-1.5 space-y-1 list-disc list-inside text-slate-300">
                {comparison.sharedFoundations.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            {/* Strategic Advice */}
            <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-3">
              <span className="flex items-center gap-1.5 font-semibold text-cyan-300">
                <TrendingUp className="h-4 w-4" />
                Strategic Pivot Recommendation:
              </span>
              <p className="mt-1 text-slate-300 leading-relaxed">
                {comparison.strategicRecommendation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
