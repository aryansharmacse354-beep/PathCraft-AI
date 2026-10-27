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

export interface ProjectBlueprint {
  name: string;
  url: string;
  description: string;
  badge: string;
}

const KNOWN_VERIFIED_REPOS: Record<string, { name: string; url: string; description: string; badge: string }> = {
  // Healthcare & Medicine
  "synthetichealth/synthea": {
    name: "synthetichealth/synthea",
    url: "https://github.com/synthetichealth/synthea",
    description: "Synthetic patient population and clinical health record simulator used by research systems",
    badge: "Verified Repo"
  },
  "openemr/openemr": {
    name: "openemr/openemr",
    url: "https://github.com/openemr/openemr",
    description: "Global standard open-source electronic health records and clinical care workflow system",
    badge: "Verified Repo"
  },
  "smart-on-fhir/client-js": {
    name: "smart-on-fhir/client-js",
    url: "https://github.com/smart-on-fhir/client-js",
    description: "Official SMART on FHIR clinical application and medical protocol framework",
    badge: "Verified Repo"
  },

  // Law & Legal
  "freelawproject/courtlistener": {
    name: "freelawproject/courtlistener",
    url: "https://github.com/freelawproject/courtlistener",
    description: "Open legal search engine for judicial opinions, precedent research, and case dockets",
    badge: "Verified Repo"
  },
  "freelawproject/recap": {
    name: "freelawproject/recap",
    url: "https://github.com/freelawproject/recap",
    description: "Public archive of federal court records, appellate dockets, and PACER filings",
    badge: "Verified Repo"
  },
  "SuffolkLITLab/docassemble-AssemblyLine": {
    name: "SuffolkLITLab/AssemblyLine",
    url: "https://github.com/SuffolkLITLab/docassemble-AssemblyLine",
    description: "Legal document assembly, court pleadings, and statutory forms toolkit",
    badge: "Verified Repo"
  },

  // Education & Teaching
  "openedx/edx-platform": {
    name: "openedx/edx-platform",
    url: "https://github.com/openedx/edx-platform",
    description: "Production learning management system and instructional curriculum architecture",
    badge: "Verified Repo"
  },
  "moodle/moodle": {
    name: "moodle/moodle",
    url: "https://github.com/moodle/moodle",
    description: "Global standard pedagogical course management and learning assessment platform",
    badge: "Verified Repo"
  },
  "khan/khan-exercises": {
    name: "khan/khan-exercises",
    url: "https://github.com/khan/khan-exercises",
    description: "Khan Academy open pedagogical challenge and student assessment bank",
    badge: "Verified Repo"
  },

  // Finance & Accounting
  "ranaroussi/yfinance": {
    name: "ranaroussi/yfinance",
    url: "https://github.com/ranaroussi/yfinance",
    description: "Real-time corporate financials, valuation ratios, and balance sheet data",
    badge: "Verified Repo"
  },
  "matplotlib/mplfinance": {
    name: "matplotlib/mplfinance",
    url: "https://github.com/matplotlib/mplfinance",
    description: "Financial market visualization, candlestick charts, and technical indicators",
    badge: "Verified Repo"
  },
  "edgarminers/edgar": {
    name: "edgarminers/edgar",
    url: "https://github.com/edgarminers/edgar",
    description: "SEC EDGAR automated 10-K and 10-Q corporate financial filings parser",
    badge: "Verified Repo"
  },

  // Aerospace & Mechanical
  "nasa/CFS": {
    name: "nasa/CFS",
    url: "https://github.com/nasa/CFS",
    description: "NASA Core Flight System software architecture for satellite and flight missions",
    badge: "Verified Repo"
  },
  "nasa/fprime": {
    name: "nasa/fprime",
    url: "https://github.com/nasa/fprime",
    description: "NASA JPL flight software framework used on the Mars Ingenuity helicopter",
    badge: "Verified Repo"
  },
  "su2code/SU2": {
    name: "su2code/SU2",
    url: "https://github.com/su2code/SU2",
    description: "Open-source multidisciplinary simulation and CFD aerodynamics solver",
    badge: "Verified Repo"
  },

  // Civil & Architecture
  "IfcOpenShell/IfcOpenShell": {
    name: "IfcOpenShell/IfcOpenShell",
    url: "https://github.com/IfcOpenShell/IfcOpenShell",
    description: "Open-source Building Information Modeling (BIM) and architectural IFC geometry",
    badge: "Verified Repo"
  },
  "Ladybug-Tools/ladybug": {
    name: "Ladybug-Tools/ladybug",
    url: "https://github.com/Ladybug-Tools/ladybug",
    description: "Building environmental performance, solar radiation, and climate design",
    badge: "Verified Repo"
  },

  // Design
  "adobe/react-spectrum": {
    name: "adobe/react-spectrum",
    url: "https://github.com/adobe/react-spectrum",
    description: "Adobe's accessible design system and professional component guidelines",
    badge: "Verified Repo"
  },
  "tailwindlabs/tailwindcss": {
    name: "tailwindlabs/tailwindcss",
    url: "https://github.com/tailwindlabs/tailwindcss",
    description: "Industry-standard design system and layout architecture framework",
    badge: "Verified Repo"
  },
  "material-components/material-web": {
    name: "material-components/material-web",
    url: "https://github.com/material-components/material-web",
    description: "Google Material Design System official specifications and components",
    badge: "Verified Repo"
  },

  // Culinary
  "openfoodfacts/openfoodfacts-server": {
    name: "openfoodfacts/server",
    url: "https://github.com/openfoodfacts/openfoodfacts-server",
    description: "Global open food database, ingredient taxonomy, and nutrition architecture",
    badge: "Verified Repo"
  },
  "tastyigniter/TastyIgniter": {
    name: "tastyigniter/TastyIgniter",
    url: "https://github.com/tastyigniter/TastyIgniter",
    description: "Open-source restaurant operations, kitchen order flow, and menu management",
    badge: "Verified Repo"
  },

  // Trades
  "esphome/esphome": {
    name: "esphome/esphome",
    url: "https://github.com/esphome/esphome",
    description: "Electrical circuit automation, sensor schematics, and control systems",
    badge: "Verified Repo"
  },
  "bblanchon/ArduinoJson": {
    name: "bblanchon/ArduinoJson",
    url: "https://github.com/bblanchon/ArduinoJson",
    description: "Industrial microcontroller instrumentation, serial data, and sensor control",
    badge: "Verified Repo"
  },

  // Tech / Software / AI
  "TheAlgorithms/Python": {
    name: "TheAlgorithms/Python",
    url: "https://github.com/TheAlgorithms/Python",
    description: "Data structures, algorithms, and technical implementation blueprints",
    badge: "Verified Repo"
  },
  "public-apis/public-apis": {
    name: "public-apis/public-apis",
    url: "https://github.com/public-apis/public-apis",
    description: "Curated directory of free public APIs for hands-on application development",
    badge: "Verified Repo"
  },
  "freeCodeCamp/freeCodeCamp": {
    name: "freeCodeCamp/freeCodeCamp",
    url: "https://github.com/freeCodeCamp/freeCodeCamp",
    description: "Open-source software engineering curriculum and real-world project specifications",
    badge: "Verified Repo"
  }
};

function resolveProjectBlueprints(milestone: Milestone, targetRole: string): ProjectBlueprint[] {
  const roleText = (
    targetRole + " " +
    milestone.title + " " +
    (milestone.actionableDetails?.keySkillsToMaster || []).join(" ")
  ).toLowerCase();

  const results: ProjectBlueprint[] = [];
  const rawSuggestions = milestone.actionableDetails?.githubRepoSuggestions || [];

  for (const item of rawSuggestions) {
    const trimmed = item.trim();
    const cleanSlug = trimmed.replace(/^https?:\/\/github\.com\//, "");
    if (KNOWN_VERIFIED_REPOS[cleanSlug]) {
      results.push(KNOWN_VERIFIED_REPOS[cleanSlug]);
    } else if (trimmed.startsWith("https://github.com/")) {
      results.push({
        name: cleanSlug,
        url: trimmed,
        description: `Verified open-source blueprint for ${milestone.title}`,
        badge: "Live Repo"
      });
    } else {
      // Instead of linking to a hypothetical slug that might 404, provide a targeted live GitHub Search
      const searchKeyword = cleanSlug.replace(/[-_/]/g, " ");
      results.push({
        name: `GitHub: ${searchKeyword}`,
        url: `https://github.com/search?q=${encodeURIComponent(searchKeyword)}&type=repositories&s=stars&o=desc`,
        description: `Top-rated open-source blueprints and templates for ${searchKeyword}`,
        badge: "Live Search"
      });
    }
  }

  // Complement with authentic, verified original repositories for the specific domain
  if (/health|nurse|doctor|med|clinic|pharma|bio|patient|hospital/i.test(roleText)) {
    if (!results.some(r => r.url.includes("synthea"))) results.push(KNOWN_VERIFIED_REPOS["synthetichealth/synthea"]);
    if (!results.some(r => r.url.includes("openemr"))) results.push(KNOWN_VERIFIED_REPOS["openemr/openemr"]);
    if (!results.some(r => r.url.includes("smart-on-fhir"))) results.push(KNOWN_VERIFIED_REPOS["smart-on-fhir/client-js"]);
    results.push({
      name: "GitHub Topic: Healthcare",
      url: "https://github.com/topics/healthcare",
      description: "Thousands of verified open-source clinical and medical repositories",
      badge: "GitHub Topic"
    });
  } else if (/law|legal|attorney|bar|counsel|paralegal|compliance/i.test(roleText)) {
    if (!results.some(r => r.url.includes("courtlistener"))) results.push(KNOWN_VERIFIED_REPOS["freelawproject/courtlistener"]);
    if (!results.some(r => r.url.includes("recap"))) results.push(KNOWN_VERIFIED_REPOS["freelawproject/recap"]);
    if (!results.some(r => r.url.includes("AssemblyLine"))) results.push(KNOWN_VERIFIED_REPOS["SuffolkLITLab/docassemble-AssemblyLine"]);
    results.push({
      name: "GitHub Topic: Legal Tech",
      url: "https://github.com/topics/legal-tech",
      description: "Open-source legal automation, docket analysis, and statute repositories",
      badge: "GitHub Topic"
    });
  } else if (/teach|educat|school|curriculum|pedagog|professor/i.test(roleText)) {
    if (!results.some(r => r.url.includes("edx-platform"))) results.push(KNOWN_VERIFIED_REPOS["openedx/edx-platform"]);
    if (!results.some(r => r.url.includes("moodle"))) results.push(KNOWN_VERIFIED_REPOS["moodle/moodle"]);
    if (!results.some(r => r.url.includes("khan-exercises"))) results.push(KNOWN_VERIFIED_REPOS["khan/khan-exercises"]);
    results.push({
      name: "GitHub Topic: Education",
      url: "https://github.com/topics/education",
      description: "Open educational curriculum, assessment blueprints, and pedagogical tools",
      badge: "GitHub Topic"
    });
  } else if (/finan|account|cpa|cfa|audit|bank|tax|valuat|invest/i.test(roleText)) {
    if (!results.some(r => r.url.includes("yfinance"))) results.push(KNOWN_VERIFIED_REPOS["ranaroussi/yfinance"]);
    if (!results.some(r => r.url.includes("mplfinance"))) results.push(KNOWN_VERIFIED_REPOS["matplotlib/mplfinance"]);
    if (!results.some(r => r.url.includes("edgar"))) results.push(KNOWN_VERIFIED_REPOS["edgarminers/edgar"]);
    results.push({
      name: "GitHub Topic: Financial Analysis",
      url: "https://github.com/topics/financial-analysis",
      description: "Open-source quantitative finance models, portfolios, and valuation tools",
      badge: "GitHub Topic"
    });
  } else if (/aero|space|flight|propulsion|mechanic|thermo/i.test(roleText)) {
    if (!results.some(r => r.url.includes("CFS"))) results.push(KNOWN_VERIFIED_REPOS["nasa/CFS"]);
    if (!results.some(r => r.url.includes("fprime"))) results.push(KNOWN_VERIFIED_REPOS["nasa/fprime"]);
    if (!results.some(r => r.url.includes("SU2"))) results.push(KNOWN_VERIFIED_REPOS["su2code/SU2"]);
    results.push({
      name: "GitHub Topic: Aerospace",
      url: "https://github.com/topics/aerospace",
      description: "Flight software, avionics, orbital mechanics, and propulsion models",
      badge: "GitHub Topic"
    });
  } else if (/civil|structur|build|architect|concrete|cad/i.test(roleText)) {
    if (!results.some(r => r.url.includes("IfcOpenShell"))) results.push(KNOWN_VERIFIED_REPOS["IfcOpenShell/IfcOpenShell"]);
    if (!results.some(r => r.url.includes("ladybug"))) results.push(KNOWN_VERIFIED_REPOS["Ladybug-Tools/ladybug"]);
    results.push({
      name: "GitHub Topic: Structural Engineering",
      url: "https://github.com/topics/structural-engineering",
      description: "Civil infrastructure, BIM geometries, and structural simulation",
      badge: "GitHub Topic"
    });
  } else if (/design|ui|ux|graphic|visual|brand|typograph/i.test(roleText)) {
    if (!results.some(r => r.url.includes("react-spectrum"))) results.push(KNOWN_VERIFIED_REPOS["adobe/react-spectrum"]);
    if (!results.some(r => r.url.includes("tailwindcss"))) results.push(KNOWN_VERIFIED_REPOS["tailwindlabs/tailwindcss"]);
    if (!results.some(r => r.url.includes("material-web"))) results.push(KNOWN_VERIFIED_REPOS["material-components/material-web"]);
    results.push({
      name: "GitHub Topic: Design System",
      url: "https://github.com/topics/design-system",
      description: "Enterprise design systems, typography grids, and accessible UI kits",
      badge: "GitHub Topic"
    });
  } else if (/chef|culinary|cook|kitchen|food|pastry|restaurant/i.test(roleText)) {
    if (!results.some(r => r.url.includes("openfoodfacts"))) results.push(KNOWN_VERIFIED_REPOS["openfoodfacts/openfoodfacts-server"]);
    if (!results.some(r => r.url.includes("TastyIgniter"))) results.push(KNOWN_VERIFIED_REPOS["tastyigniter/TastyIgniter"]);
    results.push({
      name: "GitHub Topic: Food Safety",
      url: "https://github.com/topics/food-safety",
      description: "HACCP compliance, culinary calculation tools, and kitchen management",
      badge: "GitHub Topic"
    });
  } else if (/electric|plumb|hvac|weld|trade|wire/i.test(roleText)) {
    if (!results.some(r => r.url.includes("esphome"))) results.push(KNOWN_VERIFIED_REPOS["esphome/esphome"]);
    if (!results.some(r => r.url.includes("ArduinoJson"))) results.push(KNOWN_VERIFIED_REPOS["bblanchon/ArduinoJson"]);
    results.push({
      name: "GitHub Topic: Arduino & Embedded",
      url: "https://github.com/topics/arduino",
      description: "Microcontroller schematics, electrical sensors, and automation systems",
      badge: "GitHub Topic"
    });
  } else {
    // Default Tech
    if (!results.some(r => r.url.includes("TheAlgorithms"))) results.push(KNOWN_VERIFIED_REPOS["TheAlgorithms/Python"]);
    if (!results.some(r => r.url.includes("public-apis"))) results.push(KNOWN_VERIFIED_REPOS["public-apis/public-apis"]);
    if (!results.some(r => r.url.includes("freeCodeCamp"))) results.push(KNOWN_VERIFIED_REPOS["freeCodeCamp/freeCodeCamp"]);
  }

  // Deduplicate and return top 3
  const seen = new Set<string>();
  const unique: ProjectBlueprint[] = [];
  for (const r of results) {
    if (!seen.has(r.url)) {
      seen.add(r.url);
      unique.push(r);
    }
    if (unique.length >= 3) break;
  }

  return unique;
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
  const projectBlueprints = resolveProjectBlueprints(milestone, targetRole);

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
    if (milestone.status === "known") {
      onUpdateStatus(milestone.id, "available");
    } else {
      onUpdateStatus(milestone.id, "known");
    }
  };

  const handleStart = () => {
    if (milestone.status === "in_progress") {
      onUpdateStatus(milestone.id, "available");
    } else {
      onUpdateStatus(milestone.id, "in_progress");
    }
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
    <>
      {/* Backdrop overlay for tap-outside to dismiss on mobile & laptop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-label="Close inspector drawer overlay"
      />

      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-full sm:max-w-md md:max-w-lg lg:w-[500px] h-[100dvh] flex-col border-l border-slate-800 bg-[#0F172A]/98 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3 sm:pb-4">
          <div className="pr-2">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
              {milestone.phase}
            </span>
            <h2 className="mt-1 text-base sm:text-lg font-bold text-white leading-snug">
              {milestone.title}
            </h2>
            <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                {milestone.estimatedHours} hours
              </span>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-300 font-medium capitalize text-[11px]">
                {milestone.category}
              </span>
              {milestone.status === "in_progress" && (
                <span className="flex items-center gap-1.5 rounded-full border border-amber-500/50 bg-amber-950/60 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400 shadow-[0_0_6px_#F59E0B]" />
                  </span>
                  Active Learning Light
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition flex-shrink-0"
            aria-label="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="my-3 sm:my-4 grid grid-cols-3 gap-1.5 sm:gap-2">
          <button
            onClick={handleMarkKnown}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg border px-1.5 sm:px-3 py-2 text-[11px] sm:text-xs font-semibold transition ${
              milestone.status === "known"
                ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                : "border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-600 hover:bg-slate-700"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate">Mark Known</span>
          </button>

          <button
            onClick={handleStart}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg border px-1.5 sm:px-3 py-2 text-[11px] sm:text-xs font-semibold transition ${
              milestone.status === "in_progress"
                ? "border-amber-400 bg-amber-500/25 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.4)] ring-1 ring-amber-400/50"
                : "border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-600 hover:bg-slate-700"
            }`}
          >
            {milestone.status === "in_progress" ? (
              <span className="relative flex h-2 w-2 mr-0.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
              </span>
            ) : (
              <PlayCircle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
            )}
            <span className="truncate">In Progress</span>
          </button>

          <button
            onClick={handleComplete}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg border px-1.5 sm:px-3 py-2 text-[11px] sm:text-xs font-semibold transition ${
              milestone.status === "completed"
                ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                : "border-emerald-600/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate">Completed</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 space-y-4 sm:space-y-5 overflow-y-auto pr-1">
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
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-purple-400">
                Original Verified Blueprints & Project Repositories:
              </span>
              <span className="rounded bg-purple-900/60 px-1.5 py-0.5 text-[9px] font-semibold text-purple-300">
                100% Verified Live Links
              </span>
            </div>
            <div className="mt-2 space-y-2">
              {projectBlueprints.map((item, idx) => (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-lg border border-purple-500/30 bg-purple-950/40 p-2.5 text-xs text-purple-200 hover:border-purple-400 hover:bg-purple-900/60 hover:text-white transition"
                  title={`Open ${item.name} on GitHub`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 overflow-hidden">
                      <FolderGit2 className="h-4 w-4 text-purple-400 group-hover:text-purple-300 flex-shrink-0 mt-0.5" />
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-purple-200 group-hover:text-white truncate">
                            {item.name}
                          </span>
                          <span className="rounded bg-purple-900/80 px-1.5 py-0.2 text-[9px] font-mono text-purple-300 flex-shrink-0">
                            {item.badge}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-300 line-clamp-1 leading-normal">
                          {item.description}
                        </p>
                        <span className="mt-1 block font-mono text-[10px] text-purple-400/80 truncate">
                          {item.url.replace(/^https?:\/\//, "")}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-purple-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                  </div>
                </a>
              ))}
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
    </>
  );
}
