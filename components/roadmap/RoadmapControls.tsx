"use client";

import React from "react";
import {
  Clock,
  Calendar,
  Sparkles,
  GitCompare,
  Download,
  CheckCircle2,
  Lock,
  PlayCircle,
  AlertCircle
} from "lucide-react";

interface RoadmapControlsProps {
  weeklyHours: number;
  durationMonths: number;
  remainingHours: number;
  progressPercentage: number;
  completedCount: number;
  totalCount: number;
  feasibilityRating: "Comfortable" | "Realistic" | "Aggressive" | "Unrealistic";
  feasibilityFeedback: string;
  onUpdateWeeklyHours: (hours: number) => void;
  onUpdateDurationMonths: (months: number) => void;
  onOpenCompare: () => void;
  onExportPNG: () => void;
  onRegenerateAI?: () => void;
  isRegenerating?: boolean;
}

export function RoadmapControls({
  weeklyHours,
  durationMonths,
  remainingHours,
  progressPercentage,
  completedCount,
  totalCount,
  feasibilityRating,
  feasibilityFeedback,
  onUpdateWeeklyHours,
  onUpdateDurationMonths,
  onOpenCompare,
  onExportPNG,
  onRegenerateAI,
  isRegenerating
}: RoadmapControlsProps) {
  const getFeasibilityBadge = () => {
    switch (feasibilityRating) {
      case "Comfortable":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "Realistic":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
      case "Aggressive":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "Unrealistic":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      default:
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0F172A]/90 p-4 shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Progress & Feasibility Stats */}
        <div className="flex flex-wrap items-center gap-6">
          {/* Progress Ring / Percentage */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-cyan-500/40 bg-slate-900">
              <span className="text-xs font-bold text-cyan-300 font-mono">
                {progressPercentage}%
              </span>
            </div>
            <div>
              <div className="text-xs font-semibold text-white">
                Career Readiness
              </div>
              <div className="text-[11px] text-slate-400">
                {completedCount} of {totalCount} milestones completed
              </div>
            </div>
          </div>

          {/* Feasibility Indicator */}
          <div className="hidden sm:block border-l border-slate-800 pl-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">Pacing Feasibility:</span>
              <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${getFeasibilityBadge()}`}>
                {feasibilityRating}
              </span>
            </div>
            <p className="mt-0.5 max-w-xs text-[11px] text-slate-400 line-clamp-1">
              {feasibilityFeedback}
            </p>
          </div>
        </div>

        {/* Dynamic Constraint Sliders */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Study Hours Slider */}
          <div className="w-36 sm:w-40">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="h-3 w-3 text-cyan-400" />
                Hours/Wk:
              </span>
              <span className="font-semibold text-white font-mono">{weeklyHours}h</span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={weeklyHours}
              onChange={(e) => onUpdateWeeklyHours(Number(e.target.value))}
              className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400"
            />
          </div>

          {/* Duration Months Slider */}
          <div className="w-36 sm:w-40">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-400">
                <Calendar className="h-3 w-3 text-purple-400" />
                Timeline:
              </span>
              <span className="font-semibold text-white font-mono">{durationMonths} mos</span>
            </div>
            <input
              type="range"
              min={1}
              max={24}
              step={1}
              value={durationMonths}
              onChange={(e) => onUpdateDurationMonths(Number(e.target.value))}
              className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-purple-400"
            />
          </div>

          {/* Total Capacity Pill */}
          <div className="hidden lg:flex flex-col justify-center border-l border-slate-800 pl-4 text-xs">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Total Capacity</span>
            <span className="font-mono font-bold text-cyan-300">~{Math.round(weeklyHours * 4.33 * durationMonths)}h</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onRegenerateAI && (
              <button
                onClick={onRegenerateAI}
                disabled={isRegenerating}
                className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-gradient-to-r from-cyan-950/60 to-slate-900 px-3 py-2 text-xs font-semibold text-cyan-300 hover:border-cyan-400 hover:bg-cyan-900/60 hover:text-white transition disabled:opacity-50 shadow-sm"
                title="Re-generate and optimize AI roadmap for newly selected weekly hours and duration"
              >
                <Sparkles className={`h-3.5 w-3.5 text-cyan-400 ${isRegenerating ? "animate-spin" : ""}`} />
                {isRegenerating ? "Re-engineering..." : "Re-engineer Plan"}
              </button>
            )}

            <button
              onClick={onOpenCompare}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-700 hover:text-white transition"
              title="Compare side-by-side with an alternative career path"
            >
              <GitCompare className="h-3.5 w-3.5 text-cyan-400" />
              Compare Roles
            </button>

            <button
              onClick={onExportPNG}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-700 hover:text-white transition"
              title="Export roadmap to JSON/Image"
            >
              <Download className="h-3.5 w-3.5 text-purple-400" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Status Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-between border-t border-slate-800/80 pt-2.5 text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" />
            Completed / Known
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#06B6D4]" />
            Unlocked (Prereqs Met)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B]" />
            In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-600" />
            Locked (Prereqs Required)
          </span>
        </div>
        <div className="font-mono text-cyan-300/80">
          Remaining Study: <span className="font-bold text-white">{remainingHours} hours</span>
        </div>
      </div>
    </div>
  );
}
