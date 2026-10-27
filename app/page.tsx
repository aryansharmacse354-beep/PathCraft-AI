"use client";

import React, { useState, useEffect } from "react";
import { RoadmapData, Milestone, MilestoneStatus } from "../lib/types/roadmap";
import { RoadmapCanvas } from "../components/roadmap/RoadmapCanvas";
import { RoadmapControls } from "../components/roadmap/RoadmapControls";
import { MilestoneInspector } from "../components/roadmap/MilestoneInspector";
import { PathComparisonModal } from "../components/comparison/PathComparisonModal";
import { evaluateGraphState, rescaleRoadmapToConstraints } from "../lib/utils/graphEngine";
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
  ChevronRight,
  Plus,
  X,
  Trash2
} from "lucide-react";

const SAMPLE_SUGGESTIONS = [
  "Pediatric Nurse Practitioner in Critical Care",
  "Corporate M&A Lawyer & Regulatory Counsel",
  "High School STEM Teacher & Curriculum Specialist",
  "Aerospace Propulsion Engineer for Satellite Launchers",
  "Chartered Financial Analyst (CFA) in Asset Management",
  "Executive Sous Chef specializing in Contemporary Cuisine",
  "Brand & Visual Identity Designer",
  "Full Stack Developer at a Climate-Tech Startup"
];

/**
 * Dynamically provides smart, role-adaptive suggestions tailored to the user's dream profession
 */
function getRoleSkillSuggestions(role: string): string[] {
  const r = role.toLowerCase();
  if (/health|nurse|doctor|medic|clinic|pharma|bio|patient|hospital|physician|therapy|care/i.test(r)) {
    return [
      "Patient Assessment",
      "Vital Signs Monitoring",
      "Pharmacology & Med Admin",
      "BLS / CPR Certified",
      "Clinical Documentation & EHR",
      "Infection Control & Safety",
      "Anatomy & Physiology"
    ];
  }
  if (/law|legal|attorney|bar|counsel|paralegal|compliance|judge|court|statute|litigat/i.test(r)) {
    return [
      "Legal Research & Citation",
      "Contract Drafting & Review",
      "Brief & Memo Writing",
      "Statutory Interpretation",
      "Regulatory Compliance",
      "Client Counseling",
      "Case Law Analysis"
    ];
  }
  if (/teach|educat|school|curriculum|pedagog|professor|academic|instructor/i.test(r)) {
    return [
      "Lesson Planning & Scaffolding",
      "Curriculum Development",
      "Classroom Management",
      "Formative Assessment",
      "Differentiated Instruction",
      "EdTech Platforms",
      "Student Mentorship"
    ];
  }
  if (/financ|account|cfa|cpa|audit|bank|invest|actuar|tax|valuat|equity|portfolio/i.test(r)) {
    return [
      "Financial Modeling & Forecasting",
      "Excel & Advanced Formulas",
      "Balance Sheet & Cash Flow",
      "Valuation (DCF / Comps)",
      "GAAP / IFRS Accounting",
      "Risk Assessment",
      "Data Analysis & Reporting"
    ];
  }
  if (/aero|space|propuls|flight|aircraft|satellite|astron/i.test(r)) {
    return [
      "CAD & 3D Modeling (SolidWorks)",
      "Thermodynamics & Heat Transfer",
      "Aerodynamics & Fluids",
      "Finite Element Analysis (FEA)",
      "MATLAB & Simulation",
      "Systems Engineering"
    ];
  }
  if (/civil|structur|construct|geotech|bridge|building/i.test(r)) {
    return [
      "Structural Mechanics",
      "AutoCAD / Revit Modeling",
      "Building Codes & Safety",
      "Site Surveying & Soil Mechanics",
      "Concrete & Steel Design",
      "Project Estimation & Scheduling"
    ];
  }
  if (/mechanic|robot|automot|manufacturing|machin/i.test(r)) {
    return [
      "CAD / Parametric Modeling",
      "Kinematics & Dynamics",
      "Manufacturing & CNC",
      "Materials Science",
      "PLC Programming & Sensors",
      "Quality Assurance & Metrology"
    ];
  }
  if (/design|graphic|illustrat|visual|brand|ui|ux|animat|creative|product designer/i.test(r)) {
    return [
      "Figma / Wireframing & Prototyping",
      "Adobe Creative Cloud (PS, AI)",
      "Typography & Visual Hierarchy",
      "Design Systems & Components",
      "User Research & Testing",
      "Color Theory & Composition"
    ];
  }
  if (/chef|culinary|cook|baker|pastry|kitchen|restaurant|sommelier|food/i.test(r)) {
    return [
      "Knife Skills & Classical Cuts",
      "Food Safety & Sanitation (HACCP)",
      "Menu Engineering & Costing",
      "Kitchen Station Operations",
      "Flavor Profiling & Seasoning",
      "Inventory Management & Sourcing"
    ];
  }
  if (/electrician|plumb|welder|hvac|trades/i.test(r)) {
    return [
      "Blueprint & Schematic Reading",
      "Circuit Testing & Multimeters",
      "National Electrical Code (NEC)",
      "Safety Protocols & OSHA",
      "Hand & Power Tool Mastery",
      "Troubleshooting & Diagnostics"
    ];
  }
  if (/software|developer|engineer|coder|programmer|full stack|backend|frontend|data engineer|devops/i.test(r)) {
    return [
      "JavaScript / TypeScript",
      "Python / Scripting",
      "Git & Version Control",
      "SQL & Relational Databases",
      "RESTful APIs & Networking",
      "Frontend Frameworks (React/Next)",
      "Data Structures & Algorithms"
    ];
  }
  if (/ai|machine learning|deep learning|data scientist|nlp/i.test(r)) {
    return [
      "Python & Numerical Computing",
      "Machine Learning Algorithms",
      "PyTorch / TensorFlow",
      "Data Cleaning & Feature Engineering",
      "Linear Algebra & Statistics",
      "Prompt Engineering & LLMs"
    ];
  }
  return [
    "Project Management",
    "Data & Statistical Analysis",
    "Technical Writing & Documentation",
    "Public Speaking & Presentation",
    "Stakeholder Communication",
    "Spreadsheet Modeling (Excel)",
    "Research & Critical Analysis"
  ];
}

export default function Home() {
  const [targetRole, setTargetRole] = useState("Pediatric Nurse Practitioner in Critical Care");
  const [weeklyHours, setWeeklyHours] = useState(15);
  const [durationMonths, setDurationMonths] = useState(6);
  const [existingSkills, setExistingSkills] = useState<string[]>(["Patient Assessment", "BLS / CPR Certified"]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [drawerSkillInput, setDrawerSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [viewMode, setViewMode] = useState<"landing" | "graph">("landing");

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pathcraft_roadmap");
      if (saved) {
        const parsed: RoadmapData = JSON.parse(saved);
        setRoadmap(parsed);
        if (parsed.targetRole) setTargetRole(parsed.targetRole);
        if (parsed.weeklyStudyHours) setWeeklyHours(parsed.weeklyStudyHours);
        if (parsed.targetDurationMonths) setDurationMonths(parsed.targetDurationMonths);
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

  // Dynamic Skill Management Handlers
  const handleAddCustomSkill = (skillToAdd?: string) => {
    const val = (skillToAdd !== undefined ? skillToAdd : customSkillInput).trim();
    if (!val) return;
    const exists = existingSkills.some(
      (s) => s.toLowerCase() === val.toLowerCase()
    );
    if (!exists) {
      setExistingSkills((prev) => [...prev, val]);
    }
    setCustomSkillInput("");
  };

  const handleAddDrawerSkill = (skillToAdd?: string) => {
    const val = (skillToAdd !== undefined ? skillToAdd : drawerSkillInput).trim();
    if (!val) return;
    const exists = existingSkills.some(
      (s) => s.toLowerCase() === val.toLowerCase()
    );
    if (!exists) {
      setExistingSkills((prev) => [...prev, val]);
    }
    setDrawerSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setExistingSkills((prev) =>
      prev.filter((s) => s.toLowerCase() !== skillToRemove.toLowerCase())
    );
  };

  const handleClearAllSkills = () => {
    setExistingSkills([]);
  };

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
      setViewMode("graph");
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

  // Dynamic Weekly Hours change - rescales milestone hours and graph feasibility
  const handleUpdateWeeklyHours = (newHours: number) => {
    if (!roadmap) return;
    setWeeklyHours(newHours);
    const updated = rescaleRoadmapToConstraints(roadmap, newHours, roadmap.targetDurationMonths);
    setRoadmap(updated);
  };

  // Dynamic Duration Months change - rescales milestone hours and graph feasibility
  const handleUpdateDurationMonths = (newMonths: number) => {
    if (!roadmap) return;
    setDurationMonths(newMonths);
    const updated = rescaleRoadmapToConstraints(roadmap, roadmap.weeklyStudyHours, newMonths);
    setRoadmap(updated);
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
      return { completedCount: 0, totalCount: 0, inProgressCount: 0, progressPercentage: 0, remainingHours: 0 };
    }
    const evaluation = evaluateGraphState(roadmap.nodes, roadmap.weeklyStudyHours, roadmap.targetDurationMonths);
    return {
      completedCount: evaluation.completedCount,
      totalCount: roadmap.nodes.length,
      inProgressCount: evaluation.inProgressCount,
      progressPercentage: evaluation.progressPercentage,
      remainingHours: evaluation.remainingHours
    };
  }, [roadmap]);

  return (
    <div className="flex min-h-[100dvh] h-[100dvh] w-full flex-col bg-[#0B0F19] text-slate-100 overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="flex h-14 sm:h-16 flex-shrink-0 items-center justify-between border-b border-slate-800 bg-[#0F172A]/90 px-3 sm:px-6 backdrop-blur-md z-30">
        <div
          onClick={() => setViewMode("landing")}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
          title="Return to Home / Career Generator"
        >
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-105 transition flex-shrink-0">
            <Compass className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-white group-hover:text-cyan-300 transition">
                PathCraft <span className="text-cyan-400">AI</span>
              </span>
              <span className="hidden xs:inline rounded-full border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-cyan-300">
                Career Roadmapper
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400">
              Reverse-Engineered Career Intelligence
            </p>
          </div>
        </div>

        {/* Current Target Role Pill */}
        {roadmap && (
          <div className="hidden xl:flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3.5 py-1 text-xs">
            <span className="text-slate-400">Target Role:</span>
            <span className="font-semibold text-cyan-300 line-clamp-1 max-w-xs">
              {roadmap.targetRole}
            </span>
          </div>
        )}

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {roadmap && (
            <>
              {viewMode === "landing" ? (
                <button
                  onClick={() => setViewMode("graph")}
                  className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:border-cyan-400 hover:bg-cyan-900/60 hover:text-white transition shadow-sm"
                >
                  <Layers className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">View Active Roadmap</span>
                  <span className="sm:hidden">Roadmap</span>
                </button>
              ) : (
                <button
                  onClick={() => setViewMode("landing")}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:text-white transition shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">New Career / Edit</span>
                  <span className="sm:hidden">New</span>
                </button>
              )}

              <button
                onClick={() => setIsCompareOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2 sm:px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:text-white transition shadow-sm"
                title="Compare side-by-side with another career path"
              >
                <GitCompare className="h-3.5 w-3.5 text-cyan-400" />
                <span className="hidden md:inline">Compare</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2 sm:px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:text-white transition shadow-sm"
                title="Export roadmap to JSON"
              >
                <Download className="h-3.5 w-3.5 text-purple-400" />
                <span className="hidden md:inline">Export</span>
              </button>
            </>
          )}

          {!roadmap && (
            <button
              onClick={() => handleGenerate()}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white shadow-md hover:from-cyan-500 hover:to-cyan-400 transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Create Roadmap</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="relative flex flex-1 flex-col overflow-hidden p-2 sm:p-3 md:p-4">
        {roadmap && viewMode === "graph" ? (
          <div className="flex h-full flex-col gap-2 sm:gap-3">
            {/* Controls & Constraint Bar */}
            <RoadmapControls
              weeklyHours={roadmap.weeklyStudyHours}
              durationMonths={roadmap.targetDurationMonths}
              remainingHours={graphStats.remainingHours}
              progressPercentage={graphStats.progressPercentage}
              completedCount={graphStats.completedCount}
              totalCount={graphStats.totalCount}
              inProgressCount={graphStats.inProgressCount}
              feasibilityRating={roadmap.feasibilityRating}
              feasibilityFeedback={roadmap.feasibilityFeedback}
              onUpdateWeeklyHours={handleUpdateWeeklyHours}
              onUpdateDurationMonths={handleUpdateDurationMonths}
              onOpenCompare={() => setIsCompareOpen(true)}
              onExportPNG={handleExportJSON}
              onRegenerateAI={() => handleGenerate()}
              isRegenerating={loading}
            />

            {/* Interactive React Flow Canvas */}
            <div className="flex-1 min-h-0">
              <RoadmapCanvas
                roadmap={roadmap}
                onSelectMilestone={(milestone) => setSelectedMilestone(milestone)}
              />
            </div>
          </div>
        ) : (
          /* First Interface / Onboarding & Career Customization State */
          <div className="flex flex-1 items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0F172A]/90 p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-xl my-auto">
              {/* Active Roadmap Quick-Resume Banner if available */}
              {roadmap && (
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-cyan-500/30 bg-cyan-950/40 p-3 sm:p-3.5 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 flex-shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        Active Roadmap: <span className="text-cyan-300">{roadmap.targetRole}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                        <span>
                          {graphStats.completedCount} of {graphStats.totalCount} milestones completed ({graphStats.progressPercentage}%)
                        </span>
                        {graphStats.inProgressCount > 0 && (
                          <span className="flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-amber-300 border border-amber-500/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                            {graphStats.inProgressCount} in progress
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewMode("graph")}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition flex-shrink-0"
                  >
                    <span>Resume Roadmap</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  <Compass className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h1 className="mt-3 sm:mt-4 text-xl sm:text-2xl md:text-3xl font-black text-white">
                  Reverse-Engineer Your Dream Role
                </h1>
                <p className="mx-auto mt-2 max-w-lg text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Transform any profession across healthcare, law, engineering, education, finance, creative arts, trades, or tech into an interactive, dependency-aware career roadmap.
                </p>
              </div>

              {/* Onboarding Form */}
              <form onSubmit={handleGenerate} className="mt-6 sm:mt-8 space-y-4 sm:space-y-5">
                {/* Dream Role Input */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Target Dream Role & Profession
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Registered Nurse in Critical Care, Corporate M&A Lawyer, High School Teacher..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 sm:p-3.5">
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

                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 sm:p-3.5">
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

                {/* Dynamic Manual Skills Input Section */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 sm:p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <span>Skills You Already Know</span>
                      {existingSkills.length > 0 && (
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                          {existingSkills.length} added
                        </span>
                      )}
                    </label>
                    {existingSkills.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllSkills}
                        className="text-[11px] text-slate-400 hover:text-rose-400 transition"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">
                    Manually add any prior skills, tools, or certifications you know. PathCraft marks them as known and automatically unlocks dependent advanced milestones.
                  </p>

                  {/* Manual Skill Input & Add Button */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomSkill();
                        }
                      }}
                      placeholder="Type a skill you know (e.g. CPR, Drafting, Excel, React) & press Enter"
                      className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCustomSkill()}
                      disabled={!customSkillInput.trim()}
                      className="flex items-center gap-1 rounded-xl bg-cyan-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-40 transition flex-shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Active Skill Tags with Delete (✕) */}
                  {existingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-emerald-500/30 bg-emerald-950/20 max-h-32 overflow-y-auto">
                      {existingSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-900/40 px-2 py-0.5 text-xs font-medium text-emerald-200"
                        >
                          <CheckCircle2 className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="rounded p-0.5 text-emerald-400 hover:bg-emerald-800/60 hover:text-white transition"
                            title={`Remove ${skill}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-800 p-2 text-center text-[11px] text-slate-500">
                      No prior skills added yet. Type your skills above or tap quick suggestions below.
                    </div>
                  )}

                  {/* Role-Adaptive Smart Quick Suggestions */}
                  <div className="pt-1">
                    <div className="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center justify-between">
                      <span>Quick suggestions for your domain:</span>
                      <span className="text-[10px] text-slate-500">Click to add/toggle</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {getRoleSkillSuggestions(targetRole).map((suggestion, idx) => {
                        const isAdded = existingSkills.some(
                          (s) => s.toLowerCase() === suggestion.toLowerCase()
                        );
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              if (isAdded) {
                                handleRemoveSkill(suggestion);
                              } else {
                                handleAddCustomSkill(suggestion);
                              }
                            }}
                            className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition ${
                              isAdded
                                ? "border-emerald-500/60 bg-emerald-950/60 text-emerald-300"
                                : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                            }`}
                          >
                            {isAdded ? (
                              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                            ) : (
                              <Plus className="h-2.5 w-2.5 text-slate-500" />
                            )}
                            {suggestion}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={loading || !targetRole.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-cyan-950/50 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 transition"
                >
                  <Brain className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  <span>{loading ? loadingMessage : "Generate Reverse-Engineered Career Roadmap"}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Slide-out Generator Drawer (When user wants to create a new roadmap while viewing existing) */}
      {showConfigDrawer && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowConfigDrawer(false);
          }}
        >
          <div className="w-full max-w-full sm:max-w-md border-l border-slate-800 bg-[#0F172A] p-4 sm:p-6 shadow-2xl overflow-y-auto h-[100dvh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Generate New Career Path</h3>
              <button
                onClick={() => setShowConfigDrawer(false)}
                className="p-1 rounded text-slate-400 hover:bg-slate-800 hover:text-white transition"
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
                  placeholder="e.g. Registered Nurse, Corporate Lawyer, Full Stack Developer..."
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Weekly Hours */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                    Weekly Study Hours:
                  </span>
                  <span className="font-mono font-bold text-cyan-300">{weeklyHours}h / week</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={5}
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="mt-2 w-full accent-cyan-400 cursor-pointer"
                />
                <div className="mt-2 flex gap-1.5">
                  {[10, 20, 30, 40].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setWeeklyHours(h)}
                      className={`flex-1 rounded py-1 text-[11px] font-mono font-medium transition ${
                        weeklyHours === h
                          ? "bg-cyan-500/30 border border-cyan-400 text-cyan-200"
                          : "bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Duration */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-purple-400" />
                    Target Timeline:
                  </span>
                  <span className="font-mono font-bold text-purple-300">{durationMonths} months</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={24}
                  step={1}
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  className="mt-2 w-full accent-purple-400 cursor-pointer"
                />
                <div className="mt-2 flex gap-1.5">
                  {[3, 6, 9, 12].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDurationMonths(m)}
                      className={`flex-1 rounded py-1 text-[11px] font-mono font-medium transition ${
                        durationMonths === m
                          ? "bg-purple-500/30 border border-purple-400 text-purple-200"
                          : "bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Study Capacity Indicator */}
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs">
                <span className="text-slate-400">Total Study Capacity:</span>
                <span className="font-mono font-bold text-cyan-300">
                  ~{Math.round(weeklyHours * 4.33 * durationMonths)} hours
                </span>
              </div>

              {/* Dynamic Manual Skills Selection inside Drawer */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Skills You Already Know</span>
                    {existingSkills.length > 0 && (
                      <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                        {existingSkills.length}
                      </span>
                    )}
                  </label>
                  {existingSkills.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllSkills}
                      className="text-[10px] text-slate-400 hover:text-rose-400 transition"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Input with Add */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={drawerSkillInput}
                    onChange={(e) => setDrawerSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddDrawerSkill();
                      }
                    }}
                    placeholder="Type a skill & press Enter"
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddDrawerSkill()}
                    disabled={!drawerSkillInput.trim()}
                    className="flex items-center gap-1 rounded-lg bg-cyan-500 px-2.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-40 transition"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Added tags */}
                {existingSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 p-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 max-h-24 overflow-y-auto">
                    {existingSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded border border-emerald-500/40 bg-emerald-900/40 px-1.5 py-0.5 text-[11px] font-medium text-emerald-200"
                      >
                        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-emerald-400 hover:text-white"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {getRoleSkillSuggestions(targetRole).map((suggestion, idx) => {
                    const isAdded = existingSkills.some(
                      (s) => s.toLowerCase() === suggestion.toLowerCase()
                    );
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (isAdded) {
                            handleRemoveSkill(suggestion);
                          } else {
                            handleAddDrawerSkill(suggestion);
                          }
                        }}
                        className={`flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium transition ${
                          isAdded
                            ? "border-emerald-500/60 bg-emerald-950/60 text-emerald-300"
                            : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                        }`}
                      >
                        {isAdded ? (
                          <CheckCircle2 className="h-2 w-2 text-emerald-400" />
                        ) : (
                          <Plus className="h-2 w-2 text-slate-500" />
                        )}
                        {suggestion}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !targetRole.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-950/50 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 transition"
              >
                <Brain className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                <span>{loading ? (loadingMessage || "Generating...") : "Generate Reverse-Engineered Roadmap"}</span>
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
