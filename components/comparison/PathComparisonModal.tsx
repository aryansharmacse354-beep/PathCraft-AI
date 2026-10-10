"use client";

import React, { useState, useEffect } from "react";
import { PathComparison } from "../../lib/types/roadmap";
import {
  X,
  GitCompare,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Brain,
  Layers,
  ChevronRight,
  Check,
  AlertCircle
} from "lucide-react";

interface PathComparisonModalProps {
  currentRole: string;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_ROLES = [
  "Registered Nurse",
  "Healthcare Administrator",
  "Corporate M&A Lawyer",
  "Financial Analyst",
  "Chartered Accountant (CPA)",
  "Aerospace Engineer",
  "Graphic Designer",
  "AI & ML Engineer"
];

export function PathComparisonModal({
  currentRole,
  isOpen,
  onClose
}: PathComparisonModalProps) {
  const [roleA, setRoleA] = useState(currentRole);
  const [roleB, setRoleB] = useState("Healthcare Administrator");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<PathComparison | null>(null);

  // Sync roleA and smart default for roleB when currentRole changes
  useEffect(() => {
    if (currentRole) {
      setRoleA(currentRole);
      const lower = currentRole.toLowerCase();
      if (/health|nurse|doctor|clinic/i.test(lower)) {
        setRoleB("Healthcare Administrator");
      } else if (/law|legal|attorney/i.test(lower)) {
        setRoleB("Compliance Officer & Corporate Counsel");
      } else if (/finan|account|cfa|cpa/i.test(lower)) {
        setRoleB("Chartered Accountant (CPA)");
      } else if (/teach|educat|school/i.test(lower)) {
        setRoleB("Instructional Designer");
      } else if (/aero|space|mechanic/i.test(lower)) {
        setRoleB("Robotics & Automation Engineer");
      } else if (/design|graphic|art/i.test(lower)) {
        setRoleB("Product UX Designer");
      } else if (/chef|culinary|food/i.test(lower)) {
        setRoleB("Restaurant Operations Manager");
      } else {
        setRoleB("AI & Machine Learning Engineer");
      }
    }
  }, [currentRole]);

  if (!isOpen) return null;

  const handleCompare = async () => {
    if (!roleA.trim() || !roleB.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/roadmaps/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleA: roleA.trim(),
          roleB: roleB.trim()
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to compare roles (${res.status})`);
      }

      const data: PathComparison = await res.json();
      setComparison(data);
    } catch (err: any) {
      console.error("Comparison failed:", err);
      setError(err.message || "Could not compare the selected roles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const d = difficulty.toLowerCase();
    if (d.includes("low") || d.includes("easy")) {
      return "border-emerald-500/40 bg-emerald-950/40 text-emerald-300";
    }
    if (d.includes("high") || d.includes("hard")) {
      return "border-rose-500/40 bg-rose-950/40 text-rose-300";
    }
    return "border-amber-500/40 bg-amber-950/40 text-amber-300";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative my-8 w-full max-w-3xl rounded-2xl border border-slate-800 bg-[#0F172A] p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 text-cyan-400">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-950/60 border border-cyan-500/40">
            <GitCompare className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Dual Career Path Comparison</h2>
            <p className="text-xs text-slate-400">
              Analyze shared foundation competencies, distinct specializations, and transferability between two target careers.
            </p>
          </div>
        </div>

        {/* Role Inputs Grid */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Role A */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <label className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider">
              Target Role A
            </label>
            <input
              type="text"
              value={roleA}
              onChange={(e) => setRoleA(e.target.value)}
              placeholder="e.g. Full Stack Developer"
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            />
            <div className="mt-2 flex flex-wrap gap-1">
              {PRESET_ROLES.slice(0, 4).map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRoleA(r)}
                  className="rounded px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 hover:text-cyan-300 hover:bg-slate-700 transition"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Role B */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <label className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">
              Comparison Role B
            </label>
            <input
              type="text"
              value={roleB}
              onChange={(e) => setRoleB(e.target.value)}
              placeholder="e.g. DevOps & Cloud Engineer"
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
            />
            <div className="mt-2 flex flex-wrap gap-1">
              {PRESET_ROLES.slice(4, 8).map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRoleB(r)}
                  className="rounded px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 hover:text-purple-300 hover:bg-slate-700 transition"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleCompare}
          disabled={loading || !roleA.trim() || !roleB.trim()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-purple-600 py-3 text-xs font-bold text-white shadow-lg hover:from-cyan-500 hover:to-purple-500 disabled:opacity-50 transition"
        >
          <Brain className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Analyzing Synergies & Discrepancies with AI..." : "Run Side-by-Side Comparison"}
        </button>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Comparison Results Area */}
        {comparison && (
          <div className="mt-5 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* Top Score & Feasibility Matrix */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Skill Competency Overlap
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-cyan-400 font-mono">
                      {comparison.overlapPercentage}%
                    </span>
                    <span className="text-xs text-slate-400">shared engineering foundation</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Pivot Transition Difficulty
                  </span>
                  <div className="mt-1">
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getDifficultyColor(comparison.pivotDifficulty)}`}>
                      {comparison.pivotDifficulty}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Visual Bar */}
              <div className="mt-3">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${Math.min(Math.max(comparison.overlapPercentage, 5), 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Side-by-Side Unique Skills Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Role A Unique Column */}
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/10 p-3.5">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                  <span className="text-xs font-bold text-cyan-300">
                    Unique to: {comparison.roleA}
                  </span>
                  <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                    {comparison.roleAUniqueSkills?.length || 0} skills
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {comparison.roleAUniqueSkills && comparison.roleAUniqueSkills.length > 0 ? (
                    comparison.roleAUniqueSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-md border border-cyan-500/30 bg-slate-900/90 px-2 py-1 text-[11px] text-slate-200"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No distinct skills identified</span>
                  )}
                </div>
              </div>

              {/* Role B Unique Column */}
              <div className="rounded-xl border border-purple-500/20 bg-purple-950/10 p-3.5">
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                  <span className="text-xs font-bold text-purple-300">
                    Unique to: {comparison.roleB}
                  </span>
                  <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
                    {comparison.roleBUniqueSkills?.length || 0} skills
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {comparison.roleBUniqueSkills && comparison.roleBUniqueSkills.length > 0 ? (
                    comparison.roleBUniqueSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-md border border-purple-500/30 bg-slate-900/90 px-2 py-1 text-[11px] text-slate-200"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">No distinct skills identified</span>
                  )}
                </div>
              </div>
            </div>

            {/* Shared Foundations (Learn Once, Apply to Both) */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Shared Foundation Competencies (Master Once, Apply to Both)
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Investing study hours into these core pillars accelerates career readiness for either role simultaneously:
              </p>
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {comparison.sharedFoundations && comparison.sharedFoundations.map((foundation, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-slate-900/60 px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="line-clamp-1">{foundation}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Advice Card */}
            <div className="rounded-xl border border-cyan-500/30 bg-slate-950/60 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <TrendingUp className="h-4 w-4" />
                Career Mobility & Strategic Transition Advice
              </div>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                {comparison.strategicRecommendation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
