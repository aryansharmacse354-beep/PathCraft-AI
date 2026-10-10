"use client";

import React, { useState } from "react";
import { Milestone, MilestoneStatus, MilestoneGuidance, LearningResource } from "../../lib/types/roadmap";
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
  Target,
  BookOpen,
  GraduationCap,
  Globe
} from "lucide-react";

interface MilestoneInspectorProps {
  milestone: Milestone | null;
  targetRole: string;
  onClose: () => void;
  onUpdateStatus: (milestoneId: string, newStatus: MilestoneStatus) => void;
}

function resolveLearningResources(milestone: Milestone, targetRole: string): LearningResource[] {
  // If the milestone already contains valid learning resources from the AI engine, use them
  if (milestone.actionableDetails?.learningResources && milestone.actionableDetails.learningResources.length > 0) {
    return milestone.actionableDetails.learningResources;
  }

  const roleText = (
    targetRole + " " +
    milestone.title + " " +
    (milestone.actionableDetails?.keySkillsToMaster || []).join(" ")
  ).toLowerCase();

  // 1. Healthcare / Medicine / Nursing / Clinical
  if (/health|nurse|doctor|med|clinic|pharma|bio|patient|hospital|physician|therapy|anatom/i.test(roleText)) {
    return [
      {
        title: "World Health Organization (WHO) — Clinical Guidelines & Global Standards",
        url: "https://www.who.int",
        type: "Official Standards & Regulators"
      },
      {
        title: "CDC — Disease Control, Prevention Protocols & Infection Safety",
        url: "https://www.cdc.gov",
        type: "Official Standards & Regulators"
      },
      {
        title: "National Council of State Boards of Nursing (NCSBN) — NCLEX & Regulatory Standards",
        url: "https://www.ncsbn.org",
        type: "Official Standards & Regulators"
      },
      {
        title: "Khan Academy Health & Medicine — Core Anatomy, Physiology & Pathology",
        url: "https://www.khanacademy.org/science/health-and-medicine",
        type: "Accredited Course & Curriculum"
      },
      {
        title: "National Library of Medicine (PubMed) — Peer-Reviewed Clinical Evidence",
        url: "https://pubmed.ncbi.nlm.nih.gov",
        type: "Textbook & Research Papers"
      }
    ];
  }

  // 2. Law / Legal / Paralegal / Compliance / Policy
  if (/law|legal|attorney|bar|counsel|paralegal|compliance|judge|court|statute|jur/i.test(roleText)) {
    return [
      {
        title: "Legal Information Institute (LII) at Cornell Law — Federal Statutes & Regulations",
        url: "https://www.law.cornell.edu",
        type: "Official Standards & Regulators"
      },
      {
        title: "American Bar Association (ABA) — Model Rules of Professional Conduct",
        url: "https://www.americanbar.org",
        type: "Official Standards & Regulators"
      },
      {
        title: "United States Courts — Federal Court Rules & Case Records",
        url: "https://www.uscourts.gov",
        type: "Official Standards & Regulators"
      },
      {
        title: "Oyez Project — U.S. Supreme Court Oral Arguments & Case Database",
        url: "https://www.oyez.org",
        type: "Accredited Course & Curriculum"
      },
      {
        title: "Harvard Law School — Case Studies & Jurisprudence Research",
        url: "https://casestudies.law.harvard.edu",
        type: "Textbook & Research Papers"
      }
    ];
  }

  // 3. Education / Teaching / Academia / Pedagogy
  if (/teach|educat|school|curriculum|pedagog|professor|academic|instructor/i.test(roleText)) {
    return [
      {
        title: "U.S. Department of Education — National Education Standards & Policies",
        url: "https://www.ed.gov",
        type: "Official Standards & Regulators"
      },
      {
        title: "Edutopia — Evidence-Based Teaching Practices & Classroom Strategies",
        url: "https://www.edutopia.org",
        type: "Accredited Course & Curriculum"
      },
      {
        title: "National Education Association (NEA) — Professional Teaching Resources",
        url: "https://www.nea.org",
        type: "Official Standards & Regulators"
      },
      {
        title: "MIT OpenCourseWare — Higher Education & Pedagogical Resources",
        url: "https://ocw.mit.edu",
        type: "Accredited Course & Curriculum"
      }
    ];
  }

  // 4. Finance / Accounting / Economics / Banking / CFA / CPA
  if (/finan|account|cpa|cfa|audit|bank|tax|valuat|invest|econom|actuar/i.test(roleText)) {
    return [
      {
        title: "CFA Institute — Global Professional Standards & Code of Ethics",
        url: "https://www.cfainstitute.org",
        type: "Official Standards & Regulators"
      },
      {
        title: "Financial Accounting Standards Board (FASB) — US GAAP Accounting Standards",
        url: "https://www.fasb.org",
        type: "Official Standards & Regulators"
      },
      {
        title: "U.S. SEC EDGAR — Corporate Filings & Public Financial Disclosure Reports",
        url: "https://www.sec.gov",
        type: "Official Standards & Regulators"
      },
      {
        title: "Investopedia — Professional Financial Modeling, Valuation & Concepts",
        url: "https://www.investopedia.com",
        type: "Accredited Course & Curriculum"
      },
      {
        title: "MIT OpenCourseWare — Finance Theory & Quantitative Economics",
        url: "https://ocw.mit.edu",
        type: "Accredited Course & Curriculum"
      }
    ];
  }

  // 5. Aerospace & Mechanical Engineering
  if (/aero|space|flight|propulsion|mechanic|thermo|aircraft|robot/i.test(roleText)) {
    return [
      {
        title: "NASA Technical Reports Server (NTRS) — Aerospace Standards & Research",
        url: "https://ntrs.nasa.gov",
        type: "Official Standards & Regulators"
      },
      {
        title: "American Society of Mechanical Engineers (ASME) — Codes & Standards",
        url: "https://www.asme.org",
        type: "Official Standards & Regulators"
      },
      {
        title: "Federal Aviation Administration (FAA) — Handbooks & Regulations",
        url: "https://www.faa.gov",
        type: "Official Standards & Regulators"
      },
      {
        title: "MIT OpenCourseWare — Aeronautics, Astronautics & Mechanics",
        url: "https://ocw.mit.edu/courses/aeronautics-and-astronautics",
        type: "Accredited Course & Curriculum"
      }
    ];
  }

  // 6. Civil Engineering & Architecture
  if (/civil|structur|build|architect|concrete|cad|survey|geotech/i.test(roleText)) {
    return [
      {
        title: "American Society of Civil Engineers (ASCE) — Civil Engineering Standards",
        url: "https://www.asce.org",
        type: "Official Standards & Regulators"
      },
      {
        title: "American Institute of Architects (AIA) — Architectural Guidelines & Practice",
        url: "https://www.aia.org",
        type: "Official Standards & Regulators"
      },
      {
        title: "National Institute of Building Sciences (NIBS) — Whole Building Design Guide",
        url: "https://www.nibs.org",
        type: "Official Standards & Regulators"
      },
      {
        title: "MIT OpenCourseWare — Civil and Environmental Engineering",
        url: "https://ocw.mit.edu/courses/civil-and-environmental-engineering",
        type: "Accredited Course & Curriculum"
      }
    ];
  }

  // 7. Design / UI / UX / Graphic Arts
  if (/design|ui|ux|graphic|visual|brand|typograph|illustrat|animat/i.test(roleText)) {
    return [
      {
        title: "AIGA — Professional Association for Design Standards & Ethics",
        url: "https://www.aiga.org",
        type: "Official Standards & Regulators"
      },
      {
        title: "Nielsen Norman Group — Evidence-Based UX Research & Usability Guidelines",
        url: "https://www.nngroup.com",
        type: "Official Standards & Regulators"
      },
      {
        title: "W3C Web Accessibility Initiative (WAI) — WCAG 2.2 Guidelines",
        url: "https://www.w3.org/WAI/standards-guidelines/wcag",
        type: "Official Standards & Regulators"
      },
      {
        title: "Interaction Design Foundation — Certified Design Curriculum & Masterclasses",
        url: "https://www.interaction-design.org",
        type: "Accredited Course & Curriculum"
      }
    ];
  }

  // 8. Culinary Arts & Hospitality
  if (/chef|culinary|cook|kitchen|food|pastry|hospitality|restaurant/i.test(roleText)) {
    return [
      {
        title: "American Culinary Federation (ACF) — Professional Certification Standards",
        url: "https://www.acfchefs.org",
        type: "Official Standards & Regulators"
      },
      {
        title: "ServSafe — National Restaurant Association Food Safety Standards",
        url: "https://www.servsafe.com",
        type: "Official Standards & Regulators"
      },
      {
        title: "U.S. FDA Food Code — Commercial Sanitation & Food Safety Regulations",
        url: "https://www.fda.gov/food/retail-food-industry/fda-food-code",
        type: "Official Standards & Regulators"
      },
      {
        title: "Culinary Institute of America (CIA) — Professional Kitchen Knowledge Library",
        url: "https://www.ciachef.edu",
        type: "Accredited Course & Curriculum"
      }
    ];
  }

  // 9. Skilled Trades / Electrical / HVAC / Plumbing
  if (/electric|plumb|hvac|weld|carpenter|trade|mechanic|pipe|wire/i.test(roleText)) {
    return [
      {
        title: "OSHA — Occupational Safety and Health Administration Regulations",
        url: "https://www.osha.gov",
        type: "Official Standards & Regulators"
      },
      {
        title: "National Fire Protection Association (NFPA / NEC) — National Electrical Code",
        url: "https://www.nfpa.org",
        type: "Official Standards & Regulators"
      },
      {
        title: "National Center for Construction Education & Research (NCCER)",
        url: "https://www.nccer.org",
        type: "Official Standards & Regulators"
      },
      {
        title: "Khan Academy — Physics & Electrical Fundamentals",
        url: "https://www.khanacademy.org/science/physics",
        type: "Accredited Course & Curriculum"
      }
    ];
  }

  // 10. Business / Management / Consulting / Marketing
  if (/business|manage|consult|market|product|execut|strategy|operat/i.test(roleText)) {
    return [
      {
        title: "Project Management Institute (PMI) — PMBOK Guide & Certification Framework",
        url: "https://www.pmi.org",
        type: "Official Standards & Regulators"
      },
      {
        title: "Harvard Business Review (HBR) — Strategic Leadership & Operations Research",
        url: "https://hbr.org",
        type: "Textbook & Research Papers"
      },
      {
        title: "MIT Sloan Management — OpenCourseWare Curriculum",
        url: "https://ocw.mit.edu",
        type: "Accredited Course & Curriculum"
      },
      {
        title: "International Organization for Standardization (ISO) — Quality Management",
        url: "https://www.iso.org",
        type: "Official Standards & Regulators"
      }
    ];
  }

  // 11. Technology / Software / AI / Cyber / Data Science (Default)
  return [
    {
      title: "MDN Web Docs — Official Web Technologies & Web Standards Documentation",
      url: "https://developer.mozilla.org",
      type: "Official Standards & Regulators"
    },
    {
      title: "W3C — World Wide Web Consortium Open Technical Standards",
      url: "https://www.w3.org",
      type: "Official Standards & Regulators"
    },
    {
      title: "MIT OpenCourseWare — Computer Science & Electrical Engineering",
      url: "https://ocw.mit.edu",
      type: "Accredited Course & Curriculum"
    },
    {
      title: "NIST Cybersecurity Framework — National Standards & Protocols",
      url: "https://www.nist.gov/cyberframework",
      type: "Official Standards & Regulators"
    },
    {
      title: "Khan Academy — Computing & Algorithms Coursework",
      url: "https://www.khanacademy.org/computing",
      type: "Accredited Course & Curriculum"
    }
  ];
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

  const displayResources = resolveLearningResources(milestone, targetRole);

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

        {/* Official Documentation & Verified Learning Portals */}
        <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
              <BookOpen className="h-4 w-4 text-blue-400" />
              Official Documentation & Learning Portals
            </div>
            <span className="rounded bg-blue-900/60 px-1.5 py-0.5 text-[10px] font-medium text-cyan-300">
              Verified
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-300 leading-relaxed">
            Authoritative regulatory bodies, official standards, and accredited learning platforms:
          </p>
          <div className="mt-3 space-y-2">
            {displayResources.map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start justify-between rounded-lg border border-blue-500/20 bg-slate-900/90 p-2.5 text-xs text-slate-200 hover:border-blue-400 hover:bg-blue-950/50 hover:text-white transition"
              >
                <div className="flex items-start gap-2.5 overflow-hidden pr-2">
                  {res.type === "Official Standards & Regulators" ? (
                    <Globe className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0 group-hover:text-cyan-300" />
                  ) : (
                    <GraduationCap className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0 group-hover:text-blue-300" />
                  )}
                  <div className="overflow-hidden">
                    <span className="font-semibold text-xs text-slate-200 group-hover:text-blue-200 block truncate">
                      {res.title}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate mt-0.5 font-mono">
                      {res.url.replace(/^https?:\/\//, "")}
                    </span>
                    <span className="mt-1 inline-block rounded bg-slate-800/90 px-1.5 py-0.5 text-[9px] font-medium text-cyan-300">
                      {res.type}
                    </span>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-blue-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
              </a>
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
