"use client";

import React, { useState } from "react";
import { Milestone, MilestoneStatus, MilestoneGuidance } from "../../lib/types/roadmap";
import confetti from "canvas-confetti";
import {
  X,
  Clock,
  Sparkles,
  CheckCircle2,
  PlayCircle,
  FolderGit2,
  Code2,
  HelpCircle,
  AlertTriangle,
  FileCode2,
  ChevronDown,
  ChevronUp,
  Brain,
  ExternalLink,
  Target
} from "lucide-react";

interface MilestoneInspectorProps {
  milestone: Milestone | null;
  targetRole: string;
  onClose: () => void;
  onUpdateStatus: (milestoneId: string, newStatus: MilestoneStatus) => void;
}

export function MilestoneInspector({
  milestone,
  targetRole,
  onClose,
  onUpdateStatus
}: MilestoneInspectorProps) {
  const [loadingGuidance, setLoadingGuidance] = useState(false);
  const [guidance, setGuidance] = useState<MilestoneGuidance | null>(null);
  const [expandedInterviewIdx, setExpandedInterviewIdx] = useState<number | null>(0);

  // Reset guidance when selected milestone changes
  React.useEffect(() => {
    setGuidance(null);
  }, [milestone?.id]);

  if (!milestone) return null;

  const getGithubUrl = (repo: string) => {
    const clean = repo.trim().replace(/^https?:\/\/github\.com\//, "");
    if (clean.includes("/") && !clean.includes(" ")) {
      return `https://github.com/${clean}`;
    }
    return `https://github.com/search?q=${encodeURIComponent(repo)}&type=repositories`;
  };

  const handleComplete = () => {
    onUpdateStatus(milestone.id, "completed");
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleMarkKnown = () => {
    onUpdateStatus(milestone.id, "known");
  };

  const handleStart = () => {
    onUpdateStatus(milestone.id, "in_progress");
  };

  const fetchDeepGuidance = async () => {
    setLoadingGuidance(true);
    try {
      const res = await fetch("/api/milestones/guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId: milestone.id,
          nodeTitle: milestone.title,
          targetRole
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGuidance(data);
      }
    } catch (err) {
      console.error("Failed to load milestone guidance:", err);
    } finally {
      setLoadingGuidance(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-800 bg-[#0F172A]/95 p-6 shadow-2xl backdrop-blur-xl sm:w-[480px]">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
            {milestone.phase}
          </span>
          <h2 className="mt-1 text-lg font-bold text-white leading-snug">
            {milestone.title}
          </h2>
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              {milestone.estimatedHours} hours
            </span>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-300 font-medium capitalize">
              {milestone.category}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          aria-label="Close panel"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Action Controls */}
      <div className="my-4 grid grid-cols-3 gap-2">
        <button
          onClick={handleMarkKnown}
          className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
            milestone.status === "known"
              ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
              : "border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-600 hover:bg-slate-700"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          Mark Known
        </button>

        <button
          onClick={handleStart}
          className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
            milestone.status === "in_progress"
              ? "border-amber-500 bg-amber-500/20 text-amber-300"
              : "border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-600 hover:bg-slate-700"
          }`}
        >
          <PlayCircle className="h-3.5 w-3.5 text-amber-400" />
          In Progress
        </button>

        <button
          onClick={handleComplete}
          className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
            milestone.status === "completed"
              ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              : "border-emerald-600/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          Completed
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 space-y-5 overflow-y-auto pr-1">
        {/* Why It Matters */}
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
            <Target className="h-4 w-4" />
            Why it matters for {targetRole}
          </div>
          <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
            {milestone.whyItMatters}
          </p>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Overview
          </h4>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
            {milestone.description}
          </p>
        </div>

        {/* Key Skills to Master */}
        <div>
          <h4 className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Code2 className="h-3.5 w-3.5 text-cyan-400" />
            Key Competencies
          </h4>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {milestone.actionableDetails.keySkillsToMaster.map((skill, idx) => (
              <span
                key={idx}
                className="rounded-md border border-slate-700 bg-slate-800/80 px-2 py-1 text-[11px] font-medium text-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Portfolio Mini-Project */}
        <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
            <FolderGit2 className="h-4 w-4" />
            Actionable Practical Project / Case Study
          </div>
          <p className="mt-1.5 text-xs text-slate-200 leading-relaxed">
            {milestone.actionableDetails.miniProjectIdea}
          </p>
          <div className="mt-3 border-t border-purple-500/20 pt-2.5">
            <span className="text-[11px] font-semibold text-purple-400">
              Suggested Templates, Blueprints & Reference Resources:
            </span>
            <div className="mt-2 space-y-1.5">
              {milestone.actionableDetails.githubRepoSuggestions.map((repo, idx) => {
                const href = getGithubUrl(repo);
                return (
                  <a
                    key={idx}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-lg border border-purple-500/30 bg-purple-950/40 px-3 py-2 text-xs text-purple-200 hover:border-purple-400 hover:bg-purple-900/60 hover:text-white transition"
                    title={`Open ${repo} on GitHub`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FolderGit2 className="h-3.5 w-3.5 text-purple-400 group-hover:text-purple-300 flex-shrink-0" />
                      <span className="font-mono text-[11px] font-medium truncate">
                        {repo}
                      </span>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-purple-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Interview Challenge Questions */}
        <div>
          <h4 className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
            Interview Preparation
          </h4>
          <div className="mt-2 space-y-2">
            {milestone.actionableDetails.interviewQuestions.map((q, idx) => {
              const isExpanded = expandedInterviewIdx === idx;
              return (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedInterviewIdx(isExpanded ? null : idx)}
                    className="flex w-full items-center justify-between p-2.5 text-left text-xs font-medium text-slate-200 hover:text-white"
                  >
                    <span className="pr-2">{q}</span>
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="border-t border-slate-800/80 bg-slate-950/40 p-2.5 text-[11px] text-slate-400 leading-relaxed">
                      💡 <strong>Evaluation Tip:</strong> Frame your answer using real practical experience and evidence from your project deliverable above. Focus on methodology, trade-offs, and compliance.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Deep AI Guidance Section */}
        <div className="border-t border-slate-800 pt-4">
          {!guidance ? (
            <button
              onClick={fetchDeepGuidance}
              disabled={loadingGuidance}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 to-slate-900 p-3 text-xs font-semibold text-cyan-300 hover:border-cyan-400 hover:text-cyan-200 transition disabled:opacity-50"
            >
              <Brain className={`h-4 w-4 text-cyan-400 ${loadingGuidance ? "animate-spin" : ""}`} />
              {loadingGuidance ? "Synthesizing Deep Specs..." : "Generate Deep Domain Guide & Interview Scenarios"}
            </button>
          ) : (
            <div className="space-y-4 rounded-xl border border-cyan-500/30 bg-slate-950/50 p-3.5 text-xs">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                <Brain className="h-4 w-4" />
                Lead Domain Specialist Guidance
              </div>

              <div>
                <span className="font-semibold text-slate-300">Methodology & Best Practice Standards:</span>
                <p className="mt-1 text-slate-400 leading-relaxed">
                  {guidance.architectureGuidance}
                </p>
              </div>

              <div>
                <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <FileCode2 className="h-3.5 w-3.5 text-cyan-400" />
                  Recommended Deliverable / Documentation Structure:
                </span>
                <pre className="mt-1.5 overflow-x-auto rounded-lg bg-slate-900 p-2 text-[11px] font-mono text-cyan-200">
                  {guidance.folderStructure}
                </pre>
              </div>

              <div>
                <span className="flex items-center gap-1.5 font-semibold text-amber-300">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  Rookie Pitfalls to Avoid:
                </span>
                <ul className="mt-1 space-y-1 list-disc list-inside text-slate-400 text-[11px]">
                  {guidance.rookieMistakes.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="flex items-center gap-1.5 font-semibold text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Mastery Verification Checklist:
                </span>
                <ul className="mt-1 space-y-1 list-disc list-inside text-slate-400 text-[11px]">
                  {guidance.masteryChecklist.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
