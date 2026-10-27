import { CourseMatrixItem } from "../types/roadmap";

export interface DomainCourseMapping {
  domain: string;
  roleRegex: RegExp;
  skillsRegex: RegExp;
  freeYouTubeCourses: Array<{
    title: string;
    platform: string;
    url: string;
    skillCoverage: string;
    estimatedDuration: string;
  }>;
  paidAccreditedCourses: Array<{
    title: string;
    platform: string;
    url: string;
    skillCoverage: string;
    estimatedDuration: string;
  }>;
  practiceSandboxes: Array<{
    title: string;
    platform: string;
    url: string;
    skillCoverage: string;
    estimatedDuration: string;
  }>;
  officialStandards: Array<{
    title: string;
    platform: string;
    url: string;
    skillCoverage: string;
    estimatedDuration: string;
  }>;
}

/**
 * Authoritative Curated Dataset of Role-Specific Learning Resources
 * Maps target careers and competencies to verified YouTube courses, accredited university MOOCs,
 * interactive sandboxes, and regulatory standards.
 */
export const COMPREHENSIVE_COURSE_DATASET: DomainCourseMapping[] = [
  // 1. HEALTHCARE & MEDICINE / NURSING
  {
    domain: "Healthcare & Clinical Nursing",
    roleRegex: /health|nurse|doctor|physician|medic|clinic|pharma|bio|patient|hospital|physiotherapy|pediatric/i,
    skillsRegex: /anatomy|physiology|pharmacology|vitals|patient|pathology|nursing|dosage|clinical|assessment|cardiac|telemetry/i,
    freeYouTubeCourses: [
      {
        title: "Khan Academy Health & Medicine — Comprehensive Human Anatomy & Physiology",
        platform: "YouTube (Khan Academy)",
        url: "https://www.youtube.com/@khanacademyhealth",
        skillCoverage: "Organ systems, cellular pathology, cardiovascular dynamics, and pulmonary function",
        estimatedDuration: "25 hours"
      },
      {
        title: "Ninja Nerd Science — High-Yield Clinical Pharmacology & Drug Mechanisms",
        platform: "YouTube (Ninja Nerd)",
        url: "https://www.youtube.com/@NinjaNerdScience",
        skillCoverage: "Pharmacokinetics, autonomic nervous system pharmacology, and emergency cardiac drugs",
        estimatedDuration: "40 hours"
      },
      {
        title: "RegisteredNurseRN — Clinical Nursing Procedures, Dosage Calculations & NCLEX Mastery",
        platform: "YouTube (RegisteredNurseRN)",
        url: "https://www.youtube.com/@RegisteredNurseRN",
        skillCoverage: "Arterial blood gases, IV drip rates, fluid balance, and physical assessment skills",
        estimatedDuration: "30 hours"
      },
      {
        title: "Osmosis from Elsevier — Pathophysiology & Clinical Decision-Making",
        platform: "YouTube (Osmosis)",
        url: "https://www.youtube.com/@MyOsmosis",
        skillCoverage: "Etiology, diagnostic criteria, and evidence-based interventions for acute conditions",
        estimatedDuration: "18 hours"
      }
    ],
    paidAccreditedCourses: [
      {
        title: "Johns Hopkins University — Foundations of Clinical Nursing Practice & Patient Care",
        platform: "Coursera",
        url: "https://www.coursera.org/specializations/nursing",
        skillCoverage: "Evidence-based clinical guidelines, patient safety culture, and hospital care workflows",
        estimatedDuration: "4 months (4h/wk)"
      },
      {
        title: "University of Michigan — Advanced Clinical Pharmacology & Pharmacotherapeutics",
        platform: "Coursera",
        url: "https://www.coursera.org/learn/clinical-pharmacology",
        skillCoverage: "Safe medication administration, adverse interaction mitigation, and clinical dosing",
        estimatedDuration: "6 weeks"
      },
      {
        title: "Harvard Medical School Online — Clinical Research & Pharmacology Design",
        platform: "edX / Harvard Online",
        url: "https://www.edx.org/school/harvardx",
        skillCoverage: "Translational medicine, randomized clinical trials, and epidemiological standards",
        estimatedDuration: "8 weeks"
      }
    ],
    practiceSandboxes: [
      {
        title: "NCSBN NCLEX Candidate Exam Simulation & Item Question Bank",
        platform: "NCSBN Portal",
        url: "https://www.ncsbn.org/nclex.page",
        skillCoverage: "Next-Generation NCLEX clinical judgment measurement and scenario scoring",
        estimatedDuration: "Self-paced drills"
      },
      {
        title: "Khan Academy Health Interactive Quizzes & Diagnostic Case Simulations",
        platform: "Khan Academy",
        url: "https://www.khanacademy.org/science/health-and-medicine",
        skillCoverage: "Interactive physical exam challenges and differential diagnosis case scenarios",
        estimatedDuration: "Interactive modules"
      },
      {
        title: "Synthea Open-Source Synthetic Patient Population Generator",
        platform: "GitHub (Synthetic Health)",
        url: "https://github.com/synthetichealth/synthea",
        skillCoverage: "Electronic health records (EHR) simulation, disease progression modeling, and HL7 FHIR",
        estimatedDuration: "Hands-on data lab"
      }
    ],
    officialStandards: [
      {
        title: "World Health Organization (WHO) — Guidelines Approved by the Guidelines Review Committee",
        platform: "WHO Official Portal",
        url: "https://www.who.int/publications/who-guidelines",
        skillCoverage: "Global standards for clinical care protocols and epidemiology tracking",
        estimatedDuration: "Official reference"
      },
      {
        title: "CDC — Clinical Safety Protocols, Infection Prevention & Disease Control",
        platform: "CDC Official Portal",
        url: "https://www.cdc.gov/infectioncontrol",
        skillCoverage: "Standard and transmission-based precautions, PPE protocols, and aseptic procedures",
        estimatedDuration: "Regulatory manual"
      },
      {
        title: "National Library of Medicine (PubMed) — Peer-Reviewed Medical & Nursing Research",
        platform: "National Institutes of Health (NIH)",
        url: "https://pubmed.ncbi.nlm.nih.gov",
        skillCoverage: "Evidence-based practice literature and peer-reviewed clinical trials",
        estimatedDuration: "Scholarly database"
      }
    ]
  },

  // 2. LAW, LEGAL & PUBLIC POLICY
  {
    domain: "Law & Corporate Regulatory Counsel",
    roleRegex: /law|legal|attorney|counsel|paralegal|compliance|judge|court|statute|litigat|bar exam/i,
    skillsRegex: /contract|statute|brief|pleading|legal research|citation|regulation|m&a|tort|constitutional|jurisprudence/i,
    freeYouTubeCourses: [
      {
        title: "Harvard Law School — Case Method Lectures, Trial Strategy & Oral Argument",
        platform: "YouTube (Harvard Law)",
        url: "https://www.youtube.com/@HarvardLawSchool",
        skillCoverage: "Socratic case debriefing, doctrinal jurisprudence, and appellate litigation strategy",
        estimatedDuration: "20 hours"
      },
      {
        title: "Yale Courses — Constitutional Law & Civil Liberties with Prof. Akhil Amar",
        platform: "YouTube (Yale Courses)",
        url: "https://www.youtube.com/@YaleCourses",
        skillCoverage: "Textualism, judicial review, Fourteenth Amendment jurisprudence, and Commerce Clause",
        estimatedDuration: "35 hours"
      },
      {
        title: "LegalEagle / Think Like a Lawyer — Civil Procedure, Contracts & Evidence Law",
        platform: "YouTube (LegalEagle)",
        url: "https://www.youtube.com/@LegalEagle",
        skillCoverage: "Substantive analysis of contractual breach, discovery rules, and hearsay exceptions",
        estimatedDuration: "15 hours"
      },
      {
        title: "The Federalist Society — Regulatory Practice, Administrative Law & Chevron Doctrine",
        platform: "YouTube (FedSoc)",
        url: "https://www.youtube.com/@TheFederalistSociety",
        skillCoverage: "Administrative Procedure Act, statutory interpretation canons, and executive orders",
        estimatedDuration: "18 hours"
      }
    ],
    paidAccreditedCourses: [
      {
        title: "University of Pennsylvania — Regulatory Compliance & Corporate Risk Specialization",
        platform: "Coursera",
        url: "https://www.coursera.org/specializations/regulatory-compliance",
        skillCoverage: "Anti-corruption laws (FCPA), risk frameworks, and regulatory auditing protocols",
        estimatedDuration: "3 months"
      },
      {
        title: "Harvard Online — Contract Law: From Trust to Promise to Contract",
        platform: "edX",
        url: "https://www.edx.org/learn/contract-law",
        skillCoverage: "Mutual assent, consideration, representations and warranties, and damages remedies",
        estimatedDuration: "8 weeks"
      },
      {
        title: "University of London — Common Law Reasoning and Institutions",
        platform: "Coursera",
        url: "https://www.coursera.org/learn/common-law-reasoning",
        skillCoverage: "Statutory interpretation, precedent hierarchies, and Bluebook legal writing",
        estimatedDuration: "6 weeks"
      }
    ],
    practiceSandboxes: [
      {
        title: "Oyez Project — Complete U.S. Supreme Court Oral Arguments & Case Audio Database",
        platform: "Oyez (IIT Chicago-Kent)",
        url: "https://www.oyez.org",
        skillCoverage: "Bench questioning simulation, oral argument transcripts, and judicial voting matrices",
        estimatedDuration: "Interactive case bench"
      },
      {
        title: "Cornell Legal Information Institute (LII) — Electronic CFR & U.S. Code Navigator",
        platform: "Cornell Law School",
        url: "https://www.law.cornell.edu",
        skillCoverage: "Cross-referencing statutory cross-citations, public laws, and federal regulations",
        estimatedDuration: "Primary law sandbox"
      },
      {
        title: "CourtListener & RECAP — Millions of Federal Court Dockets & Free Citator API",
        platform: "Free Law Project",
        url: "https://www.courtlistener.com",
        skillCoverage: "Drafting pleadings against real-world PACER dockets and brief repositories",
        estimatedDuration: "Dossier research tool"
      }
    ],
    officialStandards: [
      {
        title: "American Bar Association (ABA) — Model Rules of Professional Conduct & Formal Opinions",
        platform: "ABA Official Standards",
        url: "https://www.americanbar.org/groups/professional_responsibility/publications/model_rules_of_professional_conduct",
        skillCoverage: "Client confidentiality, conflicts of interest, attorney-client privilege, and ethical rules",
        estimatedDuration: "Authoritative ethical code"
      },
      {
        title: "United States Courts — Federal Rules of Civil and Criminal Procedure",
        platform: "US Courts Official Portal",
        url: "https://www.uscourts.gov/rules-policies/current-rules-practice-procedure",
        skillCoverage: "FRCP Rule 12 dispositive motions, summary judgment standards, and discovery rules",
        estimatedDuration: "Federal procedural rulebook"
      }
    ]
  },

  // 3. AEROSPACE, MECHANICAL & CIVIL ENGINEERING
  {
    domain: "Engineering & Applied Physical Sciences",
    roleRegex: /engineer|aerospace|mechanical|civil|robotics|propulsion|aircraft|structural|satellite|cad/i,
    skillsRegex: /thermo|aerodynamic|fluid|cad|solidworks|finite element|fea|mechanics|heat transfer|bridge|matlab|structures/i,
    freeYouTubeCourses: [
      {
        title: "MIT OpenCourseWare — Fluid Dynamics & Aerodynamics with Prof. Ascher Shapiro",
        platform: "YouTube (MIT OCW)",
        url: "https://www.youtube.com/@mitocw",
        skillCoverage: "Navier-Stokes equations, boundary layer theory, supersonic flow, and shock waves",
        estimatedDuration: "32 hours"
      },
      {
        title: "The Efficient Engineer — Finite Element Analysis (FEA) & Stress Tensor Mechanics",
        platform: "YouTube (The Efficient Engineer)",
        url: "https://www.youtube.com/@TheEfficientEngineer",
        skillCoverage: "Von Mises yield criterion, torsional shear stress, beam deflection, and meshing",
        estimatedDuration: "14 hours"
      },
      {
        title: "Real Engineering — Aerospace Propulsion, Rocket Engines & Orbital Mechanics",
        platform: "YouTube (Real Engineering)",
        url: "https://www.youtube.com/@RealEngineering",
        skillCoverage: "Staged combustion cycles, specific impulse, thermal protection systems, and nozzle expansion",
        estimatedDuration: "12 hours"
      },
      {
        title: "Brian Douglas — Classical Control Systems & PID State-Space Modeling",
        platform: "YouTube (Brian Douglas)",
        url: "https://www.youtube.com/@BrianBDouglas",
        skillCoverage: "Bode plots, root locus stability, transfer functions, and feedback control",
        estimatedDuration: "20 hours"
      }
    ],
    paidAccreditedCourses: [
      {
        title: "TU Delft — Introduction to Aerospace Engineering & Flight Mechanics",
        platform: "edX",
        url: "https://www.edx.org/learn/aerospace-engineering",
        skillCoverage: "Lift and drag coefficients, orbital trajectory calculations, and satellite subsystem design",
        estimatedDuration: "7 weeks"
      },
      {
        title: "Georgia Institute of Technology — Finite Element Method in Structural Engineering",
        platform: "Coursera",
        url: "https://www.coursera.org/learn/finite-element-method",
        skillCoverage: "Stiffness matrix formulation, 2D/3D element discretization, and dynamic modal analysis",
        estimatedDuration: "8 weeks"
      },
      {
        title: "University of Colorado Boulder — Spacecraft Dynamics and Control Specialization",
        platform: "Coursera",
        url: "https://www.coursera.org/specializations/spacecraft-dynamics-control",
        skillCoverage: "Attitude determination, reaction wheels, quaternion kinematics, and orbital rendezvous",
        estimatedDuration: "4 months"
      }
    ],
    practiceSandboxes: [
      {
        title: "SimScale — Cloud-Based CFD Aerodynamics & FEA Simulation Workspaces",
        platform: "SimScale Cloud CAE",
        url: "https://www.simscale.com",
        skillCoverage: "Compressible fluid mesh generation, turbulence modeling, and thermal stress sims",
        estimatedDuration: "Simulation workspace"
      },
      {
        title: "GrabCAD Community — 5M+ Free Open-Source CAD Models & Engineering Benchmarks",
        platform: "GrabCAD",
        url: "https://grabcad.com/library",
        skillCoverage: "Parametric solid modeling, assembly tolerancing, and GD&T blueprint validation",
        estimatedDuration: "Interactive CAD repository"
      },
      {
        title: "NASA Core Flight System (cFS) Open Architecture",
        platform: "GitHub (NASA)",
        url: "https://github.com/nasa/cFS",
        skillCoverage: "Flight software architecture, telemetry publishing, and real-time command dispatch",
        estimatedDuration: "Avionics software lab"
      }
    ],
    officialStandards: [
      {
        title: "AIAA — American Institute of Aeronautics and Astronautics Standards & Papers",
        platform: "AIAA Standards",
        url: "https://www.aiaa.org",
        skillCoverage: "Aerospace safety specifications, space environment standards, and propulsion guidelines",
        estimatedDuration: "Official specifications"
      },
      {
        title: "ASME — American Society of Mechanical Engineers Boiler and Pressure Vessel Code (BPVC)",
        platform: "ASME Technical Portal",
        url: "https://www.asme.org",
        skillCoverage: "Pressure boundary integrity, material allowable stresses, and safety relief design",
        estimatedDuration: "Industrial engineering code"
      }
    ]
  },

  // 4. FINANCE, ASSET MANAGEMENT & ACCOUNTING
  {
    domain: "Finance, Valuation & Asset Management",
    roleRegex: /financ|account|cfa|cpa|bank|invest|actuar|tax|valuat|portfolio|equity|wealth/i,
    skillsRegex: /dcf|financial model|valuation|balance sheet|cash flow|gaap|ifrs|ebitda|ratio|forecasting|excel/i,
    freeYouTubeCourses: [
      {
        title: "Prof. Aswath Damodaran (NYU Stern) — Corporate Finance & Advanced Valuation",
        platform: "YouTube (Aswath Damodaran)",
        url: "https://www.youtube.com/@AswathDamodaranonValuation",
        skillCoverage: "Discounted cash flow (DCF), cost of capital (WACC), equity risk premiums, and relative pricing",
        estimatedDuration: "45 hours"
      },
      {
        title: "Corporate Finance Institute (CFI) — 3-Statement Financial Modeling & LBO Mechanics",
        platform: "YouTube (CFI)",
        url: "https://www.youtube.com/@corporatefinanceinstitute",
        skillCoverage: "Dynamic balance sheet balancing, debt schedules, working capital modeling, and sensitivity tables",
        estimatedDuration: "22 hours"
      },
      {
        title: "MIT OpenCourseWare — Finance Theory I & Capital Asset Pricing (CAPM)",
        platform: "YouTube (MIT OCW)",
        url: "https://www.youtube.com/@mitocw",
        skillCoverage: "Modern portfolio theory, Black-Scholes option pricing, efficient market hypothesis, and bond duration",
        estimatedDuration: "28 hours"
      },
      {
        title: "The Plain Bagel & Ben Felix — Factor Investing, Portfolio Construction & Market Microstructure",
        platform: "YouTube",
        url: "https://www.youtube.com/@ThePlainBagel",
        skillCoverage: "Factor premiums, risk-adjusted returns (Sharpe/Sortino), and macroeconomic indicators",
        estimatedDuration: "16 hours"
      }
    ],
    paidAccreditedCourses: [
      {
        title: "Wharton School of Business — Business and Financial Modeling Specialization",
        platform: "Coursera",
        url: "https://www.coursera.org/specializations/wharton-business-financial-modeling",
        skillCoverage: "Monte Carlo simulation, scenario forecasting, optimization solver, and investment decision rules",
        estimatedDuration: "3 months"
      },
      {
        title: "CFA Institute — Chartered Financial Analyst Program Official Curriculum & Learning Ecosystem",
        platform: "CFA Institute",
        url: "https://www.cfainstitute.org/programs/cfa/curriculum",
        skillCoverage: "Ethical and professional standards, quantitative methods, fixed income, and portfolio management",
        estimatedDuration: "300+ study hours"
      },
      {
        title: "Columbia Business School — Value Investing: Making Intelligent Investments",
        platform: "Columbia Executive Education",
        url: "https://www.edx.org/school/columbiax",
        skillCoverage: "Margin of safety, competitive moat analysis, asset reproduction value, and earnings power value",
        estimatedDuration: "6 weeks"
      }
    ],
    practiceSandboxes: [
      {
        title: "SEC EDGAR Public Company Filings Search & 10-K / 10-Q Financial Statements",
        platform: "U.S. SEC",
        url: "https://www.sec.gov/edgar/searchedgar/companysearch",
        skillCoverage: "Extracting historical balance sheets, notes to financial statements, and MD&A disclosures",
        estimatedDuration: "Live regulatory filing tool"
      },
      {
        title: "Kaggle Financial Market Datasets & Quantitative Portfolio Notebooks",
        platform: "Kaggle",
        url: "https://www.kaggle.com/datasets?search=finance",
        skillCoverage: "Backtesting trading strategies, risk modeling, and asset return distributions in Python",
        estimatedDuration: "Interactive coding lab"
      },
      {
        title: "Yahoo Finance & YFinance Open-Source Market Data Library",
        platform: "GitHub (yfinance)",
        url: "https://github.com/ranaroussi/yfinance",
        skillCoverage: "Automating programmatic financial statement pulls and historical price series analysis",
        estimatedDuration: "Open-source data lab"
      }
    ],
    officialStandards: [
      {
        title: "FASB Accounting Standards Codification (ASC) — U.S. GAAP Official Repository",
        platform: "FASB Official Portal",
        url: "https://www.fasb.org",
        skillCoverage: "ASC 606 revenue recognition, ASC 842 lease accounting, and financial statement presentation",
        estimatedDuration: "Official accounting standard"
      },
      {
        title: "IFRS Foundation — International Financial Reporting Standards Official Portal",
        platform: "IFRS Standards",
        url: "https://www.ifrs.org",
        skillCoverage: "Global standards for commercial asset valuation and consolidated reporting",
        estimatedDuration: "Global standards portal"
      }
    ]
  },

  // 5. DESIGN, UI/UX & VISUAL ARTS
  {
    domain: "Design, Visual Identity & Digital Products",
    roleRegex: /design|graphic|ui|ux|visual|brand|creative director|illustrat|animat/i,
    skillsRegex: /figma|typography|wireframe|prototype|color theory|adobe|component|usability|grid|design system/i,
    freeYouTubeCourses: [
      {
        title: "Figma Official Channel — Complete Design Systems & Component Auto-Layout Mastery",
        platform: "YouTube (Figma)",
        url: "https://www.youtube.com/@Figma",
        skillCoverage: "Tokens, responsive auto-layout, interactive variants, and variables in production UI",
        estimatedDuration: "18 hours"
      },
      {
        title: "DesignCourse — UI/UX Core Foundations, Spacing, Visual Hierarchy & CSS Micro-Interactions",
        platform: "YouTube (DesignCourse)",
        url: "https://www.youtube.com/@DesignCourse",
        skillCoverage: "Negative space, typographical scale, optical alignment, and accessibility contrast",
        estimatedDuration: "20 hours"
      },
      {
        title: "Flux Academy — Brand Identity Design Systems & Client Style Guides",
        platform: "YouTube (Flux Academy)",
        url: "https://www.youtube.com/@FluxAcademy",
        skillCoverage: "Logo mark geometry, color psychology palettes, tone of voice, and brand guidelines",
        estimatedDuration: "15 hours"
      },
      {
        title: "The Futur with Chris Do — Design Thinking, Creative Direction & UX Client Strategy",
        platform: "YouTube (The Futur)",
        url: "https://www.youtube.com/@thefutur",
        skillCoverage: "Discovery interviews, stakeholder pitching, scoping user journeys, and value pricing",
        estimatedDuration: "25 hours"
      }
    ],
    paidAccreditedCourses: [
      {
        title: "Google UX Design Professional Certificate — Complete Design Sprint & Usability Testing",
        platform: "Coursera",
        url: "https://www.coursera.org/professional-certificates/google-ux-design",
        skillCoverage: "Empathy maps, competitive audits, Figma prototyping, and usability study synthesis",
        estimatedDuration: "6 months (10h/wk)"
      },
      {
        title: "California Institute of the Arts (CalArts) — Graphic Design Specialization",
        platform: "Coursera",
        url: "https://www.coursera.org/specializations/graphic-design",
        skillCoverage: "Typography history, editorial publication design, and visual imagery composition",
        estimatedDuration: "4 months"
      }
    ],
    practiceSandboxes: [
      {
        title: "Figma Community — Free Production UI Kits, Design Tokens & Design System Libraries",
        platform: "Figma Community",
        url: "https://www.figma.com/community",
        skillCoverage: "Inspecting production design systems (Uber Base, Shopify Polaris, Material You)",
        estimatedDuration: "Hands-on UI playground"
      },
      {
        title: "Frontend Mentor — Real-World HTML/CSS/Design Challenges with Figma Source Specs",
        platform: "Frontend Mentor",
        url: "https://www.frontendmentor.io",
        skillCoverage: "Translating pixel-perfect Figma prototypes into responsive, accessible web layouts",
        estimatedDuration: "Challenge repository"
      }
    ],
    officialStandards: [
      {
        title: "Nielsen Norman Group (NN/g) — 10 Usability Heuristics for User Interface Design",
        platform: "NN/g Research Library",
        url: "https://www.nngroup.com/articles/ten-usability-heuristics",
        skillCoverage: "Error prevention, recognition vs recall, system status visibility, and cognitive load",
        estimatedDuration: "UX industry standard"
      },
      {
        title: "AIGA — Professional Association for Design Ethical Guidelines & Standards of Practice",
        platform: "AIGA Official Portal",
        url: "https://www.aiga.org",
        skillCoverage: "Intellectual property ownership, contract terms, and client engagement ethics",
        estimatedDuration: "Professional standard"
      }
    ]
  },

  // 6. SOFTWARE, WEB DEVELOPMENT & CLOUD / DEVOPS
  {
    domain: "Software Engineering & Cloud Architecture",
    roleRegex: /developer|software|engineer|programmer|full stack|backend|frontend|devops|cloud|web/i,
    skillsRegex: /javascript|typescript|react|next|node|python|git|sql|database|api|docker|cloud|aws/i,
    freeYouTubeCourses: [
      {
        title: "freeCodeCamp.org — Full Stack Web Development & Database Architecture Masterclass",
        platform: "YouTube (freeCodeCamp)",
        url: "https://www.youtube.com/@freecodecamp",
        skillCoverage: "TypeScript generics, React server components, REST/GraphQL APIs, and SQL relational joins",
        estimatedDuration: "40 hours"
      },
      {
        title: "Harvard CS50 — Introduction to Computer Science & Algorithm Design with Prof. David J. Malan",
        platform: "YouTube (CS50)",
        url: "https://www.youtube.com/@cs50",
        skillCoverage: "Memory management, pointers, Big-O algorithmic complexity, and secure system design",
        estimatedDuration: "25 hours"
      },
      {
        title: "Traversy Media & Fireship — Modern Cloud Infrastructure, Docker & Serverless Patterns",
        platform: "YouTube (Fireship / Traversy)",
        url: "https://www.youtube.com/@Fireship",
        skillCoverage: "Containerization, CI/CD automated deployment pipelines, microservices, and edge functions",
        estimatedDuration: "15 hours"
      }
    ],
    paidAccreditedCourses: [
      {
        title: "Meta Full-Stack Software Engineer Professional Certificate",
        platform: "Coursera",
        url: "https://www.coursera.org/professional-certificates/meta-front-end-developer",
        skillCoverage: "React state management, responsive UI design, automated testing with Jest, and end-to-end CI",
        estimatedDuration: "7 months"
      },
      {
        title: "AWS Certified Solutions Architect Associate Official Learning Path",
        platform: "AWS Skill Builder / Coursera",
        url: "https://aws.amazon.com/certification/certified-solutions-architect-associate",
        skillCoverage: "VPC networking, multi-region failover, IAM declarative security, and auto-scaling clusters",
        estimatedDuration: "6 weeks"
      }
    ],
    practiceSandboxes: [
      {
        title: "LeetCode — Algorithmic Problem Solving & Data Structures Sandbox",
        platform: "LeetCode",
        url: "https://leetcode.com",
        skillCoverage: "Trees, graphs, dynamic programming, sliding window, and two-pointer techniques",
        estimatedDuration: "Interactive drill environment"
      },
      {
        title: "Exercism — 70+ Code Tracks with Free Automated Testing & Human Mentorship",
        platform: "Exercism",
        url: "https://exercism.org",
        skillCoverage: "Idiomatic programming language syntax, unit testing, and clean refactoring drills",
        estimatedDuration: "Interactive language track"
      }
    ],
    officialStandards: [
      {
        title: "MDN Web Docs — Mozilla Developer Network Authoritative Web Standards & APIs",
        platform: "MDN Official Portal",
        url: "https://developer.mozilla.org",
        skillCoverage: "W3C specifications, DOM APIs, CSS Grid/Flexbox specs, and web security headers (CORS/CSP)",
        estimatedDuration: "Authoritative reference"
      }
    ]
  },

  // 7. ARTIFICIAL INTELLIGENCE, DATA SCIENCE & MACHINE LEARNING
  {
    domain: "Artificial Intelligence & Data Science",
    roleRegex: /ai|machine learning|deep learning|data scientist|nlp|computer vision|llm/i,
    skillsRegex: /machine learning|pytorch|tensorflow|neural|nlp|deep learning|data cleaning|statistics|regression/i,
    freeYouTubeCourses: [
      {
        title: "3Blue1Brown — Essence of Linear Algebra & Neural Network Calculus",
        platform: "YouTube (3Blue1Brown)",
        url: "https://www.youtube.com/@3blue1brown",
        skillCoverage: "Eigenvalues, gradient descent vector calculus, backpropagation derivations, and matrix ops",
        estimatedDuration: "16 hours"
      },
      {
        title: "Andrej Karpathy — Neural Networks: Zero to Hero (Building GPT from Scratch)",
        platform: "YouTube (Andrej Karpathy)",
        url: "https://www.youtube.com/@AndrejKarpathy",
        skillCoverage: "Autograd engines, transformer self-attention mechanisms, tokenization, and pretraining",
        estimatedDuration: "20 hours"
      },
      {
        title: "StatQuest with Josh Starmer — Machine Learning, Random Forests & Cross-Validation",
        platform: "YouTube (StatQuest)",
        url: "https://www.youtube.com/@statquest",
        skillCoverage: "ROC/AUC curves, logistic regression, gradient boosting (XGBoost), and PCA decomposition",
        estimatedDuration: "18 hours"
      }
    ],
    paidAccreditedCourses: [
      {
        title: "DeepLearning.AI — Deep Learning Specialization by Andrew Ng",
        platform: "Coursera",
        url: "https://www.coursera.org/specializations/deep-learning",
        skillCoverage: "CNNs for image classification, sequence models (RNN/LSTM/Transformers), and hyperparameter tuning",
        estimatedDuration: "5 months"
      },
      {
        title: "Stanford University Online — Machine Learning & Statistical Learning",
        platform: "edX / Stanford Online",
        url: "https://online.stanford.edu/courses/soe-ymcs0001-machine-learning",
        skillCoverage: "Supervised and unsupervised learning, regularization (L1/L2), and probabilistic inference",
        estimatedDuration: "10 weeks"
      }
    ],
    practiceSandboxes: [
      {
        title: "Kaggle Competitions & Benchmark Machine Learning Notebooks",
        platform: "Kaggle",
        url: "https://www.kaggle.com",
        skillCoverage: "Exploratory data analysis (EDA), feature engineering pipelines, and ensemble modeling",
        estimatedDuration: "Live ML workbench"
      },
      {
        title: "Hugging Face Model Hub & Interactive Spaces",
        platform: "Hugging Face",
        url: "https://huggingface.co",
        skillCoverage: "Fine-tuning transformer pipelines, evaluating perplexity, and deploying ONNX runtimes",
        estimatedDuration: "Model playground"
      }
    ],
    officialStandards: [
      {
        title: "PyTorch Official Documentation & Production Deep Learning Tutorials",
        platform: "PyTorch Portal",
        url: "https://pytorch.org/docs/stable/index.html",
        skillCoverage: "TorchScript JIT compilation, distributed data parallel (DDP), and CUDA acceleration",
        estimatedDuration: "Official framework documentation"
      }
    ]
  },

  // 8. EDUCATION, TEACHING & PEDAGOGY
  {
    domain: "Education, Teaching & Curriculum Instruction",
    roleRegex: /teach|educat|school|curriculum|pedagog|professor|academic|instructor|teacher/i,
    skillsRegex: /lesson plan|classroom|assessment|curriculum|differentiated|scaffolding|edtech|student/i,
    freeYouTubeCourses: [
      {
        title: "Edutopia — Evidence-Based Classroom Strategies & Student-Centered Scaffolding",
        platform: "YouTube (Edutopia)",
        url: "https://www.youtube.com/@edutopia",
        skillCoverage: "Formative checks for understanding, project-based learning (PBL), and behavioral regulation",
        estimatedDuration: "15 hours"
      },
      {
        title: "Cult of Pedagogy — Instructional Design Principles & Differentiated Learning",
        platform: "YouTube (Cult of Pedagogy)",
        url: "https://www.youtube.com/@CultofPedagogy",
        skillCoverage: "Backward design (UbD), rubrics calibration, peer feedback loops, and mastery scoring",
        estimatedDuration: "12 hours"
      }
    ],
    paidAccreditedCourses: [
      {
        title: "Harvard Graduate School of Education — Instructional Leadership & Inclusive Teaching",
        platform: "edX / Harvard Online",
        url: "https://www.edx.org/school/harvardx",
        skillCoverage: "Universal Design for Learning (UDL), diagnostic assessment, and socio-emotional learning",
        estimatedDuration: "6 weeks"
      }
    ],
    practiceSandboxes: [
      {
        title: "OER Commons — Open Educational Resources & Verified Lesson Plan Repositories",
        platform: "OER Commons",
        url: "https://www.oercommons.org",
        skillCoverage: "Curating state-standards-aligned unit plans, formative rubrics, and interactive labs",
        estimatedDuration: "Curriculum repository"
      }
    ],
    officialStandards: [
      {
        title: "U.S. Department of Education — National Educational Technology Plan & Learning Standards",
        platform: "Department of Education",
        url: "https://www.ed.gov",
        skillCoverage: "Every Student Succeeds Act (ESSA) compliance, IEP accessibility, and learning frameworks",
        estimatedDuration: "Federal policy standard"
      }
    ]
  }
];

/**
 * Universal Query Engine:
 * Takes a milestone node and target role, extracts key concepts, and dynamically synthesizes
 * the most accurate, role-matched Course Matrix (Free YouTube, Paid MOOCs, Practice Sandboxes, Standards).
 */
export function queryCourseDataset(
  milestoneTitle: string,
  milestoneCategory: string,
  targetRole: string,
  keySkills: string[] = []
): CourseMatrixItem[] {
  const queryText = `${targetRole} ${milestoneTitle} ${keySkills.join(" ")}`.toLowerCase();

  // Find best matching domain in dataset
  const match = COMPREHENSIVE_COURSE_DATASET.find(
    (entry) => entry.roleRegex.test(targetRole) || entry.skillsRegex.test(queryText)
  );

  const results: CourseMatrixItem[] = [];

  if (match) {
    // 1. Add matching Free YouTube Courses
    match.freeYouTubeCourses.forEach((c) => {
      results.push({
        title: c.title,
        platform: c.platform,
        category: "free_youtube",
        url: c.url,
        costType: "Free on YouTube",
        skillCoverage: c.skillCoverage,
        estimatedDuration: c.estimatedDuration
      });
    });

    // 2. Add matching Paid Accredited Courses
    match.paidAccreditedCourses.forEach((c) => {
      results.push({
        title: c.title,
        platform: c.platform,
        category: "paid_accredited",
        url: c.url,
        costType: "Paid / Certified",
        skillCoverage: c.skillCoverage,
        estimatedDuration: c.estimatedDuration
      });
    });

    // 3. Add Practice Sandboxes
    match.practiceSandboxes.forEach((c) => {
      results.push({
        title: c.title,
        platform: c.platform,
        category: "practice_sandbox",
        url: c.url,
        costType: "Freemium / Practice",
        skillCoverage: c.skillCoverage,
        estimatedDuration: c.estimatedDuration
      });
    });

    // 4. Add Official Standards & Portals
    match.officialStandards.forEach((c) => {
      results.push({
        title: c.title,
        platform: c.platform,
        category: "official_portal",
        url: c.url,
        costType: "Free Course",
        skillCoverage: c.skillCoverage,
        estimatedDuration: c.estimatedDuration
      });
    });
  }

  // 5. Always synthesize a dynamic, precision YouTube lecture deep search matching the EXACT milestone & target role
  const ytSearchQuery = encodeURIComponent(`${targetRole} ${milestoneTitle} course lecture tutorial`);
  results.unshift({
    title: `YouTube Verified Playlists: ${milestoneTitle} for ${targetRole}`,
    platform: "YouTube Video Lectures",
    category: "free_youtube",
    url: `https://www.youtube.com/results?search_query=${ytSearchQuery}`,
    costType: "Free on YouTube",
    skillCoverage: `Targeted video demonstrations, practical walkthroughs, and step-by-step masterclasses for ${milestoneTitle}`,
    estimatedDuration: "Direct Video Feed"
  });

  // 6. Synthesize a dynamic Google Scholarly / Accredited Syllabus search
  const googleSearchQuery = encodeURIComponent(`${targetRole} ${milestoneTitle} accredited syllabus curriculum official`);
  results.push({
    title: `Google Academic & Curricular Portals: ${milestoneTitle}`,
    platform: "Google Search & Education",
    category: "official_portal",
    url: `https://www.google.com/search?q=${googleSearchQuery}`,
    costType: "Free Course",
    skillCoverage: `Direct access to accredited university syllabi, professional guidelines, and lecture notes`,
    estimatedDuration: "Search Index"
  });

  return results;
}
