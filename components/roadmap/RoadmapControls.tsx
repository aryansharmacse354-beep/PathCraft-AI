"use client";

import React, { useState } from "react";
import {
  Clock,
  Calendar,
  Sparkles,
  GitCompare,
  Download,
  CheckCircle2,
  Lock,
  PlayCircle,
  AlertCircle,
  Sliders,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface RoadmapControlsProps {
  weeklyHours: number;
  durationMonths: number;
  remainingHours: number;
  progressPercentage: number;
  completedCount: number;
  totalCount: number;
  inProgressCount?: number;
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
  inProgressCount = 0,
  feasibilityRating,
  feasibilityFeedback,
  onUpdateWeeklyHours,
  onUpdateDurationMonths,
  onOpenCompare,
  onExportPNG,
  onRegenerateAI,
  isRegenerating
}: RoadmapControlsProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false);

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
    <div className="rounded-xl sm:rounded-2xl border border-slate-800 bg-[#0F172A]/95 p-2.5 sm:p-3.5 shadow-xl backdrop-blur-md transition-all">
      {/* Top Bar: Progress & Feasibility & Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: Readiness & Feasibility */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Progress Ring / Percentage */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 border-cyan-500/40 bg-slate-900 shadow-inner flex-shrink-0">
              <span className="text-[11px] sm:text-xs font-bold text-cyan-300 font-mono">
                {progressPercentage}%
              </span>
            </div>
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span>Career Readiness</span>
                <span className={`inline-block sm:hidden rounded-full border px-1.5 py-0.2 text-[9px] font-semibold ${getFeasibilityBadge()}`}>
                  {feasibilityRating}
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400">
                {completedCount} of {totalCount} completed
              </div>
            </div>
          </div>

          {/* Feasibility Indicator (Hidden on smallest mobile, visible on sm+) */}
          <div className="hidden sm:block border-l border-slate-800 pl-3 sm:pl-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-400">Pacing:</span>
              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getFeasibilityBadge()}`}>
                {feasibilityRating}
              </span>
            </div>
            <p className="mt-0.5 max-w-xs text-[10px] sm:text-[11px] text-slate-400 line-clamp-1">
              {feasibilityFeedback}
            </p>
          </div>
        </div>

        {/* Mobile Expand / Collapse Toggle Button */}
        <div className="flex sm:hidden items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMobileExpanded(!mobileExpanded)}
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-slate-200"
          >
            <Sliders className="h-3 w-3 text-cyan-400" />
            <span>{mobileExpanded ? "Hide" : "Controls"}</span>
            {mobileExpanded ? (
              <ChevronUp className="h-3 w-3 text-slate-400" />
            ) : (
              <ChevronDown className="h-3 w-3 text-slate-400" />
            )}
          </button>
        </div>

        {/* Right on Laptops/Desktops: Sliders & Action Buttons */}
        <div className="hidden sm:flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Study Hours Slider */}
          <div className="w-28 sm:w-32 md:w-36">
            <div className="flex items-center justify-between text-[11px] sm:text-xs">
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
          <div className="w-28 sm:w-32 md:w-36">
            <div className="flex items-center justify-between text-[11px] sm:text-xs">
              <span className="flex items-center gap-1 text-slate-400">
                <Calendar className="h-3 w-3 text-purple-400" />
                Timeline:
              </span>
              <span className="font-semibold text-white font-mono">{durationMonths}m</span>
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

          {/* Total Capacity */}
          <div className="hidden lg:flex flex-col justify-center border-l border-slate-800 pl-3 text-xs">
            <span className="text-[9px] uppercase font-semibold text-slate-500">Capacity</span>
            <span className="font-mono font-bold text-cyan-300">~{Math.round(weeklyHours * 4.33 * durationMonths)}h</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onRegenerateAI && (
              <button
                onClick={onRegenerateAI}
                disabled={isRegenerating}
                className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-gradient-to-r from-cyan-950/60 to-slate-900 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:border-cyan-400 hover:bg-cyan-900/60 hover:text-white transition disabled:opacity-50 shadow-sm"
                title="Re-generate and optimize AI roadmap for newly selected weekly hours and duration"
              >
                <Sparkles className={`h-3.5 w-3.5 text-cyan-400 ${isRegenerating ? "animate-spin" : ""}`} />
                <span className="hidden md:inline">{isRegenerating ? "Re-engineering..." : "Re-engineer Plan"}</span>
                <span className="md:hidden">Re-plan</span>
              </button>
            )}

            <button
              onClick={onOpenCompare}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-700 hover:text-white transition"
              title="Compare side-by-side with an alternative career path"
            >
              <GitCompare className="h-3.5 w-3.5 text-cyan-400" />
              <span>Compare</span>
            </button>

            <button
              onClick={onExportPNG}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-700 hover:text-white transition"
              title="Export roadmap to JSON"
            >
              <Download className="h-3.5 w-3.5 text-purple-400" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Expandable Drawer Section */}
      {mobileExpanded && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-800 sm:hidden space-y-3">
          {/* Sliders Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Weekly Hours:</span>
                <span className="font-bold text-cyan-300 font-mono">{weeklyHours}h</span>
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

            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Target Timeline:</span>
                <span className="font-bold text-purple-300 font-mono">{durationMonths}m</span>
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
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-3 gap-1.5">
            {onRegenerateAI && (
              <button
                onClick={onRegenerateAI}
                disabled={isRegenerating}
                className="flex items-center justify-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-950/40 py-1.5 text-[11px] font-semibold text-cyan-300 disabled:opacity-50"
              >
                <Sparkles className="h-3 w-3 text-cyan-400" />
                <span>Re-plan</span>
              </button>
            )}
            <button
              onClick={onOpenCompare}
              className="flex items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-800 py-1.5 text-[11px] font-medium text-slate-200"
            >
              <GitCompare className="h-3 w-3 text-cyan-400" />
              <span>Compare</span>
            </button>
            <button
              onClick={onExportPNG}
              className="flex items-center justify-center gap-1 rounded-lg border border-slate-700 bg-slate-800 py-1.5 text-[11px] font-medium text-slate-200"
            >
              <Download className="h-3 w-3 text-purple-400" />
              <span>Export</span>
            </button>
          </div>
        </div>
      )}

      {/* Status Legend */}
      <div className="mt-2 sm:mt-2.5 flex flex-wrap items-center justify-between border-t border-slate-800/80 pt-2 text-[10px] sm:text-[11px] text-slate-400 gap-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" />
            Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#06B6D4]" />
            Unlocked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80 ${
                  inProgressCount > 0 ? "inline-flex" : "hidden"
                }`}
              />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
            </span>
            <span className={inProgressCount > 0 ? "font-semibold text-amber-200" : ""}>
              In Progress
              {inProgressCount > 0 && (
                <span className="ml-1 rounded bg-amber-500/20 px-1 py-0.2 text-[9px] font-bold text-amber-300 border border-amber-500/40">
                  {inProgressCount}
                </span>
              )}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-600" />
            Locked
          </span>
        </div>
        <div className="font-mono text-cyan-300/80 text-[10px] sm:text-[11px]">
          Remaining: <span className="font-bold text-white">{remainingHours}h</span>
        </div>
      </div>
    </div>
  );
}
