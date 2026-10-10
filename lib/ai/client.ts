import {
  RoadmapData,
  RoadmapSchema,
  GenerateRoadmapInput,
  MilestoneGuidance,
  MilestoneGuidanceSchema,
  PathComparison,
  PathComparisonSchema,
  Milestone
} from "../types/roadmap";
import {
  ROADMAP_GENERATOR_SYSTEM_PROMPT,
  MILESTONE_GUIDANCE_SYSTEM_PROMPT,
  PATH_COMPARISON_SYSTEM_PROMPT
} from "./prompts";
import { rescaleRoadmapToConstraints } from "../utils/graphEngine";

/**
 * Clean and parse JSON from LLM response (strips markdown code blocks if present)
 */
function cleanAndParseJSON(raw: string): any {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/```$/, "");
  }
  return JSON.parse(cleaned.trim());
}

/**
 * Call Google Gemini API with model fallback
 */
async function callGemini(apiKey: string, prompt: string, systemInstruction?: string): Promise<string> {
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  let lastError: any = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const payload: any = {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json"
        }
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}) on ${model}: ${errorText}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (err: any) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error("All Gemini model endpoints failed");
}

/**
 * Call OpenAI-compatible API (OpenAI or Groq)
 */
async function callOpenAICompatible(
  apiKey: string,
  baseUrl: string,
  model: string,
  prompt: string,
  systemPrompt: string
): Promise<string> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Empty response from LLM API");
  }
  return text;
}

/**
 * Smart Universal Domain Fallback Generator
 * Supports all career domains with zero cross-domain contamination
 */
function generateDomainFallbackRoadmap(input: GenerateRoadmapInput): RoadmapData {
  const { targetRole, weeklyHours, targetDurationMonths, existingSkills } = input;
  const roleLower = targetRole.toLowerCase();

  const isHealthcare = /nurs|doctor|physician|medic|clinic|health|pharma|psychol|patient|dental|therap|hospital/i.test(roleLower);
  const isLaw = /law|legal|attorney|counsel|paralegal|justice|litigat|court|juris|judic|bar exam|compliance officer/i.test(roleLower);
  const isEducation = /teach|educat|pedagog|school|profess|instructor|curriculum|academ|kindergarten/i.test(roleLower);
  const isFinance = /financ|account|cfa|cpa|audit|bank|invest|actuar|tax|valuat|equity|hedge|portfolio manag/i.test(roleLower);
  const isAerospace = /aerospac|aeronaut|propuls|aircraft|flight|spacecraft|satellite|aerodynamic/i.test(roleLower);
  const isCivil = /civil|structur|construct|geotech|survey|building code|infrastructure|concrete|bridge/i.test(roleLower);
  const isMechanical = /mechanic|thermo|fluid dynamics|cad|solidworks|robotics|automotive engineer/i.test(roleLower);
  const isDesign = /design|graphic|illustrat|visual|brand|ui|ux|animat|creative director|fashion|interior design/i.test(roleLower);
  const isCulinary = /chef|culinary|cook|baker|pastry|kitchen|restaurant|sommelier|gastronomy/i.test(roleLower);
  const isTrades = /electrician|plumb|welder|hvac|machinist|carpenter|carpentry/i.test(roleLower);
  const isBusiness = /market|sales|consult|product manag|business develop|operations manag|entrepreneur|supply chain/i.test(roleLower);
  const isClimate = roleLower.includes("climate") || roleLower.includes("clean energy") || roleLower.includes("sustain");
  const isAI = roleLower.includes("ai") || roleLower.includes("machine learning") || roleLower.includes("deep learning") || roleLower.includes("nlp");
  const isSecurity = roleLower.includes("security") || roleLower.includes("cyber") || roleLower.includes("pentest");
  const isSoftware = /software|developer|frontend|backend|full.?stack|web dev|mobile dev|devops|cloud architect/i.test(roleLower);

  let phases: string[];
  let nodes: Milestone[];

  // 1. HEALTHCARE & MEDICINE
  if (isHealthcare) {
    phases = [
      "Phase 1: Human Anatomy, Physiology & Clinical Pathophysiology",
      "Phase 2: Evidence-Based Pharmacology, Diagnostic Care & Simulation",
      "Phase 3: Supervised Clinical Practicum, Licensure & Healthcare Placement"
    ];
    nodes = [
      {
        id: "p1-anatomy-physiology",
        title: "Human Anatomy, Physiology & Disease Pathophysiology",
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 25,
        prerequisites: [],
        description: "Master organ systems, cellular homeostasis, fluid-electrolyte balance, and disease mechanisms essential for clinical assessment.",
        whyItMatters: `Clinicians must interpret subtle vital sign shifts, recognize acute decompensation, and understand disease etiology for ${targetRole}.`,
        actionableDetails: {
          miniProjectIdea: "Compile comprehensive differential diagnosis and pathophysiological mechanism case charts for 5 acute clinical conditions.",
          githubRepoSuggestions: ["open-clinical/guidelines", "hl7/fhir-patient-records"],
          interviewQuestions: [
            "How do you differentiate respiratory from metabolic acidosis using arterial blood gas (ABG) values?",
            "Describe the clinical intervention cascade when assessing a patient presenting with early septic shock."
          ],
          keySkillsToMaster: ["Anatomy & Physiology", "Pathophysiology", "ABG Interpretation", "Patient Assessment"]
        }
      },
      {
        id: "p1-clinical-ethics-safety",
        title: "Clinical Ethics, Patient Safety & HIPAA Compliance",
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 20,
        prerequisites: [],
        description: "Deep dive into bioethics, informed consent, HIPAA privacy standards, infection control, and sterile field maintenance.",
        whyItMatters: `Safe clinical delivery demands strict adherence to legal boundaries, patient dignity, and infection prevention protocols.`,
        actionableDetails: {
          miniProjectIdea: "Audit and construct an infection control and patient safety checklist conforming to WHO and Joint Commission standards.",
          githubRepoSuggestions: ["who/patient-safety-curriculum", "clinical-ethics/handbook"],
          interviewQuestions: [
            "How do you handle confidential medical disclosures when requested by insistent family members?",
            "What specific protocol do you initiate upon identifying a potential near-miss medication error?"
          ],
          keySkillsToMaster: ["HIPAA Compliance", "Infection Control", "Informed Consent", "Documentation Standards"]
        }
      },
      {
        id: "p2-pharmacology-therapeutics",
        title: "Clinical Pharmacology, Dosages & Therapeutic Administration",
        phase: phases[1],
        category: "skill",
        status: "locked",
        estimatedHours: 35,
        prerequisites: ["p1-anatomy-physiology"],
        description: "Master pharmacokinetics, pharmacodynamics, high-alert drug protocols, adverse drug reactions, and precision calculations.",
        whyItMatters: `Medication administration carries immediate patient safety consequences and requires flawless calculation and pharmacological knowledge.`,
        actionableDetails: {
          miniProjectIdea: "Develop a high-alert drug reference monograph covering therapeutic windows, contraindications, and reversal agents.",
          githubRepoSuggestions: ["clinical-pharmacology/rx-references", "openfda/drug-interactions"],
          interviewQuestions: [
            "What are your vital sign checks and contraindications prior to administering IV cardiac medications?",
            "How do you calculate pediatric weight-based emergency medication dosages under time pressure?"
          ],
          keySkillsToMaster: ["Pharmacokinetics", "Dosage Calculations", "Adverse Reactions", "High-Alert Protocols"]
        }
      },
      {
        id: "p2-clinical-skills-simulation",
        title: "Hands-On Clinical Simulation & Diagnostic Procedures",
        phase: phases[1],
        category: "project",
        status: "locked",
        estimatedHours: 40,
        prerequisites: ["p1-clinical-ethics-safety", "p1-anatomy-physiology"],
        description: "Practice patient assessment, IV access, wound debridement, cardiac rhythm interpretation, and emergency resuscitation.",
        whyItMatters: `Bridges theoretical biomedical knowledge into tactile clinical precision before entering live patient environments.`,
        actionableDetails: {
          miniProjectIdea: "Complete high-fidelity clinical simulation scenarios covering rapid response activation, telemetry monitoring, and code cart execution.",
          githubRepoSuggestions: ["nursing-simulations/scenario-guides", "resuscitation/cpr-protocols"],
          interviewQuestions: [
            "Walk me through your step-by-step actions during a sudden code blue or rapid response activation.",
            "How do you establish therapeutic communication with an agitated, disoriented patient?"
          ],
          keySkillsToMaster: ["Airway Support", "Triage Assessment", "Wound Care", "Telemetry Monitoring"]
        }
      },
      {
        id: "p3-supervised-practicum",
        title: "Supervised Clinical Rotations & Preceptorship Capstone",
        phase: phases[2],
        category: "project",
        status: "locked",
        estimatedHours: 45,
        prerequisites: ["p2-pharmacology-therapeutics", "p2-clinical-skills-simulation"],
        description: "Complete documented inpatient clinical rotations under a licensed preceptor across acute and specialty care departments.",
        whyItMatters: `The definitive proof of bedside competence and interdisciplinary teamwork required by healthcare employers.`,
        actionableDetails: {
          miniProjectIdea: "Maintain an evidence-based clinical case logbook documenting 100+ patient encounters with SBAR handover notes.",
          githubRepoSuggestions: ["clinical-placements/logbook-templates", "nursing-council/competency-framework"],
          interviewQuestions: [
            "Tell me about a complex patient case where your clinical advocacy altered the physician's care plan.",
            "How do you prioritize competing urgent orders across a multi-patient acuity assignment?"
          ],
          keySkillsToMaster: ["Bedside Care Delivery", "Multidisciplinary Rounds", "SBAR Handover", "Electronic Health Records"]
        }
      },
      {
        id: "p3-licensure-career-launch",
        title: `Professional Licensure (NCLEX / Board Exams) & Clinical Hiring for ${targetRole}`,
        phase: phases[2],
        category: "job_transition",
        status: "locked",
        estimatedHours: 20,
        prerequisites: ["p3-supervised-practicum"],
        description: "Master computerized adaptive licensure exams, credential verification, and hospital clinical panel interviews.",
        whyItMatters: `Secures official legal authorization to practice and positions you for premier clinical healthcare appointments.`,
        actionableDetails: {
          miniProjectIdea: "Complete comprehensive board practice sets and conduct simulated clinical panel interviews with peer evaluators.",
          githubRepoSuggestions: ["nclex-prep/study-blueprints", "clinical-interviews/behavioral-scenarios"],
          interviewQuestions: [
            "How do you manage emotional resilience and physical stamina after an unexpected patient loss?",
            "Describe a clinical near-miss you encountered and the corrective process you implemented."
          ],
          keySkillsToMaster: ["Licensure Question Strategy", "SBAR Communication", "Clinical Prioritization", "Hospital Rounds"]
        }
      }
    ];
  }

  // 2. LAW, REGULATION & POLICY
  else if (isLaw) {
    phases = [
      "Phase 1: Legal Systems, Constitutional Law & Statutory Interpretation",
      "Phase 2: Legal Research, Brief Drafting & Contract Negotiation",
      "Phase 3: Trial Advocacy / Regulatory Capstone & Bar Admission"
    ];
    nodes = [
      {
        id: "p1-constitutional-torts",
        title: "Constitutional Law, Torts & Statutory Interpretation",
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 25,
        prerequisites: [],
        description: "Master judicial precedent (stare decisis), constitutional doctrines, tort liability standards, and statutory canons.",
        whyItMatters: `Legal reasoning forms the bedrock of analyzing claims, advising clients, and constructing enforceable arguments in ${targetRole}.`,
        actionableDetails: {
          miniProjectIdea: "Draft comparative case briefs analyzing landmark Supreme Court and appellate holdings on procedural due process.",
          githubRepoSuggestions: ["legal-tech/open-legal-data", "case-law/brief-templates"],
          interviewQuestions: [
            "How do you resolve conflicts between statutory text and legislative intent under modern judicial canons?",
            "Explain proximate cause and the foreseeability test in complex tort claims."
          ],
          keySkillsToMaster: ["IRAC Method", "Statutory Interpretation", "Case Law Synthesis", "Tort Liability"]
        }
      },
      {
        id: "p1-legal-research-bluebook",
        title: "Legal Research (Westlaw/LexisNexis) & Citation Formats",
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 20,
        prerequisites: [],
        description: "Conduct boolean and natural-language research across federal/state reporters, KeyCite/Shepard's citators, and Bluebook formatting.",
        whyItMatters: `Attorneys and legal professionals must locate on-point controlling authority with zero tolerance for citational error.`,
        actionableDetails: {
          miniProjectIdea: "Produce a 10-page formal research memorandum addressing an emerging jurisdictional dispute with Bluebook citations.",
          githubRepoSuggestions: ["harvard-lil/cap-examples", "legal-citations/bluebook-guides"],
          interviewQuestions: [
            "How do you confirm that an authority has not been distinguished, overruled, or abrogated by later precedent?",
            "What strategies do you employ when researching a novel legal issue with no direct controlling case law in your circuit?"
          ],
          keySkillsToMaster: ["Westlaw / LexisNexis", "Shepardizing", "The Bluebook", "Boolean Legal Search"]
        }
      },
      {
        id: "p2-legal-writing-motions",
        title: "Appellate Brief Writing & Dispositive Motions",
        phase: phases[1],
        category: "project",
        status: "locked",
        estimatedHours: 35,
        prerequisites: ["p1-constitutional-torts", "p1-legal-research-bluebook"],
        description: "Draft persuasive motions to dismiss (Rule 12(b)(6)), motions for summary judgment (Rule 56), and formal appellate briefs.",
        whyItMatters: `Demonstrates the ability to distill multi-volume evidentiary records into persuasive, court-ready legal arguments.`,
        actionableDetails: {
          miniProjectIdea: "Draft a complete Motion for Summary Judgment including statement of undisputed facts, memorandum of points and authorities.",
          githubRepoSuggestions: ["courtlistener/motion-samples", "legal-writing/brief-bank"],
          interviewQuestions: [
            "How do you structure the argument section of a brief to maximize persuasive momentum?",
            "What is the standard of review applied by appellate panels to questions of law vs questions of fact?"
          ],
          keySkillsToMaster: ["Legal Writing", "Dispositive Motions", "Persuasive Advocacy", "Summary Judgment"]
        }
      },
      {
        id: "p2-contracts-transactions",
        title: "Commercial Transactions, Contracts & Risk Allocation",
        phase: phases[1],
        category: "skill",
        status: "locked",
        estimatedHours: 35,
        prerequisites: ["p1-constitutional-torts"],
        description: "Draft, redline, and negotiate representations & warranties, indemnification covenants, dispute resolution, and limitation of liability.",
        whyItMatters: `High-value legal counsel shields clients from regulatory exposure and contractual disputes before litigation occurs.`,
        actionableDetails: {
          miniProjectIdea: "Draft and redline a Master Services Agreement (MSA) with bespoke risk allocation clauses for an enterprise client.",
          githubRepoSuggestions: ["commonaccord/contract-blueprints", "open-contracts/templates"],
          interviewQuestions: [
            "How do you negotiate indemnification carve-outs for gross negligence and willful misconduct?",
            "What mechanisms do you implement to prevent ambiguous liquidated damages clauses from being struck down as penalties?"
          ],
          keySkillsToMaster: ["Contract Drafting", "Redlining", "Indemnification Clauses", "Commercial Risk"]
        }
      },
      {
        id: "p3-mock-trial-capstone",
        title: "Trial Advocacy / Regulatory Enforcement Capstone Case",
        phase: phases[2],
        category: "project",
        status: "locked",
        estimatedHours: 45,
        prerequisites: ["p2-legal-writing-motions", "p2-contracts-transactions"],
        description: "Conduct opening statements, direct and cross-examinations, expert witness voir dire, and oral closing arguments.",
        whyItMatters: `The definitive proof of courtroom readiness, composure under judicial questioning, and client advocacy.`,
        actionableDetails: {
          miniProjectIdea: "Prepare and present a complete simulated civil or regulatory trial binder including exhibit lists and evidentiary objections.",
          githubRepoSuggestions: ["moot-court/case-binders", "trial-advocacy/cross-examination-guides"],
          interviewQuestions: [
            "How do you impeach a hostile witness on cross-examination using prior inconsistent deposition testimony?",
            "Walk through your objection under Federal Rule of Evidence 403 when relevant evidence is unfairly prejudicial."
          ],
          keySkillsToMaster: ["Trial Advocacy", "Rules of Evidence", "Cross-Examination", "Oral Argument"]
        }
      },
      {
        id: "p3-bar-admission-practice",
        title: `Bar Exam Readiness, Professional Ethics (MPRE) & Legal Hiring for ${targetRole}`,
        phase: phases[2],
        category: "job_transition",
        status: "locked",
        estimatedHours: 20,
        prerequisites: ["p3-mock-trial-capstone"],
        description: "Prepare MBE/MEE bar examination components, Model Rules of Professional Conduct (ethics), and law firm callbacks.",
        whyItMatters: `Ensures legal licensure eligibility and positions you for associate appointments or corporate counsel roles.`,
        actionableDetails: {
          miniProjectIdea: "Complete comprehensive multi-state bar essay simulations and conduct partner-level mock callback interviews.",
          githubRepoSuggestions: ["bar-prep/mbe-outlines", "legal-ethics/mpre-practice"],
          interviewQuestions: [
            "How do you resolve a client-directed strategy that violates ethical obligations of candor toward the tribunal?",
            "Tell me about a high-pressure deadline where you managed conflicting case priorities."
          ],
          keySkillsToMaster: ["Model Rules of Ethics", "Bar Essay Analysis", "Client Interviewing", "Law Firm Practice"]
        }
      }
    ];
  }

  // 3. EDUCATION & TEACHING
  else if (isEducation) {
    phases = [
      "Phase 1: Educational Psychology, Learning Theories & Curriculum Standards",
      "Phase 2: Instructional Design, Differentiated Assessment & Classroom Leadership",
      "Phase 3: Student Teaching Practicum, Licensure & Educator Hiring"
    ];
    nodes = [
      {
        id: "p1-learning-psychology",
        title: "Cognitive Psychology, Developmental Stages & Pedagogy",
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 25,
        prerequisites: [],
        description: "Master Piaget, Vygotsky's Zone of Proximal Development, Bloom's Taxonomy, and neurodiversity accommodations.",
        whyItMatters: `Educators must ground instructional choices in cognitive science to foster meaningful learning for ${targetRole}.`,
        actionableDetails: {
          miniProjectIdea: "Design a developmental learning profile and accommodation matrix for diverse learner profiles across Grade levels.",
          githubRepoSuggestions: ["open-education/pedagogy-frameworks", "oer/curriculum-standards"],
          interviewQuestions: [
            "How do you scaffold high-order synthesis questions for students operating below reading proficiency?",
            "Explain how Vygotsky's social constructivism informs peer collaborative group design."
          ],
          keySkillsToMaster: ["Bloom's Taxonomy", "Universal Design for Learning (UDL)", "Cognitive Development", "Pedagogy"]
        }
      },
      {
        id: "p1-curriculum-scaffolding",
        title: "State Standards Alignment & Backward Unit Planning (UbD)",
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 20,
        prerequisites: [],
        description: "Deconstruct state/national curriculum standards into enduring understandings, essential questions, and measurable benchmarks.",
        whyItMatters: `Ensures lesson daily objectives directly ladder into mandatory district curricular outcomes and assessments.`,
        actionableDetails: {
          miniProjectIdea: "Author a complete 4-week Understanding by Design (UbD) curricular unit blueprint aligned with state standards.",
          githubRepoSuggestions: ["commoncore/standards-crosswalk", "curriculum-design/ubd-templates"],
          interviewQuestions: [
            "How do you reconcile teaching for standardized state tests while maintaining deep conceptual understanding?",
            "What process do you follow when unbundling an ambiguous curriculum standard into daily learning targets?"
          ],
          keySkillsToMaster: ["Understanding by Design", "Curriculum Mapping", "Standards Alignment", "Essential Questions"]
        }
      },
      {
        id: "p2-lesson-architecture-assessment",
        title: "Differentiated Lesson Design & Formative Assessment",
        phase: phases[1],
        category: "project",
        status: "locked",
        estimatedHours: 35,
        prerequisites: ["p1-learning-psychology", "p1-curriculum-scaffolding"],
        description: "Architect 5E instructional lesson plans with tier-one interventions, real-time formative checks, and criterion-referenced rubrics.",
        whyItMatters: `Transforms abstract learning objectives into dynamic daily classroom experiences where every student is challenged.`,
        actionableDetails: {
          miniProjectIdea: "Create a 5-day tiered lesson plan portfolio with explicit exit tickets, check-for-understanding protocols, and rubrics.",
          githubRepoSuggestions: ["lesson-plans/open-curriculum", "rubrics-bank/formative-assessments"],
          interviewQuestions: [
            "What specific instructional pivots do you execute mid-period when formative exit data indicates 40% non-mastery?",
            "How do you design single-point rubrics that encourage student self-assessment and metacognition?"
          ],
          keySkillsToMaster: ["Differentiated Instruction", "Formative Assessment", "5E Instructional Model", "Rubric Design"]
        }
      },
      {
        id: "p2-classroom-culture-leadership",
        title: "Classroom Management, Restorative Practices & Social-Emotional Learning",
        phase: phases[1],
        category: "skill",
        status: "locked",
        estimatedHours: 30,
        prerequisites: ["p1-learning-psychology"],
        description: "Establish proactive behavioral norms, de-escalation strategies, positive behavioral interventions (PBIS), and restorative circles.",
        whyItMatters: `Academic learning cannot occur without emotional safety, clear routines, and respectful classroom culture.`,
        actionableDetails: {
          miniProjectIdea: "Write an end-to-end Classroom Management & Restorative Culture Plan covering routines, praise-to-correction ratios, and family communication.",
          githubRepoSuggestions: ["pbis/classroom-systems", "restorative-practices/handbook"],
          interviewQuestions: [
            "How do you de-escalate a defiant student without disrupting the instructional rhythm of the remaining class?",
            "Describe how you partner with disengaged parents or guardians to support student growth."
          ],
          keySkillsToMaster: ["PBIS Framework", "De-escalation", "Restorative Justice", "Parent Communication"]
        }
      },
      {
        id: "p3-student-teaching-practicum",
        title: "Supervised Student Teaching Practicum & Video Portfolio",
        phase: phases[2],
        category: "project",
        status: "locked",
        estimatedHours: 45,
        prerequisites: ["p2-lesson-architecture-assessment", "p2-classroom-culture-leadership"],
        description: "Lead full-time classroom instruction under a master mentor teacher, completing instructional observations and feedback cycles.",
        whyItMatters: `The essential credentialing milestone proving live instructional competence to school principals and hiring boards.`,
        actionableDetails: {
          miniProjectIdea: "Assemble an edTPA / teaching performance assessment dossier containing recorded lessons, student work samples, and analytical reflections.",
          githubRepoSuggestions: ["edtpa/sample-commentaries", "teaching-portfolio/evidence-binders"],
          interviewQuestions: [
            "Walk me through a lesson that did not go according to plan and how you analyzed the instructional failure afterward.",
            "How do you adapt instructional delivery for English Language Learners (ELL) in a mainstream classroom?"
          ],
          keySkillsToMaster: ["Live Teaching Execution", "Instructional Reflection", "ELL Scaffolding", "edTPA Assessment"]
        }
      },
      {
        id: "p3-teaching-licensure-hire",
        title: `State Educator Certification (Praxis) & School District Hiring for ${targetRole}`,
        phase: phases[2],
        category: "job_transition",
        status: "locked",
        estimatedHours: 20,
        prerequisites: ["p3-student-teaching-practicum"],
        description: "Clear state teacher certification examinations, assemble teaching philosophy statements, and conduct demo lessons.",
        whyItMatters: `Completes legal teaching authorization and prepares you to win tenure-track positions in competitive school districts.`,
        actionableDetails: {
          miniProjectIdea: "Deliver a 20-minute live demonstration lesson before an administrator hiring panel and defend curricular choices.",
          githubRepoSuggestions: ["praxis-prep/study-guides", "teacher-interviews/demo-lesson-blueprints"],
          interviewQuestions: [
            "What is your philosophy on grading and homework, and how does it promote educational equity?",
            "Why do you want to teach in this specific school community and how will you support our school goals?"
          ],
          keySkillsToMaster: ["State Certification Exams", "Demo Lesson Delivery", "Teaching Philosophy", "Panel Interviews"]
        }
      }
    ];
  }

  // 4. FINANCE, ACCOUNTING & INVESTMENT
  else if (isFinance) {
    phases = [
      "Phase 1: Financial Statements, GAAP/IFRS & Financial Math",
      "Phase 2: Corporate Valuation, DCF Analysis & Risk Analytics",
      "Phase 3: Investment Research Capstone & CFA/CPA Credentials"
    ];
    nodes = [
      {
        id: "p1-financial-accounting",
        title: "GAAP/IFRS Financial Statements & Three-Statement Modeling",
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 25,
        prerequisites: [],
        description: "Master income statements, balance sheets, and cash flow statements with dynamic dynamic working capital and debt schedules.",
        whyItMatters: `The universal language of business. Every financial analyst and accountant must trace dollar movements across all three statements.`,
        actionableDetails: {
          miniProjectIdea: "Build a dynamically linked 3-statement financial model in Excel with historical normalization and 5-year projections.",
          githubRepoSuggestions: ["financial-modeling/excel-templates", "open-fin-data/sec-edgar-filings"],
          interviewQuestions: [
            "Walk me through how a $10 increase in depreciation flows through all three financial statements.",
            "If working capital increases by $50M, how does that impact free cash flow and cash balance?"
          ],
          keySkillsToMaster: ["3-Statement Modeling", "GAAP / IFRS", "Working Capital Schedules", "Excel Modeling"]
        }
      },
      {
        id: "p1-macro-capital-markets",
        title: "Micro/Macroeconomics, Capital Markets & Interest Rate Dynamics",
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 20,
        prerequisites: [],
        description: "Understand central bank policy, yield curve inversions, inflation dynamics, foreign exchange, and equity risk premiums.",
        whyItMatters: `Macroeconomic environment dictates discount rates, cost of capital, and capital allocation strategies for ${targetRole}.`,
        actionableDetails: {
          miniProjectIdea: "Author an economic research brief analyzing yield curve shifts, Federal Reserve rate expectations, and sector rotations.",
          githubRepoSuggestions: ["macro-data/fred-api-samples", "financial-economics/interest-rates"],
          interviewQuestions: [
            "What economic signals does an inverted Treasury yield curve convey about forward recession probabilities?",
            "How does unexpected inflation affect fixed-income bond duration and equity earnings multiples?"
          ],
          keySkillsToMaster: ["Capital Markets", "Yield Curve Analysis", "Federal Reserve Policy", "Equity Risk Premium"]
        }
      },
      {
        id: "p2-corporate-valuation-dcf",
        title: "Discounted Cash Flow (DCF), LBO & Multiples Valuation",
        phase: phases[1],
        category: "project",
        status: "locked",
        estimatedHours: 40,
        prerequisites: ["p1-financial-accounting", "p1-macro-capital-markets"],
        description: "Calculate Unlevered Free Cash Flow, WACC (CAPM), terminal value (Exit Multiple vs Gordon Growth), and sensitivity matrices.",
        whyItMatters: `The core quantitative engine utilized by investment banks, equity research, and private equity to value businesses.`,
        actionableDetails: {
          miniProjectIdea: "Build an institutional-grade DCF valuation model for an S&P 500 company complete with Monte Carlo sensitivity tables.",
          githubRepoSuggestions: ["damodaran/valuation-spreadsheets", "cfa-institute/valuation-models"],
          interviewQuestions: [
            "When would you use Gordon Growth vs Exit Multiple for terminal value, and what are the hidden assumptions of each?",
            "How do you calculate Weighted Average Cost of Capital (WACC) for a company with both convertible debt and preferred stock?"
          ],
          keySkillsToMaster: ["DCF Valuation", "WACC / CAPM", "Sensitivity Tables", "Comparable Company Multiples"]
        }
      },
      {
        id: "p2-portfolio-risk-analytics",
        title: "Modern Portfolio Theory, Risk Governance & Fixed Income",
        phase: phases[1],
        category: "skill",
        status: "locked",
        estimatedHours: 35,
        prerequisites: ["p1-macro-capital-markets"],
        description: "Analyze Sharpe ratio, Value at Risk (VaR), beta, modified duration, convexity, and portfolio rebalancing strategies.",
        whyItMatters: `High-performing finance professionals manage return per unit of downside risk to protect institutional capital.`,
        actionableDetails: {
          miniProjectIdea: "Construct an efficient frontier multi-asset portfolio optimizer comparing historical vs simulated risk-adjusted returns.",
          githubRepoSuggestions: ["quant-finance/portfolio-optimization", "open-risk/credit-risk-models"],
          interviewQuestions: [
            "Explain the difference between historical VaR and parametric VaR under non-normal fat-tailed distributions.",
            "What is bond convexity and why is positive convexity valuable to fixed-income asset managers?"
          ],
          keySkillsToMaster: ["Portfolio Theory", "Value at Risk (VaR)", "Sharpe Ratio", "Fixed Income Duration"]
        }
      },
      {
        id: "p3-investment-memo-capstone",
        title: "Institutional Investment Thesis & Presentation Capstone",
        phase: phases[2],
        category: "project",
        status: "locked",
        estimatedHours: 40,
        prerequisites: ["p2-corporate-valuation-dcf", "p2-portfolio-risk-analytics"],
        description: "Author a comprehensive 25-page initiating-coverage research report with clear BUY/HOLD/SELL recommendation and catalyst analysis.",
        whyItMatters: `The primary deliverable that lands investment banking, hedge fund, and equity research associate offers.`,
        actionableDetails: {
          miniProjectIdea: "Pitch an equity investment thesis to an investment committee with financial model, downside protections, and catalyst timeline.",
          githubRepoSuggestions: ["hedge-fund/pitch-templates", "equity-research/sample-reports"],
          interviewQuestions: [
            "Pitch me a stock in under 3 minutes: What is the variant perception that the public market is missing?",
            "If your investment thesis hinges on margin expansion, what operational headwinds could invalidate your thesis?"
          ],
          keySkillsToMaster: ["Investment Memo Writing", "Variant Perception", "Financial Modeling", "Executive Pitching"]
        }
      },
      {
        id: "p3-cfa-finance-launch",
        title: `CFA / CPA Credentialing & Institutional Finance Interviews for ${targetRole}`,
        phase: phases[2],
        category: "job_transition",
        status: "locked",
        estimatedHours: 20,
        prerequisites: ["p3-investment-memo-capstone"],
        description: "Prepare professional charter examinations (CFA/CPA), financial modeling tests under timed conditions, and technical superdays.",
        whyItMatters: `Solidifies tier-one industry credibility and clears rigorous Wall Street / corporate finance hiring bars.`,
        actionableDetails: {
          miniProjectIdea: "Complete timed financial modeling tests (LBO/DCF in 90 minutes) and participate in mock technical superdays.",
          githubRepoSuggestions: ["cfa-study/notes-and-mock-exams", "wall-street-oasis/technical-guide"],
          interviewQuestions: [
            "Walk me through an LBO: How do leverage, operational improvement, and multiple expansion generate private equity returns?",
            "What ethical obligations does a charterholder have when discovering material non-public information?"
          ],
          keySkillsToMaster: ["CFA / CPA Standards", "Timed Modeling Tests", "Accounting Technicals", "Superday Rounds"]
        }
      }
    ];
  }

  // 5. AEROSPACE & MECHANICAL ENGINEERING
  else if (isAerospace || isMechanical) {
    const isAero = isAerospace || roleLower.includes("flight") || roleLower.includes("aircraft");
    phases = [
      isAero ? "Phase 1: Engineering Mechanics, Thermodynamics & Fluid Dynamics" : "Phase 1: Statics, Dynamics, Thermodynamics & Materials Science",
      isAero ? "Phase 2: Aerodynamics, Propulsion & CAD/FEA Simulation" : "Phase 2: Machine Design, Heat Transfer & CAD/FEA Finite Element Analysis",
      isAero ? "Phase 3: Spacecraft / Aircraft Design Capstone & Aerospace Placement" : "Phase 3: Mechanical Systems Capstone, Prototyping & Engineering Placement"
    ];
    nodes = [
      {
        id: "p1-mechanics-thermo",
        title: "Engineering Mechanics, Statics & Thermodynamics",
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 25,
        prerequisites: [],
        description: "Master free-body equilibrium, stress-strain tensors, the 1st and 2nd Laws of Thermodynamics, and power cycles (Brayton/Rankine).",
        whyItMatters: `Rigorous physical laws govern structural loads, heat dissipation, and energy conservation across all mechanical systems for ${targetRole}.`,
        actionableDetails: {
          miniProjectIdea: "Calculate thermal efficiency and entropy generation across a multi-stage gas turbine or engine cycle.",
          githubRepoSuggestions: ["open-aerospace/thermo-models", "engineering-mechanics/stress-calculators"],
          interviewQuestions: [
            "Explain the difference between engineering stress and true stress in ductile metallic alloys.",
            "How does the Brayton cycle pressure ratio dictate thermal efficiency and turbine inlet temperature?"
          ],
          keySkillsToMaster: ["Thermodynamics", "Statics & Dynamics", "Stress Tensors", "Brayton Cycle"]
        }
      },
      {
        id: "p1-fluids-aerodynamics",
        title: isAero ? "Compressible Fluid Dynamics & Boundary Layer Theory" : "Fluid Mechanics, Pipe Networks & Navier-Stokes Equations",
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 25,
        prerequisites: [],
        description: "Analyze laminar and turbulent boundary layers, Reynolds numbers, Bernoulli equations, and compressible shock waves.",
        whyItMatters: `Fluid interactions dictate aerodynamic lift/drag, cooling efficiency, and pressure losses in physical aerospace hardware.`,
        actionableDetails: {
          miniProjectIdea: "Model subsonic boundary layer separation across an airfoil or pipe constriction using numerical discretization.",
          githubRepoSuggestions: ["openfoam/openfoam-tutorials", "aerodynamics/xfoil-python"],
          interviewQuestions: [
            "What triggers boundary layer separation and how does adverse pressure gradient promote stall?",
            "Explain the formation of oblique shock waves and normal shock waves in supersonic nozzles."
          ],
          keySkillsToMaster: ["Navier-Stokes", "Boundary Layers", "Reynolds Number", "Compressible Flow"]
        }
      },
      {
        id: "p2-cad-fea-simulation",
        title: "Parametric CAD (SolidWorks/NX) & Finite Element Analysis (FEA)",
        phase: phases[1],
        category: "project",
        status: "locked",
        estimatedHours: 40,
        prerequisites: ["p1-mechanics-thermo"],
        description: "Model complex 3D assemblies with geometric dimensioning & tolerancing (GD&T) and run linear/non-linear structural FEA in ANSYS.",
        whyItMatters: `Industry engineers design directly in parametric CAD and validate stress concentrations digitally prior to physical fabrication.`,
        actionableDetails: {
          miniProjectIdea: "Design an optimized aerospace bracket or engine mount in CAD and perform FEA topology optimization to minimize mass under 5g loads.",
          githubRepoSuggestions: ["ansys/fea-examples", "freecad/freecad-models"],
          interviewQuestions: [
            "How do you determine whether an FEA mesh has converged versus displaying artificial numerical singularity stress?",
            "Explain GD&T maximum material condition (MMC) and how it affects manufacturing cost."
          ],
          keySkillsToMaster: ["Parametric 3D CAD", "ANSYS FEA", "GD&T (ASME Y14.5)", "Topology Optimization"]
        }
      },
      {
        id: "p2-propulsion-aerodynamics",
        title: isAero ? "Rocket/Jet Propulsion Systems & Aerodynamic Optimization" : "Kinematics, Machine Design & Mechatronics Integration",
        phase: phases[1],
        category: "skill",
        status: "locked",
        estimatedHours: 35,
        prerequisites: ["p1-fluids-aerodynamics"],
        description: isAero ? "Evaluate convergent-divergent de Laval nozzles, specific impulse (Isp), and supersonic airfoil profiles." : "Design gear trains, shafts, bearings, linkage mechanisms, and motor controller feedback loops.",
        whyItMatters: `Core domain expertise that separates generic mechanical grads from specialized propulsion and robotics engineers.`,
        actionableDetails: {
          miniProjectIdea: isAero ? "Design a de Laval rocket nozzle contour in Python/Matlab and simulate thrust coefficient across altitude variations." : "Build a motorized 4-bar linkage mechanism with sensor feedback and dynamic torque balancing.",
          githubRepoSuggestions: ["rocket-propulsion/nozzle-design", "nasa/openvsp"],
          interviewQuestions: [
            "What causes combustion instability in liquid rocket engines, and how do injector designs dampen it?",
            "How do you calculate fatigue life and S-N curves for rotating shafts subject to cyclic bending loads?"
          ],
          keySkillsToMaster: isAero ? ["Nozzle Design", "Specific Impulse (Isp)", "XFOIL Simulation", "Combustion Thermochemistry"] : ["Machine Design", "Fatigue Analysis", "Bearings & Gears", "Mechatronics"]
        }
      },
      {
        id: "p3-aerospace-design-capstone",
        title: isAero ? "Aircraft / CubeSat Satellite Systems Engineering Capstone" : "Full-Cycle Mechanical Product Prototyping Capstone",
        phase: phases[2],
        category: "project",
        status: "locked",
        estimatedHours: 45,
        prerequisites: ["p2-cad-fea-simulation", "p2-propulsion-aerodynamics"],
        description: "Complete full systems engineering lifecycle from mission requirements, structural margin of safety, to physical prototype testing.",
        whyItMatters: `The centerpiece of your engineering portfolio demonstrating that you can build mission-critical hardware to spec.`,
        actionableDetails: {
          miniProjectIdea: "Design, simulate, and fabricate a functional CubeSat structure or mechanical mechanism with detailed test readiness review (TRR).",
          githubRepoSuggestions: ["cubesat/open-satellite-designs", "nasa/systems-engineering-handbook"],
          interviewQuestions: [
            "Walk through your margin of safety calculation for the critical structural member in your capstone design.",
            "How did your thermal vacuum or vibration testing data compare against your preliminary FEA simulations?"
          ],
          keySkillsToMaster: ["Systems Engineering", "Margin of Safety", "Vibration Testing", "Design Reviews (PDR/CDR)"]
        }
      },
      {
        id: "p3-engineering-career-launch",
        title: `Aerospace & Defense / Hardware Technical Interviews for ${targetRole}`,
        phase: phases[2],
        category: "job_transition",
        status: "locked",
        estimatedHours: 20,
        prerequisites: ["p3-aerospace-design-capstone"],
        description: "Master white-board engineering problem solving, first-principles physical intuition, and aerospace contractor defense rounds.",
        whyItMatters: `Positions you to clear grueling technical screening panels at organizations like SpaceX, NASA, Boeing, Lockheed, and premier engineering firms.`,
        actionableDetails: {
          miniProjectIdea: "Compile a 15-page visual hardware engineering portfolio highlighting CAD renders, FEA plots, and physical prototype photos.",
          githubRepoSuggestions: ["engineering-interviews/hardware-questions", "aerospace-career/portfolio-guides"],
          interviewQuestions: [
            "Estimate the mass of an uncrewed lunar lander from first principles given delta-V requirements.",
            "Why do titanium alloys offer superior strength-to-weight at elevated temperatures compared to 7075 aluminum?"
          ],
          keySkillsToMaster: ["First-Principles Thinking", "Hardware Portfolio", "ITAR Compliance", "Technical Whiteboarding"]
        }
      }
    ];
  }

  // 6. CIVIL & STRUCTURAL ENGINEERING
  else if (isCivil) {
    phases = [
      "Phase 1: Statics, Mechanics of Deformable Bodies & Geotechnical Science",
      "Phase 2: Structural Analysis, Reinforced Concrete & BIM Modeling (Revit)",
      "Phase 3: Infrastructure Capstone, Building Codes & FE/PE Licensure"
    ];
    nodes = [
      {
        id: "p1-statics-mechanics-materials",
        title: "Statics & Mechanics of Deformable Materials",
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 25,
        prerequisites: [],
        description: "Calculate shear and moment diagrams, internal beam stresses, torsion, deflection equations, and Euler column buckling.",
        whyItMatters: `Every bridge, high-rise, and foundation relies on structural mechanics to prevent catastrophic structural collapse.`,
        actionableDetails: {
          miniProjectIdea: "Calculate shear and bending moment envelopes for a continuous multi-span bridge girder under vehicular live loads.",
          githubRepoSuggestions: ["civil-engineering/structural-analysis", "open-seismo/earthquake-engineering"],
          interviewQuestions: [
            "How do you determine whether a structural truss is statically determinate, indeterminate, or unstable?",
            "Explain the difference between elastic deformation and plastic hinge formation in structural steel beams."
          ],
          keySkillsToMaster: ["Shear & Moment Diagrams", "Deflection Equations", "Column Buckling", "Stress Analysis"]
        }
      },
      {
        id: "p1-geotech-soil-mechanics",
        title: "Soil Mechanics, Geotechnical Engineering & Foundation Design",
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 20,
        prerequisites: [],
        description: "Master soil classification (USCS), effective stress, consolidation settlement, Mohr-Coulomb shear failure, and bearing capacity.",
        whyItMatters: `Structures are only as reliable as the subsurface soil transferring dead and live foundation loads.`,
        actionableDetails: {
          miniProjectIdea: "Calculate shallow and deep pile foundation bearing capacity from standard penetration test (SPT) borehole logs.",
          githubRepoSuggestions: ["geotech/soil-mechanics-scripts", "open-geotech/bearing-capacity"],
          interviewQuestions: [
            "Explain Terzaghi's effective stress principle and how pore water pressure reduces soil shear strength.",
            "What factors govern consolidation settlement in saturated cohesive clay layers?"
          ],
          keySkillsToMaster: ["Soil Mechanics", "Bearing Capacity", "Settlement Analysis", "Foundation Design"]
        }
      },
      {
        id: "p2-structural-steel-concrete",
        title: "Reinforced Concrete (ACI 318) & Structural Steel Design (AISC)",
        phase: phases[1],
        category: "project",
        status: "locked",
        estimatedHours: 40,
        prerequisites: ["p1-statics-mechanics-materials", "p1-geotech-soil-mechanics"],
        description: "Design reinforced concrete beams, columns, two-way slabs, and structural steel bolted/welded connections under ASCE 7 load combinations.",
        whyItMatters: `Demonstrates mastery of national building codes required by professional engineering consulting firms.`,
        actionableDetails: {
          miniProjectIdea: "Design and size all structural members and rebar schedules for a 4-story reinforced concrete commercial building frame.",
          githubRepoSuggestions: ["structural-codes/aci-318-design", "aisc/steel-construction-manual"],
          interviewQuestions: [
            "Why do building codes require under-reinforced concrete beams rather than over-reinforced sections?",
            "How do you design structural steel moment connections to resist seismic drift without brittle fracture?"
          ],
          keySkillsToMaster: ["ACI 318 Concrete", "AISC Steel Manual", "Load Combinations (ASCE 7)", "Rebar Detailing"]
        }
      },
      {
        id: "p2-bim-revit-modeling",
        title: "BIM Modeling with Autodesk Revit & Civil 3D",
        phase: phases[1],
        category: "skill",
        status: "locked",
        estimatedHours: 35,
        prerequisites: ["p1-statics-mechanics-materials"],
        description: "Build coordinated 3D Building Information Models (BIM), structural framing plans, civil site grading, and clash detection in Navisworks.",
        whyItMatters: `Modern architecture, engineering, and construction (AEC) firms require seamless digital BIM coordination across trades.`,
        actionableDetails: {
          miniProjectIdea: "Develop a complete structural BIM model in Autodesk Revit with coordinated sheet sets, schedules, and structural details.",
          githubRepoSuggestions: ["autodesk/revit-sample-projects", "dynamo-ds/dynamo-revit"],
          interviewQuestions: [
            "How do you coordinate structural models with MEP and architectural trades to prevent on-site clashes?",
            "Explain the difference between geometric Level of Development (LOD 300) vs LOD 400 fabrication models."
          ],
          keySkillsToMaster: ["Autodesk Revit", "Civil 3D", "Clash Detection", "Construction Documentation"]
        }
      },
      {
        id: "p3-infrastructure-capstone",
        title: "Major Infrastructure Design Capstone Project",
        phase: phases[2],
        category: "project",
        status: "locked",
        estimatedHours: 45,
        prerequisites: ["p2-structural-steel-concrete", "p2-bim-revit-modeling"],
        description: "Design an entire infrastructure asset (e.g. cable-stayed bridge, municipal stormwater network, or multi-story hospital structure).",
        whyItMatters: `The flagship portfolio centerpiece demonstrating full project execution from site surveying to stamped calculation packages.`,
        actionableDetails: {
          miniProjectIdea: "Produce a 50-page professional calculation package and drawing set for a municipal infrastructure project reviewed by PE mentors.",
          githubRepoSuggestions: ["civil-capstone/sample-calculation-packages", "fhwa/bridge-design-drawings"],
          interviewQuestions: [
            "Walk through how your design accounts for 100-year seismic and wind gust load combinations.",
            "How do you incorporate sustainable materials and life-cycle cost analysis into municipal infrastructure bids?"
          ],
          keySkillsToMaster: ["Infrastructure Design", "Calculations Packages", "Code Compliance", "Seismic Design"]
        }
      },
      {
        id: "p3-civil-fe-pe-launch",
        title: `Fundamentals of Engineering (FE/EIT) Exam & Civil Engineering Hiring for ${targetRole}`,
        phase: phases[2],
        category: "job_transition",
        status: "locked",
        estimatedHours: 20,
        prerequisites: ["p3-infrastructure-capstone"],
        description: "Pass the NCEES FE Civil exam to earn Engineer-in-Training (EIT) certification and master EPC consultancy technical interviews.",
        whyItMatters: `EIT certification is the legally required stepping stone toward Professional Engineer (PE) licensure and career advancement.`,
        actionableDetails: {
          miniProjectIdea: "Complete full-length simulated FE Civil examinations and conduct technical interviews defending structural calculations.",
          githubRepoSuggestions: ["ncees/fe-civil-reference-handbook", "civil-interviews/technical-questions"],
          interviewQuestions: [
            "Explain the ethical responsibility of a licensed Professional Engineer when safety compromises are pressured by a client.",
            "How do you handle unforeseen subsurface site conditions during active foundation excavation?"
          ],
          keySkillsToMaster: ["FE Civil Exam (NCEES)", "EIT Credential", "Engineering Ethics", "Consulting Interviews"]
        }
      }
    ];
  }

  // 7. ARTS, GRAPHIC DESIGN & CREATIVE MEDIA
  else if (isDesign) {
    phases = [
      "Phase 1: Visual Communication, Color Theory & Grid-Based Typography",
      "Phase 2: Vector Illustration, Brand Identity Systems & Figma Design Tokens",
      "Phase 3: Professional Client Portfolio & Agency Review"
    ];
    nodes = [
      {
        id: "p1-visual-communication-grids",
        title: "Visual Communication, Gestalt Principles & Grid Systems",
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 25,
        prerequisites: [],
        description: "Master optical balance, figure-ground contrast, hierarchical visual pacing, and Swiss modular grid layouts.",
        whyItMatters: `Visual design is communication, not decoration. Every layout must effortlessly direct viewer attention in ${targetRole}.`,
        actionableDetails: {
          miniProjectIdea: "Design a series of 12 editorial print and digital posters exploring Gestalt principles using limited color palettes and strict grids.",
          githubRepoSuggestions: ["design-resources/swiss-style-grids", "typography/specimen-sheets"],
          interviewQuestions: [
            "How do Gestalt grouping principles influence how a user scans an information-dense interface or editorial page?",
            "When is it justified to intentionally break a mathematical grid in a layout?"
          ],
          keySkillsToMaster: ["Gestalt Psychology", "Modular Grids", "Visual Hierarchy", "Composition"]
        }
      },
      {
        id: "p1-typography-mastery",
        title: "Type Anatomy, Kerning & Typographic Hierarchy",
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 20,
        prerequisites: [],
        description: "Deep dive into serif/sans classifications, variable fonts, optical kerning, x-height, leading ratios, and typographic contrast.",
        whyItMatters: `Typography constitutes 90% of visual communication and immediately signals amateur vs elite design craftsmanship.`,
        actionableDetails: {
          miniProjectIdea: "Author and typeset a 24-page experimental typography specimen booklet showcasing contrasting type pairings and font hierarchies.",
          githubRepoSuggestions: ["google/fonts-knowledge", "typography/type-pairing-guides"],
          interviewQuestions: [
            "How do x-height and aperture size affect typeface legibility at small sizes on low-resolution displays?",
            "What mathematical rules do you apply when calculating modular scale line-heights across heading levels?"
          ],
          keySkillsToMaster: ["Type Anatomy", "Modular Scales", "Font Pairing", "Micro-Typography"]
        }
      },
      {
        id: "p2-brand-identity-systems",
        title: "Comprehensive Brand Identity & Visual Guidelines",
        phase: phases[1],
        category: "project",
        status: "locked",
        estimatedHours: 40,
        prerequisites: ["p1-visual-communication-grids", "p1-typography-mastery"],
        description: "Develop logo marks, bespoke color harmonies, iconography sets, voice guidelines, and comprehensive 50-page brand books.",
        whyItMatters: `Top-tier clients and studios hire designers who build cohesive, extensible brand systems rather than isolated logos.`,
        actionableDetails: {
          miniProjectIdea: "Build an end-to-end brand identity system for a challenger consumer brand complete with style guide and packaging prototypes.",
          githubRepoSuggestions: ["brand-guidelines/open-brand-books", "figma/design-tokens-starter"],
          interviewQuestions: [
            "Walk me through your process for pressure-testing a logo mark across 16px favicons to building-scale billboards.",
            "How do you defend a bold brand redesign to a risk-averse client leadership team?"
          ],
          keySkillsToMaster: ["Brand Guidelines", "Logo Construction", "Color Harmonies", "Packaging Design"]
        }
      },
      {
        id: "p2-figma-design-systems",
        title: "Figma Component Architecture & Design Systems",
        phase: phases[1],
        category: "skill",
        status: "locked",
        estimatedHours: 35,
        prerequisites: ["p1-visual-communication-grids"],
        description: "Master auto-layout, component variants, nested properties, design tokens, and accessible WCAG color contrast states.",
        whyItMatters: `Modern product studios require designers who can architect scalable, dev-ready component libraries.`,
        actionableDetails: {
          miniProjectIdea: "Construct an accessible, multi-theme design system in Figma containing 40+ atomic components and interactive prototypes.",
          githubRepoSuggestions: ["figma/community-design-systems", "radix-ui/primitives-figma"],
          interviewQuestions: [
            "How do you organize design tokens across semantic layers (global, alias, component) to support dark mode?",
            "Explain how you conduct WCAG 2.1 AA accessibility contrast audits on brand color palettes."
          ],
          keySkillsToMaster: ["Figma Auto-Layout", "Design Tokens", "Component Variants", "WCAG Accessibility"]
        }
      },
      {
        id: "p3-flagship-portfolio-case-studies",
        title: "Flagship Professional Portfolio & Case Study Dossier",
        phase: phases[2],
        category: "project",
        status: "locked",
        estimatedHours: 45,
        prerequisites: ["p2-brand-identity-systems", "p2-figma-design-systems"],
        description: "Curate 3-4 deep-dive case studies detailing discovery research, discarded sketches, iterative critique, and final impact metrics.",
        whyItMatters: `Your portfolio is the single determining factor in landing high-paying studio appointments and freelance commissions.`,
        actionableDetails: {
          miniProjectIdea: "Launch a live, beautifully animated web portfolio showcasing 3 comprehensive case studies with process videos.",
          githubRepoSuggestions: ["portfolio/creative-portfolio-templates", "case-studies/design-writeups"],
          interviewQuestions: [
            "Walk me through the most significant strategic compromise you had to make in your flagship case study.",
            "How did user feedback or client critique fundamentally alter your initial creative direction?"
          ],
          keySkillsToMaster: ["Case Study Storytelling", "Creative Direction", "Portfolio Presentation", "Process Documentation"]
        }
      },
      {
        id: "p3-design-critique-hire",
        title: `Design Critique Panels, Creative Reviews & Agency Hiring for ${targetRole}`,
        phase: phases[2],
        category: "job_transition",
        status: "locked",
        estimatedHours: 20,
        prerequisites: ["p3-flagship-portfolio-case-studies"],
        description: "Master live portfolio walkthroughs, white-board design challenges, receiving constructive critique, and fee negotiation.",
        whyItMatters: `Transforms visual talent into executive confidence during high-stakes agency partner interviews.`,
        actionableDetails: {
          miniProjectIdea: "Conduct live timed design critique rounds with senior creative directors and refine project pitches.",
          githubRepoSuggestions: ["design-interview/whiteboard-challenges", "creative-contracts/freelance-agreements"],
          interviewQuestions: [
            "How do you handle direct criticism from an executive who dislikes a design you spent three weeks perfecting?",
            "What is your approach to scoping creative briefs and managing scope creep during client engagements?"
          ],
          keySkillsToMaster: ["Design Critique Defense", "Whiteboard Challenges", "Creative Pitching", "Freelance Scoping"]
        }
      }
    ];
  }

  // 8. CULINARY ARTS & HOSPITALITY
  else if (isCulinary) {
    phases = [
      "Phase 1: Food Safety (HACCP), Knife Skills & Classical Mother Sauces",
      "Phase 2: Advanced Cooking Methods, Flavor Lineage & Kitchen Brigade Operations",
      "Phase 3: Menu Engineering, Food Cost Economics & Executive Chef Tasting Auditions"
    ];
    nodes = [
      {
        id: "p1-sanitation-knife-skills",
        title: "HACCP Food Safety, Station Sanitation & Precision Knife Cuts",
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 25,
        prerequisites: [],
        description: "Master ServSafe/HACCP temperature danger zones, cross-contamination prevention, station mise en place, and classic French knife cuts (brunoise, julienne, chiffonade).",
        whyItMatters: `Food safety protects lives and impeccable knife precision guarantees uniform cooking times across high-volume restaurant services.`,
        actionableDetails: {
          miniProjectIdea: "Execute a timed precision knife skills practical test and author a compliant HACCP kitchen sanitation logbook.",
          githubRepoSuggestions: ["culinary-resources/knife-skills-guide", "food-safety/haccp-manual"],
          interviewQuestions: [
            "What are the critical control points (CCPs) and corrective actions when cooling hot stocks from 135°F to 41°F?",
            "How do you maintain blade geometry and stone sharpening angles on carbon vs stainless steel chef knives?"
          ],
          keySkillsToMaster: ["HACCP Certification", "Knife Skills", "Mise en Place", "Cross-Contamination Prevention"]
        }
      },
      {
        id: "p1-stocks-mother-sauces",
        title: "Classical Stock Production & The Five French Mother Sauces",
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 20,
        prerequisites: [],
        description: "Master gelatin extraction from roasted veal/poultry bones, clarifying stocks, and executing Béchamel, Velouté, Espagnole, Hollandaise, and Sauce Tomat.",
        whyItMatters: `Sauces are the foundation of classical cuisine and demonstrate thermal control, emulsion stability, and seasoning balance.`,
        actionableDetails: {
          miniProjectIdea: "Prepare and plate a mother sauce lineage showcase with warm and cold emulsion stability testing.",
          githubRepoSuggestions: ["culinary-arts/classical-sauces", "food-science/emulsion-stability"],
          interviewQuestions: [
            "How do you rescue a broken Hollandaise or Béarnaise emulsion without altering the flavor profile?",
            "What is the difference between brown veal stock and a reduction glace de viande in terms of gelatin yield?"
          ],
          keySkillsToMaster: ["Mother Sauces", "Stock Extraction", "Emulsions", "Seasoning Calibration"]
        }
      },
      {
        id: "p2-cooking-techniques",
        title: "Advanced Heat Transfer, Braising, Roasting & Sous-Vide Execution",
        phase: phases[1],
        category: "project",
        status: "locked",
        estimatedHours: 40,
        prerequisites: ["p1-sanitation-knife-skills", "p1-stocks-mother-sauces"],
        description: "Master Maillard reaction development, connective tissue gelatinization, precision protein core temperatures, and immersion circulator cooking.",
        whyItMatters: `Separates basic line cooks from skilled chefs capable of executing consistent proteins under high cover counts.`,
        actionableDetails: {
          miniProjectIdea: "Execute a multi-protein cooking trial documenting internal temperature curves, carryover cooking, and texture yields.",
          githubRepoSuggestions: ["modernist-cuisine/sous-vide-tables", "meat-science/protein-temperatures"],
          interviewQuestions: [
            "How does carryover cooking vary between high-heat roasting vs low-temperature immersion water baths?",
            "Explain collagen breakdown into gelatin in tough secondary cuts and how braising liquids facilitate this."
          ],
          keySkillsToMaster: ["Maillard Reaction", "Sous-Vide Precision", "Braising", "Thermal Carryover"]
        }
      },
      {
        id: "p2-kitchen-brigade-operations",
        title: "Line Operations, Ticket Expediting & High-Volume Brigade Systems",
        phase: phases[1],
        category: "skill",
        status: "locked",
        estimatedHours: 35,
        prerequisites: ["p1-sanitation-knife-skills"],
        description: "Operate sauté, grill, and garde-manger stations during peak dinner rushes, master verbal call-and-response, and ticket timing.",
        whyItMatters: `High-end kitchens operate like synchronized military units; chefs must maintain composure under intense time and heat pressure.`,
        actionableDetails: {
          miniProjectIdea: "Simulate a 50-cover dinner service expediting station managing multi-course ticket synchronization across stations.",
          githubRepoSuggestions: ["kitchen-operations/brigade-system", "restaurant-management/ticket-flow"],
          interviewQuestions: [
            "How do you prioritize station tickets when two tables fire simultaneously with different cook-time proteins?",
            "What immediate steps do you take when a station cook falls 15 minutes behind during a Friday night peak service?"
          ],
          keySkillsToMaster: ["Expediting", "Station Management", "Brigade Communication", "Timing Synchronization"]
        }
      },
      {
        id: "p3-menu-cost-engineering",
        title: "Menu Engineering, Yield Testing & Food Cost Economics",
        phase: phases[2],
        category: "project",
        status: "locked",
        estimatedHours: 40,
        prerequisites: ["p2-cooking-techniques", "p2-kitchen-brigade-operations"],
        description: "Design seasonal tasting menus, calculate edible portion (EP) vs as-purchased (AP) yields, and maintain strict 28% food cost margins.",
        whyItMatters: `Executive chefs must combine culinary artistry with business profitability to ensure long-term restaurant viability.`,
        actionableDetails: {
          miniProjectIdea: "Design a 5-course seasonal tasting menu complete with butcher's yield sheets, plate cost breakdown, and vendor order guides.",
          githubRepoSuggestions: ["restaurant-economics/menu-costing-sheets", "culinary-math/yield-calculators"],
          interviewQuestions: [
            "How do you maintain menu profitability when core protein commodity prices spike 20% in a quarter?",
            "Explain butcher's yield percentage and how you utilize secondary trimmings to improve cost margins."
          ],
          keySkillsToMaster: ["Food Cost Calculations", "Yield Testing (AP vs EP)", "Menu Engineering", "Vendor Negotiations"]
        }
      },
      {
        id: "p3-chef-tasting-audition",
        title: `Executive Chef Tasting Audition & Culinary Leadership for ${targetRole}`,
        phase: phases[2],
        category: "job_transition",
        status: "locked",
        estimatedHours: 20,
        prerequisites: ["p3-menu-cost-engineering"],
        description: "Prepare and execute a multi-course mystery basket tasting audition before restaurant owners, defend food cost, and lead kitchen staff.",
        whyItMatters: `The live cooking audition is the definitive hiring barrier for executive chef and head kitchen appointments.`,
        actionableDetails: {
          miniProjectIdea: "Execute a 3-course mystery box culinary tasting for guest culinary evaluators within a strict 90-minute time constraint.",
          githubRepoSuggestions: ["culinary-auditions/tasting-rubrics", "chef-interviews/mystery-basket-prep"],
          interviewQuestions: [
            "How do you build a kitchen culture of zero tolerance for toxicity while maintaining exacting culinary standards?",
            "Walk me through your dish concept: What flavor balance (acid, fat, salt, heat) were you aiming to achieve?"
          ],
          keySkillsToMaster: ["Tasting Audition Execution", "Brigade Leadership", "Culinary Philosophy", "Live Plating"]
        }
      }
    ];
  }

  // 9. BUSINESS, MARKETING & MANAGEMENT
  else if (isBusiness) {
    phases = [
      "Phase 1: Market Research, Customer Segmentation & Unit Economics",
      "Phase 2: Growth Strategy, Sales Pipeline & Multi-Channel Campaign Analytics",
      "Phase 3: Strategic Go-To-Market (GTM) Capstone & Executive Leadership"
    ];
    nodes = [
      {
        id: "p1-market-research-segmentation",
        title: "Market Sizing (TAM/SAM/SOM) & Customer Discovery",
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 25,
        prerequisites: [],
        description: "Conduct qualitative customer interviews, survey design, competitive landscape mapping, and quantitative total addressable market sizing.",
        whyItMatters: `Strategic business decisions require rigorous market evidence rather than executive intuition for ${targetRole}.`,
        actionableDetails: {
          miniProjectIdea: "Conduct 15 customer discovery interviews and synthesize findings into an ICP (Ideal Customer Profile) and TAM model.",
          githubRepoSuggestions: ["market-research/tam-sam-som-models", "customer-discovery/interview-scripts"],
          interviewQuestions: [
            "How do you calculate top-down vs bottom-up TAM, and why do investors prefer bottom-up methodologies?",
            "What questioning techniques prevent confirmation bias during early customer discovery interviews?"
          ],
          keySkillsToMaster: ["TAM Sizing", "Customer Discovery", "Competitive Analysis", "ICP Definition"]
        }
      },
      {
        id: "p1-unit-economics-pricing",
        title: "Unit Economics, Pricing Strategy & Financial Metrics",
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 20,
        prerequisites: [],
        description: "Analyze Customer Acquisition Cost (CAC), Lifetime Value (LTV), payback periods, gross margins, and value-based pricing tiers.",
        whyItMatters: `Commercial leaders must demonstrate that every marketing dollar generates profitable, sustainable revenue.`,
        actionableDetails: {
          miniProjectIdea: "Build a financial unit economics model stress-testing LTV/CAC ratios across varying churn and expansion revenue scenarios.",
          githubRepoSuggestions: ["saas-metrics/ltv-cac-calculators", "pricing-strategy/models"],
          interviewQuestions: [
            "If customer payback period expands from 8 months to 18 months, what immediate strategic levers do you adjust?",
            "Explain the difference between cost-plus pricing, competitor-based pricing, and value-based pricing."
          ],
          keySkillsToMaster: ["LTV / CAC Calculation", "Unit Economics", "Payback Periods", "Pricing Strategy"]
        }
      },
      {
        id: "p2-gtm-funnel-analytics",
        title: "Omnichannel Acquisition, Funnel Analytics & Conversion Rate Optimization",
        phase: phases[1],
        category: "project",
        status: "locked",
        estimatedHours: 35,
        prerequisites: ["p1-market-research-segmentation", "p1-unit-economics-pricing"],
        description: "Architect multi-touch attribution models, lead scoring mechanisms, conversion funnels, and retention cohort heatmaps.",
        whyItMatters: `Separates theoretical strategists from operators who can predictably generate qualified pipeline and scale revenues.`,
        actionableDetails: {
          miniProjectIdea: "Launch a live test acquisition campaign and build an attribution dashboard tracking conversion drop-offs across funnel stages.",
          githubRepoSuggestions: ["growth-marketing/attribution-models", "funnel-analytics/dashboards"],
          interviewQuestions: [
            "Compare first-touch, last-touch, and W-shaped attribution models for enterprise B2B sales cycles.",
            "How do you diagnose whether low pipeline conversion stems from top-of-funnel lead quality vs sales execution?"
          ],
          keySkillsToMaster: ["Funnel Analytics", "Attribution Modeling", "Conversion Optimization (CRO)", "Cohort Analysis"]
        }
      },
      {
        id: "p2-pipeline-sales-negotiation",
        title: "Pipeline Management, Enterprise Sales (MEDDIC) & Negotiation",
        phase: phases[1],
        category: "skill",
        status: "locked",
        estimatedHours: 30,
        prerequisites: ["p1-unit-economics-pricing"],
        description: "Master enterprise discovery, MEDDIC qualification, economic buyer engagement, objection handling, and contract negotiation.",
        whyItMatters: `High-value revenue outcomes depend on disciplined deal execution and closing large commercial agreements.`,
        actionableDetails: {
          miniProjectIdea: "Draft a comprehensive enterprise sales playbook featuring discovery call frameworks and multi-stakeholder negotiation strategies.",
          githubRepoSuggestions: ["sales-playbooks/meddic-templates", "negotiation/deal-review-frameworks"],
          interviewQuestions: [
            "Walk through how you uncover the true Economic Buyer and Decision Criteria in a complex enterprise account.",
            "How do you negotiate multi-year contract renewals without offering destructive discounting concessions?"
          ],
          keySkillsToMaster: ["MEDDIC Methodology", "Enterprise Discovery", "Contract Negotiation", "Pipeline Management"]
        }
      },
      {
        id: "p3-commercial-strategy-capstone",
        title: "Comprehensive Go-To-Market (GTM) Strategy & Executive Pitch",
        phase: phases[2],
        category: "project",
        status: "locked",
        estimatedHours: 45,
        prerequisites: ["p2-gtm-funnel-analytics", "p2-pipeline-sales-negotiation"],
        description: "Author a complete GTM launch plan including positioning, sales enablement, marketing spend allocation, and 12-month revenue forecasts.",
        whyItMatters: `The definitive executive portfolio piece proving readiness for Director, VP, and General Management responsibilities.`,
        actionableDetails: {
          miniProjectIdea: "Pitch a board-level Go-To-Market expansion strategy complete with risk mitigation and revenue projections.",
          githubRepoSuggestions: ["gtm-playbooks/launch-strategies", "board-decks/executive-presentations"],
          interviewQuestions: [
            "Present your GTM plan: What is the highest-risk assumption in your model and how will you validate it in the first 60 days?",
            "How do you align product development priorities with commercial sales pipeline commitments?"
          ],
          keySkillsToMaster: ["Go-To-Market Strategy", "Revenue Forecasting", "Board Pitching", "Cross-Functional Leadership"]
        }
      },
      {
        id: "p3-business-leadership-hire",
        title: `Executive Interview Mastery, Case Studies & Leadership Hiring for ${targetRole}`,
        phase: phases[2],
        category: "job_transition",
        status: "locked",
        estimatedHours: 20,
        prerequisites: ["p3-commercial-strategy-capstone"],
        description: "Master behavioral leadership interviews, commercial business case studies, P&L ownership defense, and executive offer negotiation.",
        whyItMatters: `Converts operational excellence into executive appointments and compensation packages.`,
        actionableDetails: {
          miniProjectIdea: "Complete live timed business case study presentations defending P&L trade-offs before executive mentors.",
          githubRepoSuggestions: ["case-interviews/business-frameworks", "executive-leadership/interview-guides"],
          interviewQuestions: [
            "Describe a time you had to pivot commercial strategy under unexpected market disruption.",
            "How do you build team accountability without stifling creative experimentation and risk-taking?"
          ],
          keySkillsToMaster: ["Commercial Case Studies", "P&L Management", "Executive Communication", "Offer Negotiation"]
        }
      }
    ];
  }

  // 10. SOFTWARE, AI & TECHNOLOGY (When user genuinely enters tech roles)
  else if (isClimate || isAI || isSecurity || isSoftware) {
    phases = [
      `Phase 1: Foundational Systems & Core Stack for ${targetRole}`,
      `Phase 2: Advanced Architecture, Domain Services & Production Engineering`,
      `Phase 3: Flagship Portfolio Platform & Senior Technical Transition`
    ];
    nodes = [
      {
        id: "p1-core-architecture",
        title: `Core Architectural Principles & Clean Engineering for ${targetRole}`,
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 25,
        prerequisites: [],
        description: `Establish mastery of clean architecture, data structures, type safety, and test-driven development tailored to ${targetRole}.`,
        whyItMatters: `Ensures all code you write demonstrates industry-standard quality, maintainability, and design patterns.`,
        actionableDetails: {
          miniProjectIdea: `Construct a modular, type-safe architecture boilerplate with automated test coverage tailored to ${targetRole}.`,
          githubRepoSuggestions: ["goldbergyoni/nodebestpractices", "kamranahmedse/developer-roadmap"],
          interviewQuestions: [
            `What core design trade-offs do you prioritize when beginning a greenfield project for ${targetRole}?`,
            "How do you enforce code maintainability across distributed cross-functional teams?"
          ],
          keySkillsToMaster: ["System Architecture", "Clean Code", "Design Patterns", "Unit Testing"]
        }
      },
      {
        id: "p1-tooling-automation",
        title: "Modern DevOps, CI/CD & Observability",
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 20,
        prerequisites: [],
        description: "Automate code quality, containerized builds, and deployment pipelines with GitHub Actions and Docker.",
        whyItMatters: `Top-tier employers expect candidates to ship tested software independently without relying on dedicated DevOps teams.`,
        actionableDetails: {
          miniProjectIdea: "Configure a multi-stage Docker build with zero-vulnerability security scanning and automated preview deployments.",
          githubRepoSuggestions: ["actions/starter-workflows", "docker/awesome-compose"],
          interviewQuestions: [
            "How do you minimize Docker image layer cache invalidation during CI builds?",
            "Explain semantic versioning and changelog automation via conventional commits."
          ],
          keySkillsToMaster: ["Docker", "GitHub Actions", "ESLint / Prettier", "Semantic Release"]
        }
      },
      {
        id: "p2-domain-deep-dive",
        title: `Specialized Core Competencies for ${targetRole}`,
        phase: phases[1],
        category: "skill",
        status: "locked",
        estimatedHours: 35,
        prerequisites: ["p1-core-architecture"],
        description: `Deep-dive into the primary specialized frameworks, algorithms, and protocols expected of elite ${targetRole} practitioners.`,
        whyItMatters: `Directly targets the required skills section in job descriptions for your target role.`,
        actionableDetails: {
          miniProjectIdea: `Build a production-tested module solving a complex real-world bottleneck specific to ${targetRole}.`,
          githubRepoSuggestions: ["public-apis/public-apis", "awesome-selfhosted/awesome-selfhosted"],
          interviewQuestions: [
            `Describe a scenario where standard libraries failed you and you had to build a custom solution for ${targetRole}.`,
            "How do you measure latency and throughput bottlenecks under production load?"
          ],
          keySkillsToMaster: ["Specialized Tooling", "Performance Profiling", "State Management", "API Design"]
        }
      },
      {
        id: "p2-capstone-service",
        title: "Scalable Microservice & Database Engineering",
        phase: phases[1],
        category: "project",
        status: "locked",
        estimatedHours: 35,
        prerequisites: ["p1-core-architecture", "p1-tooling-automation"],
        description: "Implement distributed caching, relational indexing, and resilient messaging patterns under high concurrency.",
        whyItMatters: `Demonstrates that your technical vision extends beyond single-file scripts into production systems.`,
        actionableDetails: {
          miniProjectIdea: "Build an event-driven notification or analytics service utilizing Redis caching and PostgreSQL transactions.",
          githubRepoSuggestions: ["redis/redis-om-node", "prisma/prisma-examples"],
          interviewQuestions: [
            "How do you resolve database deadlocks and race conditions in concurrent write scenarios?",
            "What is cache stampede and how do you prevent it using mutexes or probabilistic early expiration?"
          ],
          keySkillsToMaster: ["PostgreSQL / SQLite", "Redis", "Transaction Isolation", "Index Optimization"]
        }
      },
      {
        id: "p3-showcase-application",
        title: `Flagship Full-Lifecycle Portfolio Platform for ${targetRole}`,
        phase: phases[2],
        category: "project",
        status: "locked",
        estimatedHours: 40,
        prerequisites: ["p2-domain-deep-dive", "p2-capstone-service"],
        description: `Design and launch an end-to-end, live-deployed platform demonstrating your full readiness for ${targetRole}.`,
        whyItMatters: `The definitive proof point on your resume that bypasses generic hiring filters and lands interviews.`,
        actionableDetails: {
          miniProjectIdea: `Deploy a production web application with real users, live telemetry, public documentation, and a recorded demo video.`,
          githubRepoSuggestions: ["vercel/platforms", "shadcn-ui/ui"],
          interviewQuestions: [
            "Walk me through the most difficult architectural trade-off in your flagship project.",
            "If your active user base grew 100x tomorrow, which layer would fail first and how would you re-architect it?"
          ],
          keySkillsToMaster: ["Full-Stack Architecture", "Monitoring", "Cloud Deployment", "Documentation"]
        }
      },
      {
        id: "p3-career-launch",
        title: `Hiring Pipeline & Technical System Design Mastery for ${targetRole}`,
        phase: phases[2],
        category: "job_transition",
        status: "locked",
        estimatedHours: 20,
        prerequisites: ["p3-showcase-application"],
        description: "Polish technical resume, reverse-interview hiring managers, and master behavioral and architectural interviews.",
        whyItMatters: `Transforms technical excellence into signed job offers with maximum compensation leverage.`,
        actionableDetails: {
          miniProjectIdea: "Conduct mock technical interviews, build a tailored portfolio website, and outreach directly to 15 engineering leads.",
          githubRepoSuggestions: ["jwasham/coding-interview-university"],
          interviewQuestions: [
            "Tell me about a time you had a technical disagreement with a teammate and how you resolved it.",
            "What questions do you ask us to evaluate our engineering culture and technical debt management?"
          ],
          keySkillsToMaster: ["Behavioral STAR Method", "Resume Optimization", "System Design Rounds", "Negotiation"]
        }
      }
    ];
  }

  // 11. UNIVERSAL ADAPTIVE DOMAIN ENGINE (For any other career without technical assumptions)
  else {
    phases = [
      `Phase 1: Foundational Principles, Scientific Theories & Standards for ${targetRole}`,
      `Phase 2: Applied Methodologies, Industry Practice & Practical Case Studies`,
      `Phase 3: Flagship Professional Portfolio, Licensure & Career Placement`
    ];
    nodes = [
      {
        id: "p1-core-theory",
        title: `Core Principles, Scientific Foundations & Professional Knowledge in ${targetRole}`,
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 25,
        prerequisites: [],
        description: `Establish an uncompromising mastery of the foundational scientific, analytical, and professional theories of ${targetRole}.`,
        whyItMatters: `Provides the theoretical grounding and analytical rigor required to understand complex domain challenges in ${targetRole}.`,
        actionableDetails: {
          miniProjectIdea: `Author an analytical foundational study deconstructing the primary methodologies and standards used in ${targetRole}.`,
          githubRepoSuggestions: ["open-knowledge/domain-foundations", "academic-resources/methodology-guides"],
          interviewQuestions: [
            `What are the core foundational principles that guide decision-making for a professional ${targetRole}?`,
            `How do you stay current with advancing industry standards and research in ${targetRole}?`
          ],
          keySkillsToMaster: ["Core Principles", "Domain Standards", "Critical Analysis", "Methodology"]
        }
      },
      {
        id: "p1-regulations-ethics",
        title: `Professional Ethics, Industry Standards & Compliance Frameworks`,
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 20,
        prerequisites: [],
        description: `Understand the legal frameworks, regulatory compliance mandates, quality standards, and ethical codes of conduct for ${targetRole}.`,
        whyItMatters: `Ensures all professional practice adheres to legal mandates, client protections, and industry trust.`,
        actionableDetails: {
          miniProjectIdea: `Conduct a regulatory and ethical compliance audit covering operational protocols and risk mitigation in ${targetRole}.`,
          githubRepoSuggestions: ["ethics-institute/professional-conduct", "compliance-guides/standards"],
          interviewQuestions: [
            `Describe how you navigate an ethical dilemma when client or organizational pressures conflict with professional codes of conduct.`,
            `What regulatory oversight bodies govern practice in ${targetRole} and how do you ensure adherence?`
          ],
          keySkillsToMaster: ["Professional Ethics", "Regulatory Compliance", "Risk Management", "Quality Standards"]
        }
      },
      {
        id: "p2-applied-methods",
        title: `Advanced Diagnostic, Technical & Applied Methodologies in ${targetRole}`,
        phase: phases[1],
        category: "skill",
        status: "locked",
        estimatedHours: 35,
        prerequisites: ["p1-core-theory"],
        description: `Deep-dive into the primary specialized tools, techniques, diagnostics, and operational workflows expected of elite ${targetRole} practitioners.`,
        whyItMatters: `Directly targets the functional competencies and daily task execution demanded by employers for ${targetRole}.`,
        actionableDetails: {
          miniProjectIdea: `Complete a multi-stage applied case study solving a complex real-world operational challenge in ${targetRole}.`,
          githubRepoSuggestions: ["case-studies/open-practice", "professional-toolkits/methodologies"],
          interviewQuestions: [
            `Walk me through your step-by-step methodology when approaching an ambiguous, high-stakes problem in ${targetRole}.`,
            `What tools or specialized techniques do you rely upon to verify data accuracy and execution quality?`
          ],
          keySkillsToMaster: ["Specialized Tooling", "Diagnostic Analysis", "Workflow Optimization", "Quality Assurance"]
        }
      },
      {
        id: "p2-practical-deliverable",
        title: `Practical Project, Fieldwork or Case Study Deliverable`,
        phase: phases[1],
        category: "project",
        status: "locked",
        estimatedHours: 35,
        prerequisites: ["p1-core-theory", "p1-regulations-ethics"],
        description: `Execute a hands-on project, clinical or laboratory trial, client dossier, or field simulation that produces verifiable evidence of competence.`,
        whyItMatters: `Proves to hiring managers and professional review boards that you can translate knowledge into tangible results.`,
        actionableDetails: {
          miniProjectIdea: `Author and publish a comprehensive professional work sample or case report reviewed against professional peer standards.`,
          githubRepoSuggestions: ["work-samples/case-archives", "fieldwork-guides/practice-templates"],
          interviewQuestions: [
            `Describe a setback or unexpected variable you encountered during your practical project and how you adapted.`,
            `How did you measure the tangible impact or efficacy of your project deliverable?`
          ],
          keySkillsToMaster: ["Practical Execution", "Problem Solving", "Deliverable Documentation", "Stakeholder Communication"]
        }
      },
      {
        id: "p3-flagship-portfolio",
        title: `Flagship Professional Portfolio & Showcase Dossier for ${targetRole}`,
        phase: phases[2],
        category: "project",
        status: "locked",
        estimatedHours: 40,
        prerequisites: ["p2-applied-methods", "p2-practical-deliverable"],
        description: `Synthesize your complete body of practical work, case studies, and recommendations into a comprehensive professional portfolio.`,
        whyItMatters: `The definitive proof of competence on your resume that bypasses generic screening filters and lands executive interviews.`,
        actionableDetails: {
          miniProjectIdea: `Assemble and publish a curated professional portfolio dossier highlighting 3 comprehensive case studies with rationale.`,
          githubRepoSuggestions: ["portfolio-templates/professional-showcase", "case-study-bank/excellence"],
          interviewQuestions: [
            `Walk me through the most challenging case study in your portfolio: What was your strategy and how did you resolve trade-offs?`,
            `If you were to redo this project with unlimited resources, what would you expand or do differently?`
          ],
          keySkillsToMaster: ["Portfolio Curation", "Strategic Synthesis", "Executive Presentation", "Case Defense"]
        }
      },
      {
        id: "p3-career-launch-licensure",
        title: `Licensure, Professional Credentials & Industry Placement for ${targetRole}`,
        phase: phases[2],
        category: "job_transition",
        status: "locked",
        estimatedHours: 20,
        prerequisites: ["p3-flagship-portfolio"],
        description: `Prepare for mandatory licenses, professional credentials, panel interviews, and strategic networking in ${targetRole}.`,
        whyItMatters: `Bridges demonstrable competence into authorized practice, verified credentials, and high-impact job offers.`,
        actionableDetails: {
          miniProjectIdea: `Conduct simulated panel interviews with senior practitioners in ${targetRole} and polish professional credentials.`,
          githubRepoSuggestions: ["career-prep/professional-interviews", "licensure-guides/board-prep"],
          interviewQuestions: [
            `Why are you uniquely equipped to excel as a ${targetRole} in our organization?`,
            `Describe a high-pressure scenario where you demonstrated exceptional leadership and emotional composure.`
          ],
          keySkillsToMaster: ["Credential Verification", "Panel Interviews", "Strategic Networking", "Negotiation"]
        }
      }
    ];
  }

  // Calculate edges
  const edges: { id: string; source: string; target: string; animated: boolean }[] = [];
  nodes.forEach(node => {
    node.prerequisites.forEach(prereqId => {
      edges.push({
        id: `e-${prereqId}-${node.id}`,
        source: prereqId,
        target: node.id,
        animated: true
      });
    });
  });

  // Dynamically scale node estimatedHours to realistically match user's study capacity
  const availableHours = Math.round(weeklyHours * 4.33 * targetDurationMonths);
  const baselineSum = nodes.reduce((acc, curr) => acc + curr.estimatedHours, 0) || 185;
  const targetTotal = Math.max(30, Math.round(availableHours * 0.95));
  const scaleRatio = targetTotal / baselineSum;

  nodes = nodes.map(node => ({
    ...node,
    estimatedHours: Math.max(4, Math.round(node.estimatedHours * scaleRatio))
  }));

  const totalEstimatedHours = nodes.reduce((acc, curr) => acc + curr.estimatedHours, 0);

  let feasibilityRating: "Comfortable" | "Realistic" | "Aggressive" | "Unrealistic" = "Realistic";
  let feasibilityFeedback = "";

  if (availableHours >= totalEstimatedHours * 1.25) {
    feasibilityRating = "Comfortable";
    feasibilityFeedback = `You have ~${Math.round(availableHours)} available hours against ${totalEstimatedHours} required hours. This gives you ample buffer to dive deep into optional bonus challenges.`;
  } else if (availableHours >= totalEstimatedHours * 0.95) {
    feasibilityRating = "Realistic";
    feasibilityFeedback = `You have ~${Math.round(availableHours)} available hours against ${totalEstimatedHours} required hours. Highly feasible with consistent study!`;
  } else if (availableHours >= totalEstimatedHours * 0.70) {
    feasibilityRating = "Aggressive";
    feasibilityFeedback = `You have ~${Math.round(availableHours)} available hours against ${totalEstimatedHours} required hours. An aggressive schedule; consider increasing weekly hours by ~5 hours.`;
  } else {
    feasibilityRating = "Unrealistic";
    feasibilityFeedback = `You have only ~${Math.round(availableHours)} available hours against ${totalEstimatedHours} required hours. We recommend extending your timeline to at least ${Math.ceil(totalEstimatedHours / (weeklyHours * 4.33))} months.`;
  }

  // Handle existing skills pre-marking
  if (existingSkills && existingSkills.length > 0) {
    const skillList = existingSkills.map(s => s.toLowerCase());
    nodes.forEach(node => {
      const match = skillList.some(s => node.title.toLowerCase().includes(s) || node.actionableDetails.keySkillsToMaster.some(k => k.toLowerCase().includes(s)));
      if (match) {
        node.status = "known";
      }
    });

    // Unlock children
    nodes.forEach(node => {
      if (node.status === "locked") {
        const prereqsSatisfied = node.prerequisites.every(pId => {
          const pNode = nodes.find(n => n.id === pId);
          return pNode && (pNode.status === "known" || pNode.status === "completed");
        });
        if (prereqsSatisfied) {
          node.status = "available";
        }
      }
    });
  }

  return {
    roadmapId: `roadmap-${Date.now()}`,
    targetRole,
    summary: `Reverse-engineered strategic roadmap tailored for becoming a ${targetRole}. Focuses on high-leverage competencies, real-world portfolio proof, and topological skill unlocks.`,
    weeklyStudyHours: weeklyHours,
    targetDurationMonths,
    totalEstimatedHours,
    feasibilityRating,
    feasibilityFeedback,
    phases,
    nodes,
    edges
  };
}

/**
 * Public Method: Generate Roadmap
 */
export async function generateRoadmapAI(input: GenerateRoadmapInput): Promise<RoadmapData> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  const userPrompt = `
Generate a complete, reverse-engineered career roadmap for:
Target Role: "${input.targetRole}"
Weekly Study Hours: ${input.weeklyHours} hours/week
Target Duration: ${input.targetDurationMonths} months
Pre-existing skills: ${input.existingSkills && input.existingSkills.length > 0 ? input.existingSkills.join(", ") : "None"}

Ensure the response strictly complies with the RoadmapSchema JSON format.
CRITICAL: Do NOT insert software engineering or programming concepts unless the role explicitly requires them. Reverse-engineer the actual, domain-specific competencies of "${input.targetRole}".
`;

  // 1. Try Gemini if key is present
  if (geminiKey && geminiKey.trim().length > 0) {
    try {
      const rawText = await callGemini(geminiKey, userPrompt, ROADMAP_GENERATOR_SYSTEM_PROMPT);
      const parsed = cleanAndParseJSON(rawText);
      const validated = RoadmapSchema.safeParse(parsed);
      if (validated.success) {
        return rescaleRoadmapToConstraints(
          {
            ...validated.data,
            weeklyStudyHours: input.weeklyHours,
            targetDurationMonths: input.targetDurationMonths
          },
          input.weeklyHours,
          input.targetDurationMonths
        );
      }
      console.warn("Gemini output schema validation failed, falling back to smart engine:", validated.error);
    } catch (err) {
      console.warn("Gemini call failed, attempting fallback:", err);
    }
  }

  // 2. Try OpenAI if key is present
  if (openaiKey && openaiKey.trim().length > 0) {
    try {
      const rawText = await callOpenAICompatible(
        openaiKey,
        "https://api.openai.com/v1",
        "gpt-4o",
        userPrompt,
        ROADMAP_GENERATOR_SYSTEM_PROMPT
      );
      const parsed = cleanAndParseJSON(rawText);
      const validated = RoadmapSchema.safeParse(parsed);
      if (validated.success) {
        return rescaleRoadmapToConstraints(
          {
            ...validated.data,
            weeklyStudyHours: input.weeklyHours,
            targetDurationMonths: input.targetDurationMonths
          },
          input.weeklyHours,
          input.targetDurationMonths
        );
      }
    } catch (err) {
      console.warn("OpenAI call failed, attempting fallback:", err);
    }
  }

  // 3. Try Groq if key is present
  if (groqKey && groqKey.trim().length > 0) {
    try {
      const rawText = await callOpenAICompatible(
        groqKey,
        "https://api.groq.com/openai/v1",
        "llama-3.3-70b-versatile",
        userPrompt,
        ROADMAP_GENERATOR_SYSTEM_PROMPT
      );
      const parsed = cleanAndParseJSON(rawText);
      const validated = RoadmapSchema.safeParse(parsed);
      if (validated.success) {
        return rescaleRoadmapToConstraints(
          {
            ...validated.data,
            weeklyStudyHours: input.weeklyHours,
            targetDurationMonths: input.targetDurationMonths
          },
          input.weeklyHours,
          input.targetDurationMonths
        );
      }
    } catch (err) {
      console.warn("Groq call failed, attempting fallback:", err);
    }
  }

  // 4. Intelligent Universal High-Fidelity Fallback Generator
  return generateDomainFallbackRoadmap(input);
}

/**
 * Public Method: Generate Milestone Guidance
 */
export async function generateMilestoneGuidanceAI(milestoneId: string, nodeTitle: string, targetRole: string): Promise<MilestoneGuidance> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const userPrompt = `
Provide deep professional guidance, deliverable dossier structure, interview scenarios, rookie mistakes, and a mastery checklist for:
Milestone: "${nodeTitle}" (ID: ${milestoneId})
Target Role: "${targetRole}"

Do NOT assume software engineering unless the role is software/IT.
`;

  if (geminiKey && geminiKey.trim().length > 0) {
    try {
      const rawText = await callGemini(geminiKey, userPrompt, MILESTONE_GUIDANCE_SYSTEM_PROMPT);
      const parsed = cleanAndParseJSON(rawText);
      const validated = MilestoneGuidanceSchema.safeParse(parsed);
      if (validated.success) {
        return validated.data;
      }
    } catch (err) {
      console.warn("Gemini guidance call failed, using smart domain fallback:", err);
    }
  }

  const roleLower = targetRole.toLowerCase();
  const isHealthcare = /nurs|doctor|physician|medic|clinic|health|pharma|psychol/i.test(roleLower);
  const isLaw = /law|legal|attorney|counsel|paralegal|compliance/i.test(roleLower);
  const isEducation = /teach|educat|pedagog|school|profess/i.test(roleLower);
  const isFinance = /financ|account|cfa|cpa|audit|bank|invest/i.test(roleLower);
  const isDesign = /design|graphic|visual|brand|ui|ux|animat/i.test(roleLower);
  const isCulinary = /chef|culinary|cook|baker|kitchen/i.test(roleLower);

  if (isHealthcare) {
    return {
      milestoneId,
      architectureGuidance: `Ground all clinical interventions in current evidence-based clinical practice guidelines (EBP). Structure patient encounters using the systematic SBAR (Situation, Background, Assessment, Recommendation) framework. Always prioritize hemodynamic stability and patient safety checkpoints.`,
      folderStructure: `clinical_dossier/
├── patient_assessments/    # Standardized vitals & physical assessment charts
├── care_plans/            # Differential diagnosis & nursing care plans (NANDA)
├── pharmacotherapy/       # Dosage calculations, drug monographs & contraindications
├── ethical_compliance/    # HIPAA documentation & informed consent logs
└── clinical_reflections/  # SBAR handover records & preceptor observation evaluations`,
      interviewScenarios: [
        `Scenario 1: During morning rounds, your patient's telemetry shows unexpected onset tachycardia coupled with dropping O2 saturation. Walk through your immediate 3-minute assessment and intervention protocol.`,
        `Scenario 2: An attending physician prescribes a medication dosage that exceeds standard pharmacological limits for the patient's renal clearance. How do you address this with the prescriber?`,
        `Scenario 3: A patient's family demands restricted prognosis details while the patient has explicitly exercised HIPAA confidentiality. How do you therapeutically handle the situation?`
      ],
      rookieMistakes: [
        "Failing to perform a complete medication reconciliation before administering high-alert medications.",
        "Relying solely on automated monitor readouts without conducting tactile physical assessment checks.",
        "Delaying rapid response team activation out of hesitation or fear of false alarms."
      ],
      masteryChecklist: [
        "Demonstrated fluency in arterial blood gas and cardiac telemetry interpretation.",
        "Error-free execution of pediatric and adult emergency dosage calculations.",
        "Flawless adherence to aseptic sterile technique and PPE isolation protocols.",
        "Consistent delivery of structured SBAR clinical handovers verified by preceptors."
      ]
    };
  }

  if (isLaw) {
    return {
      milestoneId,
      architectureGuidance: `Structure legal arguments using strict IRAC (Issue, Rule, Application, Conclusion) methodology. Anchor every factual proposition to controlling statutory text or appellate precedent. Anticipate and dismantle counterarguments before the opposition raises them.`,
      folderStructure: `case_file/
├── pleadings/             # Complaint, Answer, and preliminary jurisdictional filings
├── legal_memoranda/       # Objective legal research memos & Bluebook citation analysis
├── discovery/             # Interrogatories, deposition transcripts, and document requests
├── motions_and_briefs/    # Dispositive motions (Rule 12/56) and appellate briefs
└── client_counseling/     # Retainer agreements, risk matrices, and settlement evaluations`,
      interviewScenarios: [
        `Scenario 1: You discover a non-binding but highly persuasive appellate opinion from a neighboring circuit that undermines your client's primary defense. How do you disclose or distinguish it ethically?`,
        `Scenario 2: Opposing counsel serves an overly broad subpoena requesting privileged attorney work-product. Walk through your strategy for drafting a protective order motion.`,
        `Scenario 3: A corporate client insists on a contractual indemnification carve-out that exposes them to catastrophic regulatory liability. How do you counsel their executive board?`
      ],
      rookieMistakes: [
        "Citing authority that has been distinguished, vacated, or superseded by subsequent judicial history without Shepardizing.",
        "Conflating legal analysis with subjective emotional advocacy in objective legal memoranda.",
        "Failing to identify the precise standard of review governing the appellate issues."
      ],
      masteryChecklist: [
        "Complete mastery of boolean search strings and Westlaw/Lexis citator flags.",
        "Flawless adherence to Bluebook citation formatting across all formal submissions.",
        "Demonstrated ability to draft persuasive, court-ready motions for summary judgment.",
        "Strict adherence to ABA Model Rules of Professional Conduct and client privilege."
      ]
    };
  }

  if (isEducation) {
    return {
      milestoneId,
      architectureGuidance: `Design instructional sequences using the Backward Design (UbD) framework. Ensure daily learning targets are measurable, standards-aligned, and differentiated across diverse learning modalities. Integrate formative assessment checks every 10-15 minutes.`,
      folderStructure: `curriculum_binder/
├── standards_alignment/   # State standards unbundling & curriculum crosswalks
├── unit_plans/            # Enduring understandings, essential questions & UbD blueprints
├── daily_lessons/         # 5E lesson architectures with explicit differentiation tiers
├── assessment_bank/       # Single-point rubrics, exit tickets & formative probes
└── classroom_culture/     # PBIS norms, restorative circle protocols & family communications`,
      interviewScenarios: [
        `Scenario 1: Mid-period formative exit tickets reveal that 45% of your class failed to master the central concept. What specific instructional adjustments do you execute tomorrow?`,
        `Scenario 2: A student repeatedly exhibits disruptive non-compliance during direct instruction. Walk through your tiered de-escalation protocol that preserves instructional dignity.`,
        `Scenario 3: An anxious parent challenges your grading rubric and demands an unearned grade modification. How do you conduct the conference?`
      ],
      rookieMistakes: [
        "Focusing on classroom activities rather than measurable cognitive learning outcomes.",
        "Failing to differentiate content, process, and product for learners operating at diverse proficiency levels.",
        "Relying on punitive disciplinary escalation rather than restorative behavioral frameworks."
      ],
      masteryChecklist: [
        "Curricular units aligned to state and national standards with explicit essential questions.",
        "Daily formative assessments that generate actionable data for instructional pivots.",
        "Positive behavioral management plan incorporating restorative justice practices.",
        "Video-recorded classroom teaching demonstrations reviewed against edTPA rubrics."
      ]
    };
  }

  if (isFinance) {
    return {
      milestoneId,
      architectureGuidance: `Enforce dynamic dynamic linkage across income statements, balance sheets, and cash flow statements. Avoid hardcoding formulas or figures within financial models. Separate assumptions into a dedicated tab and build scenario toggles for base, upside, and downside cases.`,
      folderStructure: `financial_model/
├── assumptions/           # Macro rates, tax schedules, inflation & revenue driver inputs
├── historical_financials/ # 3-5 years of normalized SEC 10-K / 10-Q financial filings
├── forecast_model/        # Integrated 3-statement projections with debt & working capital schedules
├── valuation_engine/      # DCF, comparable multiples, precedent transactions & LBO analysis
└── investment_deck/       # Executive summary, sensitivity tables & investment recommendation memo`,
      interviewScenarios: [
        `Scenario 1: You are valuing an asset with negative EBITDA and volatile working capital. Why might standard EV/EBITDA multiples mislead an investor and what alternative methodologies would you apply?`,
        `Scenario 2: The CFO asks you to evaluate whether the firm should finance a $200M acquisition via senior debt vs equity. How do you assess the impact on WACC and credit rating?`,
        `Scenario 3: Pitch me a stock idea in under 2 minutes: What is the variant perception that the broader market is failing to price into the asset?`
      ],
      rookieMistakes: [
        "Hardcoding numbers inside formulas instead of referencing dedicated assumption cells.",
        "Ignoring circular reference errors when modeling interest expense and cash balances.",
        "Confusing Enterprise Value with Equity Value when applying operational EBITDA multiples."
      ],
      masteryChecklist: [
        "Dynamically balanced 3-statement model with zero plug balances.",
        "Institutional-grade DCF with defensible CAPM/WACC discount rate derivations.",
        "Monte Carlo sensitivity tables stress-testing terminal growth vs discount rate variations.",
        "Comprehensive 20-page investment memorandum suitable for an investment committee."
      ]
    };
  }

  // Universal Default Fallback
  return {
    milestoneId,
    architectureGuidance: `Master the professional methodologies, diagnostic tools, and quality standards established by leading practitioners in ${targetRole}. Ground your work in published industry standards, peer-reviewed evidence, and rigorous ethical compliance.`,
    folderStructure: `portfolio_dossier/
├── foundational_research/ # Industry standards, regulatory codes & core methodology analyses
├── practical_projects/    # Case studies, prototype documentation & empirical deliverables
├── client_work_samples/   # Real-world project briefs, client communications & outcomes
├── compliance_and_ethics/ # Certifications, ethics audit checklists & safety records
└── professional_pitch/    # Curated portfolio presentation, case defenses & recommendations`,
    interviewScenarios: [
      `Scenario 1: You encounter an unexpected technical or logistical bottleneck that threatens the project timeline for ${targetRole}. How do you diagnose the root cause and pivot?`,
      `Scenario 2: A key stakeholder disagrees strongly with your strategic recommendation. How do you use empirical evidence to defend your position while preserving collaboration?`,
      `Scenario 3: Walk me through a professional project that failed to achieve its target outcome: What did you learn and how did you adapt your methodology?`
    ],
    rookieMistakes: [
      "Overlooking regulatory, ethical, or safety compliance mandates in pursuit of quick results.",
      "Failing to document methodology and assumptions, making work products non-reproducible.",
      "Neglecting stakeholder communication and feedback until final deliverables are presented."
    ],
    masteryChecklist: [
      `Thorough understanding of professional standards and certifications required for ${targetRole}.`,
      "High-quality portfolio case study demonstrating tangible, verified outcomes.",
      "Clear articulation of domain-specific trade-offs during technical interviews.",
      "Active engagement with professional associations and recognized industry standards."
    ]
  };
}

/**
 * Public Method: Generate Path Comparison
 */
export async function generatePathComparisonAI(roleA: string, roleB: string): Promise<PathComparison> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  const userPrompt = `
Conduct a rigorous, practical career path comparison between two distinct professional roles across any industry:
Role A: "${roleA}"
Role B: "${roleB}"

Analyze:
1. Specific common foundational competencies shared by both professions.
2. 4-6 specific specialized skills, tools, or techniques UNIQUE to "${roleA}".
3. 4-6 specific specialized skills, tools, or techniques UNIQUE to "${roleB}".
4. An estimated overlap percentage (0-100%).
5. Pivot difficulty ("Low", "Moderate", or "High").
6. Strategic recommendation explaining career mobility, skill transferability, and how to transition.

Do NOT default to software engineering unless both roles are in software.

Return STRICT JSON complying with this schema:
{
  "roleA": "${roleA}",
  "roleB": "${roleB}",
  "overlapPercentage": number,
  "sharedFoundations": string[],
  "roleAUniqueSkills": string[],
  "roleBUniqueSkills": string[],
  "pivotDifficulty": string,
  "strategicRecommendation": string
}
`;

  if (geminiKey && geminiKey.trim().length > 0) {
    try {
      const rawText = await callGemini(geminiKey, userPrompt, PATH_COMPARISON_SYSTEM_PROMPT);
      const parsed = cleanAndParseJSON(rawText);
      const validated = PathComparisonSchema.safeParse(parsed);
      if (validated.success) {
        return validated.data;
      }
      console.warn("Gemini comparison validation error, trying next:", validated.error);
    } catch (err) {
      console.warn("Gemini comparison call failed:", err);
    }
  }

  if (openaiKey && openaiKey.trim().length > 0) {
    try {
      const rawText = await callOpenAICompatible(
        openaiKey,
        "https://api.openai.com/v1",
        "gpt-4o",
        userPrompt,
        PATH_COMPARISON_SYSTEM_PROMPT
      );
      const parsed = cleanAndParseJSON(rawText);
      const validated = PathComparisonSchema.safeParse(parsed);
      if (validated.success) {
        return validated.data;
      }
    } catch (err) {
      console.warn("OpenAI comparison call failed:", err);
    }
  }

  if (groqKey && groqKey.trim().length > 0) {
    try {
      const rawText = await callOpenAICompatible(
        groqKey,
        "https://api.groq.com/openai/v1",
        "llama-3.3-70b-versatile",
        userPrompt,
        PATH_COMPARISON_SYSTEM_PROMPT
      );
      const parsed = cleanAndParseJSON(rawText);
      const validated = PathComparisonSchema.safeParse(parsed);
      if (validated.success) {
        return validated.data;
      }
    } catch (err) {
      console.warn("Groq comparison call failed:", err);
    }
  }

  // Dynamic Universal Domain-Specific Smart Fallback
  const lowerA = roleA.toLowerCase();
  const lowerB = roleB.toLowerCase();

  const getSkillsForRole = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes("nurse") || r.includes("nursing")) {
      return ["Patient Assessment & Vitals", "Clinical Pharmacology & IV Administration", "Electronic Health Records (Epic/Cerner)", "Clinical Triage Protocols", "Infection Control & Sterile Technique"];
    }
    if (r.includes("doctor") || r.includes("physician") || r.includes("medic")) {
      return ["Differential Diagnosis", "Pathophysiological Analysis", "Clinical Treatment Plans", "Prescription Pharmacology", "Interdisciplinary Patient Rounds"];
    }
    if (r.includes("lawyer") || r.includes("attorney") || r.includes("legal")) {
      return ["Statutory Interpretation & Case Law Analysis", "Appellate Brief & Motion Drafting", "Legal Research (Westlaw/LexisNexis)", "Deposition & Oral Advocacy", "Contractual Risk Allocation"];
    }
    if (r.includes("teacher") || r.includes("educat") || r.includes("school")) {
      return ["Instructional Scaffolding & 5E Lesson Design", "State Standards Curriculum Alignment", "Formative & Summative Assessment Design", "Classroom Leadership & PBIS Protocols", "Differentiated Instruction for Diverse Learners"];
    }
    if (r.includes("cfa") || r.includes("financial analyst") || r.includes("finance")) {
      return ["3-Statement Financial Modeling", "Discounted Cash Flow (DCF) Valuation", "Comparable Company Multiples Analysis", "Capital Budgeting & WACC Calculations", "Macroeconomic Market Analysis"];
    }
    if (r.includes("accountant") || r.includes("cpa") || r.includes("audit")) {
      return ["GAAP / IFRS Accounting Principles", "General Ledger & Balance Sheet Reconciliations", "Corporate Tax Compliance", "Internal Audit & Internal Controls", "Financial Statement Preparation"];
    }
    if (r.includes("aerospace") || r.includes("aeronaut")) {
      return ["Compressible Aerodynamics & Shock Analysis", "Parametric CAD & Structural FEA (ANSYS)", "Propulsion Thermodynamics & Nozzle Design", "Flight Mechanics Simulation", "Aerospace Systems Engineering & ITAR Standards"];
    }
    if (r.includes("civil") || r.includes("structural")) {
      return ["Statics & Shear/Bending Moment Calculations", "Reinforced Concrete Design (ACI 318)", "Structural Steel Design (AISC)", "Geotechnical Soil Mechanics & Bearing Capacity", "BIM Modeling with Autodesk Revit"];
    }
    if (r.includes("chef") || r.includes("culinary")) {
      return ["Classic Knife Cuts & Station Sanitation", "French Mother Sauces & Stock Reductions", "Protein Cooking Temperatures & Sous-Vide", "High-Volume Line Expediting", "Menu Engineering & Food Cost Economics"];
    }
    if (r.includes("graphic") || r.includes("design") || r.includes("visual")) {
      return ["Visual Hierarchy & Gestalt Composition", "Modular Grid Layouts & Swiss Typography", "Brand Identity Guidelines & Logo Construction", "Figma Design Systems & Design Tokens", "Print & Digital Pre-Press Production"];
    }
    if (r.includes("market") || r.includes("sales")) {
      return ["Total Addressable Market (TAM) Sizing", "Omnichannel Funnel Analytics & Attribution", "Customer Acquisition Cost (CAC) vs LTV Optimization", "Enterprise Discovery & MEDDIC Sales Qualification", "Go-To-Market (GTM) Strategy & Executive Pitching"];
    }
    if (r.includes("ai") || r.includes("machine learning")) {
      return ["PyTorch Deep Learning & Tensor Operations", "Transformer Architecture & Fine-Tuning (LoRA)", "Agentic RAG & Hybrid Vector Retrieval", "Model Serving with vLLM & Triton", "Evaluation Benchmarks & Guardrails"];
    }
    if (r.includes("software") || r.includes("developer")) {
      return ["Type-Safe Full-Stack Architecture", "REST & GraphQL API Engineering", "Relational Database Indexing & Caching", "Docker Containerization & CI/CD Pipelines", "Automated Testing & System Observability"];
    }
    // Universal domain extraction
    return [
      `Core Theoretical Foundations of ${role}`,
      `Professional Methodologies & Standards for ${role}`,
      `Applied Case Study Analysis in ${role}`,
      `Industry Regulatory & Ethical Compliance`,
      `Professional Portfolio & Deliverable Execution`
    ];
  };

  const skillsA = getSkillsForRole(roleA);
  const skillsB = getSkillsForRole(roleB);

  // Check domain overlap
  let overlap = 35;
  const isA_Health = /nurs|doctor|physician|medic/i.test(lowerA);
  const isB_Health = /nurs|doctor|physician|medic/i.test(lowerB);
  const isA_Law = /law|legal|attorney/i.test(lowerA);
  const isB_Law = /law|legal|attorney/i.test(lowerB);
  const isA_Fin = /financ|account|cfa|cpa|audit/i.test(lowerA);
  const isB_Fin = /financ|account|cfa|cpa|audit/i.test(lowerB);
  const isA_Tech = /software|developer|devops|ai|cloud/i.test(lowerA);
  const isB_Tech = /software|developer|devops|ai|cloud/i.test(lowerB);

  if ((isA_Health && isB_Health) || (isA_Law && isB_Law) || (isA_Fin && isB_Fin) || (isA_Tech && isB_Tech)) {
    overlap = 65;
  } else if ((isA_Tech && isB_Health) || (isA_Law && isB_Tech) || (isA_Health && isB_Fin)) {
    overlap = 20;
  }

  let difficulty = "Moderate";
  if (overlap >= 60) difficulty = "Low";
  else if (overlap <= 25) difficulty = "High";

  // Select shared foundations that make genuine sense
  let sharedFoundations = [
    "Critical Thinking & Complex Problem Solving",
    "Professional Ethics & Regulatory Compliance",
    "Evidence-Based Research & Analytical Reasoning",
    "Stakeholder & Client Communication",
    "Project Management & Deliverable Execution"
  ];

  if (isA_Health && isB_Health) {
    sharedFoundations = [
      "Human Anatomy & Medical Physiology",
      "Patient Safety, Infection Control & HIPAA Standards",
      "Evidence-Based Clinical Decision Making",
      "Electronic Health Record Documentation",
      "Interdisciplinary Healthcare Teamwork"
    ];
  } else if (isA_Law && isB_Law) {
    sharedFoundations = [
      "Jurisprudence & Legal Reasoning",
      "Statutory Interpretation & Case Law Precedent",
      "Legal Research & Professional Citation",
      "Model Rules of Professional Conduct & Ethics",
      "Persuasive Written & Oral Advocacy"
    ];
  } else if (isA_Fin && isB_Fin) {
    sharedFoundations = [
      "Financial Accounting Principles (GAAP/IFRS)",
      "Quantitative Analysis & Spreadsheet Modeling",
      "Micro & Macroeconomic Market Drivers",
      "Corporate Valuation & Risk Assessment",
      "Fiduciary Responsibility & Regulatory Compliance"
    ];
  } else if (isA_Tech && isB_Tech) {
    sharedFoundations = [
      "Version Control (Git & Team Collaboration)",
      "System Architecture & Clean Code Principles",
      "API Communications & Network Fundamentals",
      "Data Structures & Algorithmic Problem Solving",
      "Continuous Integration & Testing Mindset"
    ];
  }

  return {
    roleA,
    roleB,
    overlapPercentage: overlap,
    sharedFoundations,
    roleAUniqueSkills: skillsA,
    roleBUniqueSkills: skillsB,
    pivotDifficulty: difficulty,
    strategicRecommendation: `Pivoting between ${roleA} and ${roleB} involves an estimated ${overlap}% skill transferability. You can leverage your common foundations in ${sharedFoundations[0].toLowerCase()} and ${sharedFoundations[1].toLowerCase()} to accelerate your timeline. Focus your dedicated study hours on the specialized tools and techniques listed in the comparison columns.`
  };
}
