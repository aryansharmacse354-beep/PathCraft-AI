"use client";

import React, { useState, useEffect } from "react";
import { RoadmapData, Milestone, MilestoneStatus } from "../lib/types/roadmap";
import { RoadmapCanvas } from "../components/roadmap/RoadmapCanvas";
import { RoadmapControls } from "../components/roadmap/RoadmapControls";
import { MilestoneInspector } from "../components/roadmap/MilestoneInspector";
import { PathComparisonModal } from "../components/comparison/PathComparisonModal";
import { evaluateGraphState } from "../lib/utils/graphEngine";
import {
  Compass,
  Sparkles,
  Search,
  Clock,
  Calendar,
  Layers,
  ArrowRight,
  Brain,
  RefreshCw,
  GitCompare,
  Download,
  CheckCircle2,
  Sliders,
  ChevronRight
} from "lucide-react";

const SAMPLE_SUGGESTIONS = [
  "Full Stack Developer at a Climate-Tech Startup",
  "AI Engineer at an Autonomous Robotics Scale-up",
  "Cybersecurity Architect in Decentralized FinTech",
  "UI/UX Product Designer for Healthcare Applications"
];

const COMMON_SKILL_OPTIONS = [
  "Git & GitHub",
  "TypeScript",
  "Python",
  "React",
  "Docker",
  "SQL",
  "REST APIs"
];

export default function Home() {
  const [targetRole, setTargetRole] = useState("Full Stack Developer at a Climate-Tech Startup");
  const [weeklyHours, setWeeklyHours] = useState(15);
  const [durationMonths, setDurationMonths] = useState(6);
  const [existingSkills, setExistingSkills] = useState<string[]>(["Git & GitHub"]);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pathcraft_roadmap");
      if (saved) {
        const parsed = JSON.parse(saved);
        setRoadmap(parsed);
      }
    } catch (e) {
      console.warn("Could not restore roadmap from localStorage", e);
    }
  }, []);

  // Save to localStorage when roadmap updates
  useEffect(() => {
    if (roadmap) {
      try {
        localStorage.setItem("pathcraft_roadmap", JSON.stringify(roadmap));
      } catch (e) {
        console.warn("Could not save roadmap to localStorage", e);
      }
    }
  }, [roadmap]);

  // Generate Roadmap
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetRole.trim()) return;

    setLoading(true);
    setLoadingMessage("Decomposing career role into topological competencies...");

    try {
      setTimeout(() => {
        setLoadingMessage("Synthesizing portfolio projects & dependency graph...");
      }, 1000);

      const res = await fetch("/api/roadmaps/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          weeklyHours,
          targetDurationMonths: durationMonths,
          existingSkills
        })
      });

      if (!res.ok) {
        throw new Error("Generation failed");
      }

      const data: RoadmapData = await res.json();
      setRoadmap(data);
      setShowConfigDrawer(false);
    } catch (err) {
      console.error("Error generating roadmap:", err);
      alert("Failed to generate roadmap. Please check your network or try another query.");
    } finally {
      setLoading(false);
    }
  };

  // Status Update & Dynamic Replanning
  const handleUpdateStatus = (milestoneId: string, newStatus: MilestoneStatus) => {
    if (!roadmap) return;

    const modifiedNodes = roadmap.nodes.map((node) =>
      node.id === milestoneId ? { ...node, status: newStatus } : node
    );

    const evaluation = evaluateGraphState(modifiedNodes, roadmap.weeklyStudyHours, roadmap.targetDurationMonths);

    const updatedRoadmap: RoadmapData = {
      ...roadmap,
      feasibilityRating: evaluation.feasibilityRating,
      feasibilityFeedback: evaluation.feasibilityFeedback,
      nodes: evaluation.updatedNodes
    };

    setRoadmap(updatedRoadmap);

    // Update current selected milestone if open
    const current = evaluation.updatedNodes.find((n) => n.id === milestoneId);
    if (current) {
      setSelectedMilestone(current);
    }
  };

  // Dynamic Weekly Hours change
  const handleUpdateWeeklyHours = (newHours: number) => {
    if (!roadmap) return;
    setWeeklyHours(newHours);
    const evaluation = evaluateGraphState(roadmap.nodes, newHours, roadmap.targetDurationMonths);
    setRoadmap({
      ...roadmap,
      weeklyStudyHours: newHours,
      feasibilityRating: evaluation.feasibilityRating,
      feasibilityFeedback: evaluation.feasibilityFeedback
    });
  };

  // Dynamic Duration Months change
  const handleUpdateDurationMonths = (newMonths: number) => {
    if (!roadmap) return;
    setDurationMonths(newMonths);
    const evaluation = evaluateGraphState(roadmap.nodes, roadmap.weeklyStudyHours, newMonths);
    setRoadmap({
      ...roadmap,
      targetDurationMonths: newMonths,
      feasibilityRating: evaluation.feasibilityRating,
      feasibilityFeedback: evaluation.feasibilityFeedback
    });
  };

  // Toggle existing skill chip
  const toggleExistingSkill = (skill: string) => {
    setExistingSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  // Export JSON
  const handleExportJSON = () => {
    if (!roadmap) return;
    const blob = new Blob([JSON.stringify(roadmap, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pathcraft-roadmap-${roadmap.targetRole.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate current graph stats
  const graphStats = React.useMemo(() => {
    if (!roadmap) {
      return { completedCount: 0, totalCount: 0, progressPercentage: 0, remainingHours: 0 };
    }
    const evaluation = evaluateGraphState(roadmap.nodes, roadmap.weeklyStudyHours, roadmap.targetDurationMonths);
    return {
      completedCount: evaluation.completedCount,
      totalCount: roadmap.nodes.length,
      progressPercentage: evaluation.progressPercentage,
      remainingHours: evaluation.remainingHours
    };
  }, [roadmap]);

  return (
    <div className="flex h-screen flex-col bg-[#0B0F19] text-slate-100 overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-800 bg-[#0F172A]/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-white">
                PathCraft <span className="text-cyan-400">AI</span>
              </span>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                Career Roadmapper
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-400">
              Reverse-Engineered Career Intelligence
            </p>
          </div>
        </div>

        {/* Current Target Role Pill */}
        {roadmap && (
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3.5 py-1 text-xs">
            <span className="text-slate-400">Target Role:</span>
            <span className="font-semibold text-cyan-300 line-clamp-1 max-w-xs">
              {roadmap.targetRole}
            </span>
          </div>
        )}

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-2.5">
          {roadmap && (
            <>
              <button
                onClick={() => setIsCompareOpen(true)}
                className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:text-white transition"
              >
                <GitCompare className="h-3.5 w-3.5 text-cyan-400" />
                Compare
              </button>

              <button
                onClick={handleExportJSON}
                className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:text-white transition"
              >
                <Download className="h-3.5 w-3.5 text-purple-400" />
                Export
              </button>
            </>
          )}

          <button
            onClick={() => setShowConfigDrawer(!showConfigDrawer)}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md hover:from-cyan-500 hover:to-cyan-400 transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {roadmap ? "New Roadmap" : "Create Roadmap"}
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="relative flex flex-1 flex-col overflow-hidden p-4">
        {roadmap ? (
          <div className="flex h-full flex-col gap-3">
            {/* Controls & Constraint Bar */}
            <RoadmapControls
              weeklyHours={roadmap.weeklyStudyHours}
              durationMonths={roadmap.targetDurationMonths}
              remainingHours={graphStats.remainingHours}
              progressPercentage={graphStats.progressPercentage}
              completedCount={graphStats.completedCount}
              totalCount={graphStats.totalCount}
              feasibilityRating={roadmap.feasibilityRating}
              feasibilityFeedback={roadmap.feasibilityFeedback}
              onUpdateWeeklyHours={handleUpdateWeeklyHours}
              onUpdateDurationMonths={handleUpdateDurationMonths}
              onOpenCompare={() => setIsCompareOpen(true)}
              onExportPNG={handleExportJSON}
            />

            {/* Interactive React Flow Canvas */}
            <div className="flex-1">
              <RoadmapCanvas
                roadmap={roadmap}
                onSelectMilestone={(milestone) => setSelectedMilestone(milestone)}
              />
            </div>
          </div>
        ) : (
          /* Empty / Onboarding State */
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0F172A]/90 p-8 shadow-2xl backdrop-blur-xl">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  <Compass className="h-7 w-7" />
                </div>
                <h1 className="mt-4 text-2xl font-black text-white sm:text-3xl">
                  Reverse-Engineer Your Dream Role
                </h1>
                <p className="mx-auto mt-2 max-w-lg text-xs sm:text-sm text-slate-400">
                  Transform any hyper-specific career goal into an interactive, game-inspired skill tree with customized mini-projects, GitHub blueprints, and interview challenges.
                </p>
              </div>

              {/* Onboarding Form */}
              <form onSubmit={handleGenerate} className="mt-8 space-y-5">
                {/* Dream Role Input */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Target Dream Role & Industry
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Full Stack Developer at a Climate-Tech Startup"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>

                  {/* Suggestions */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {SAMPLE_SUGGESTIONS.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTargetRole(suggestion)}
                        className="rounded-full border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-[11px] text-slate-400 hover:border-cyan-500/40 hover:text-cyan-300 transition"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Constraints: Weekly Hours & Timeline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-slate-300">
                        <Clock className="h-3.5 w-3.5 text-cyan-400" />
                        Weekly Study Hours:
                      </span>
                      <span className="font-bold text-cyan-300 font-mono">{weeklyHours}h / week</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={45}
                      step={5}
                      value={weeklyHours}
                      onChange={(e) => setWeeklyHours(Number(e.target.value))}
                      className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-slate-300">
                        <Calendar className="h-3.5 w-3.5 text-purple-400" />
                        Target Timeline:
                      </span>
                      <span className="font-bold text-purple-300 font-mono">{durationMonths} months</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={24}
                      step={1}
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(Number(e.target.value))}
                      className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-purple-400"
                    />
                  </div>
                </div>

                {/* Existing Skills Selection */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Skills You Already Know (Pre-unlocks dependent nodes):
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {COMMON_SKILL_OPTIONS.map((skill, idx) => {
                      const isSelected = existingSkills.includes(skill);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleExistingSkill(skill)}
                          className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-950/40 text-emerald-300"
                              : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={loading || !targetRole.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-950/50 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 transition"
                >
                  <Brain className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  {loading ? loadingMessage : "Generate Reverse-Engineered Career Roadmap"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Slide-out Generator Drawer (When user wants to create a new roadmap while viewing existing) */}
      {showConfigDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md border-l border-slate-800 bg-[#0F172A] p-6 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Generate New Career Path</h3>
              <button
                onClick={() => setShowConfigDrawer(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerate} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">
                  Target Dream Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Weekly Study Hours:</span>
                  <span className="font-mono text-cyan-300">{weeklyHours}h</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={45}
                  step={5}
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="mt-1 w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Target Duration:</span>
                  <span className="font-mono text-purple-300">{durationMonths} mos</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={24}
                  step={1}
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  className="mt-1 w-full accent-purple-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-cyan-600 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Roadmap"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Contextual Milestone Inspector Drawer */}
      <MilestoneInspector
        milestone={selectedMilestone}
        targetRole={roadmap?.targetRole || targetRole}
        onClose={() => setSelectedMilestone(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Dual Path Comparison Modal */}
      <PathComparisonModal
        currentRole={roadmap?.targetRole || targetRole}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />
    </div>
  );
}
