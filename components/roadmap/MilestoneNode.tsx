"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Milestone } from "../../lib/types/roadmap";
import {
  Code2,
  FolderGit2,
  Award,
  Briefcase,
  CheckCircle2,
  Clock,
  Lock,
  Sparkles,
  PlayCircle
} from "lucide-react";

export const MilestoneNode = memo(({ data, selected }: NodeProps) => {
  const milestone = data as unknown as Milestone;

  // Category Icon & Label
  const getCategoryMeta = () => {
    switch (milestone.category) {
      case "skill":
        return { icon: Code2, label: "Skill", color: "text-cyan-400" };
      case "project":
        return { icon: FolderGit2, label: "Project", color: "text-purple-400" };
      case "certification":
        return { icon: Award, label: "Credential", color: "text-amber-400" };
      case "job_transition":
        return { icon: Briefcase, label: "Transition", color: "text-emerald-400" };
      default:
        return { icon: Code2, label: "Skill", color: "text-cyan-400" };
    }
  };

  const { icon: CategoryIcon, label: categoryLabel, color: categoryColor } = getCategoryMeta();

  // Status Styling
  const getStatusStyles = () => {
    switch (milestone.status) {
      case "completed":
        return {
          container: "border-emerald-500 bg-emerald-950/30 shadow-[0_0_15px_rgba(16,185,129,0.35)]",
          badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          icon: CheckCircle2,
          iconColor: "text-emerald-400",
          statusText: "Completed"
        };
      case "known":
        return {
          container: "border-emerald-500/80 bg-emerald-950/20 shadow-[0_0_10px_rgba(16,185,129,0.25)]",
          badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
          icon: Sparkles,
          iconColor: "text-emerald-400",
          statusText: "Already Known"
        };
      case "in_progress":
        return {
          container: "border-amber-400 bg-amber-950/40 shadow-[0_0_25px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/50 animate-pulse-slow",
          badge: "bg-amber-500/25 text-amber-200 border-amber-400/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]",
          icon: PlayCircle,
          iconColor: "text-amber-400",
          statusText: "In Progress"
        };
      case "available":
        return {
          container: "border-cyan-500 bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.35)] animate-pulse-slow",
          badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
          icon: Sparkles,
          iconColor: "text-cyan-400",
          statusText: "Unlocked"
        };
      case "locked":
      default:
        return {
          container: "border-slate-800 bg-slate-900/60 opacity-70",
          badge: "bg-slate-800 text-slate-400 border-slate-700",
          icon: Lock,
          iconColor: "text-slate-500",
          statusText: "Locked"
        };
    }
  };

  const statusStyle = getStatusStyles();
  const StatusIcon = statusStyle.icon;

  return (
    <div
      className={`group relative w-[280px] rounded-xl border-2 p-3.5 backdrop-blur-md transition-all duration-200 ${statusStyle.container} ${
        selected ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0B0F19]" : ""
      }`}
    >
      {/* Live Active "In Progress" Status Beacon Light */}
      {milestone.status === "in_progress" && (
        <div className="absolute -top-1.5 -right-1.5 z-20 flex h-4 w-4 items-center justify-center" title="Actively In Progress">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 shadow-[0_0_12px_#F59E0B]" />
        </div>
      )}

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className={`!h-3 !w-3 !rounded-full !border-2 !border-slate-900 ${
          milestone.status === "in_progress" ? "!bg-amber-400 shadow-[0_0_8px_#F59E0B]" : "!bg-cyan-400"
        }`}
      />

      {/* Top Meta Bar */}
      <div className="mb-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium">
          <CategoryIcon className={`h-3.5 w-3.5 ${categoryColor}`} />
          <span className="text-slate-300">{categoryLabel}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="h-3 w-3" />
          <span>{milestone.estimatedHours}h</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="line-clamp-2 text-sm font-semibold text-white leading-snug">
        {milestone.title}
      </h3>

      {/* Status Badge */}
      <div className="mt-3 flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-medium ${statusStyle.badge}`}>
          {milestone.status === "in_progress" ? (
            <span className="relative flex h-2 w-2 mr-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
            </span>
          ) : (
            <StatusIcon className={`h-3 w-3 ${statusStyle.iconColor}`} />
          )}
          {statusStyle.statusText}
        </span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
          {milestone.prerequisites.length === 0 ? "Root" : `${milestone.prerequisites.length} prereq`}
        </span>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className={`!h-3 !w-3 !rounded-full !border-2 !border-slate-900 ${
          milestone.status === "in_progress" ? "!bg-amber-400 shadow-[0_0_8px_#F59E0B]" : "!bg-cyan-400"
        }`}
      />
    </div>
  );
});

MilestoneNode.displayName = "MilestoneNode";
