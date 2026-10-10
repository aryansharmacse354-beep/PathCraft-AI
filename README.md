# PathCraft AI — Universal Reverse-Engineered Career Intelligence & Learning Engine

> **Live Production Application**: [https://careerroadmapper.vercel.app](https://careerroadmapper.vercel.app)  
> **GitHub Repository**: [aryansharmacse354-beep/PathCraft-AI](https://github.com/aryansharmacse354-beep/PathCraft-AI)  
> Built with **Next.js 14 (App Router)**, **TypeScript**, **React Flow (`@xyflow/react`)**, **Dagre Graph Layout**, **Tailwind CSS**, and **Google Gemini Generative AI**.

---

## 🌟 What is PathCraft AI?

**PathCraft AI** is an intelligent, dependency-aware career roadmap and skill-tree engine that reverse-engineers **ANY** profession into a structured, visual Directed Acyclic Graph (DAG). 

Unlike traditional platforms that provide static linear checklists or mistakenly force every career into software development templates, PathCraft AI features a **Universal Domain Adaptation Engine** with **Zero Cross-Domain Contamination**. Whether a student wants to become a:
- 🩺 **Registered Nurse / Clinical Specialist**
- ⚖️ **Corporate M&A Lawyer / Policy Analyst**
- 🍎 **High School Educator / Academic Researcher**
- 📈 **Chartered Financial Analyst (CFA) / Investment Banker**
- 🚀 **Aerospace / Propulsion Systems Engineer**
- 🏗️ **Structural Civil Engineer / Urban Architect**
- 🎨 **Brand Identity & Graphic Designer / UX Researcher**
- 🍳 **Executive Sous Chef / Hospitality Director**
- ⚡ **Licensed Master Electrician / Renewable Energy Specialist**
- 💻 **Distributed Systems Architect / AI Researcher**

PathCraft AI analyzes the exact competencies, industry licensing requirements, regulatory standards, and practical portfolio milestones required for that specific profession, generating a tailored and dependency-governed learning tree.

---

## 🚀 Key Features

### 1. 🌐 Universal Domain Engine (Zero Cross-Domain Contamination)
- **Career-Specific Curriculum**: Medical roadmaps feature anatomy, pharmacology, sterile field protocols, and clinical rotations; legal paths feature statutory interpretation, civil procedure, and bar preparation; design paths feature typography, grid systems, and portfolio critique.
- **Strict Contamination Prevention**: Never injects programming frameworks, microservices, Docker, or APIs into non-technical roles.

### 2. 🗺️ Interactive Visual DAG Skill Tree (`@xyflow/react` + Dagre)
- **Topological Graph Rendering**: Fullscreen, zoomable, draggable, and interactive visual graph automatically laid out using Dagre's hierarchical DAG algorithm.
- **Color-Coded Status Cascade**:
  - 🟢 **Completed**: Successfully mastered milestones (with celebration confetti).
  - 🟡 **In Progress**: Currently active learning focus.
  - 🔵 **Available / Unlocked**: Prerequisites satisfied; ready to start.
  - 🔒 **Locked**: Upstream prerequisites pending completion.
  - ✨ **Already Known**: Skip redundant foundational steps with one click.

### 3. 📚 Official Regulatory Websites & Verified Learning Portals
- **Direct Authoritative Links**: Every milestone links directly to recognized national and international regulatory bodies:
  - **Healthcare**: World Health Organization (WHO), CDC, NCSBN (NCLEX), NIH / PubMed.
  - **Law**: Legal Information Institute (Cornell Law LII), American Bar Association (ABA), US Courts, Oyez.
  - **Finance**: CFA Institute, Financial Accounting Standards Board (FASB), SEC EDGAR.
  - **Engineering**: NASA Technical Reports (NTRS), ASME, ASCE, AIAA.
  - **Creative & Trades**: AIGA, Nielsen Norman Group, OSHA, NFPA / NEC.
- **Accredited Learning Platforms**: Verified curriculum links to **Khan Academy**, **MIT OpenCourseWare**, **Coursera**, **Harvard Online**, **Edutopia**, and **Investopedia**.
- **Visual Link Inspector**: Displays categorization badges (*Official Standards & Regulators*, *Accredited Course & Curriculum*, *Textbook & Research Papers*) and verified HTTPS domain indicators.

### 4. 🔍 Deep Milestone Inspector Drawer
Clicking any node in the skill tree slides out an interactive inspection drawer containing:
- **Role Rationale**: Hyper-specific explanation of why this milestone is vital for the target career.
- **Key Competencies**: Essential tools, concepts, and industry standards to master.
- **Actionable Practical Deliverable**: Concrete portfolio project, clinical simulation, legal brief, lesson plan, or case study.
- **Blueprints & Reference Frameworks**: Curated open-source repositories and template kits.
- **Interview & Oral Defense Preparation**: Realistic scenario questions with actionable evaluator guidance.

### 5. 🧠 On-Demand Lead Domain Specialist Guidance (`POST /api/milestones/guidance`)
- One-click AI synthesis generating:
  - **Methodology & Execution Standards**: Professional execution framework tailored to the field.
  - **Recommended Deliverable / Dossier Structure**: File organization, case-file layout, or portfolio hierarchy.
  - **Rookie Pitfalls to Avoid**: Common novice mistakes and why they occur.
  - **Mastery Verification Checklist**: Concrete criteria to verify true competency.

### 6. ⏱️ Dynamic Schedule Scaling & Feasibility Engine
- **Live Constraint Adjustment**: Adjust **Weekly Study Hours** (5–60 hrs/wk) and **Target Duration** (1–36 months).
- **Proportional Workload Rescaling**: Dynamically rescales milestone study hours and calculates remaining workload against available hours:
  $$\text{Available Hours} = \text{Weekly Hours} \times 4.33 \times \text{Duration Months}$$
- **Feasibility Ratings**:
  - **Comfortable**: Workload easily fits with buffer time.
  - **Realistic**: Balanced, achievable study commitment.
  - **Aggressive**: Demanding pace requiring disciplined execution.
  - **Unrealistic**: Workload exceeds available time; transparently warns the learner.

### 7. ⚖️ Dual-Path Career Comparison (`POST /api/roadmaps/compare`)
- Compare two dream roles side-by-side (e.g., *Clinical Nurse* vs. *Healthcare Administrator*, or *Full Stack Engineer* vs. *AI Engineer*).
- Calculates:
  - **Overlap Percentage** (0–100%)
  - **Shared Foundational Competencies**
  - **Role-Specific Divergent Skills**
  - **Pivot Difficulty** (*Low*, *Moderate*, *High*)
  - **Strategic Pivot Recommendation**

### 8. 💾 Offline Persistence & JSON Export
- **Automatic LocalStorage Synchronization**: Progress, node states, and active roadmaps persist seamlessly across reloads.
- **One-Click JSON Export**: Download full graph data for backup, sharing, or offline review.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies | Rationale |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | High-performance server-side rendering and API route execution with zero-latency full-stack integration. |
| **Language** | TypeScript (Strict Mode) | End-to-end compile-time type safety across client state and API payloads. |
| **Graph Engine** | `@xyflow/react` + `dagre` | 60fps hardware-accelerated interactive canvas with automated hierarchical DAG layout algorithm. |
| **Generative AI** | Google Gemini 2.5 Flash / 1.5 Flash | High-speed structured JSON synthesis with domain fallbacks for guaranteed 100% uptime. |
| **Validation** | Zod (`RoadmapSchema`) | Runtime type and schema validation preventing malformed graphs or undefined node states. |
| **Styling** | Tailwind CSS + Lucide Icons | Responsive, sleek dark-mode developer UI with rich typography and micro-interactions. |
| **Delight** | Canvas-Confetti | Gamified celebratory feedback upon completing milestones. |

---

## 📦 Project Structure

```
career_roadmapper/
├── app/
│   ├── api/
│   │   ├── milestones/guidance/route.ts   # Deep specialist guidance API
│   │   ├── roadmaps/compare/route.ts      # Dual-role career comparison API
│   │   ├── roadmaps/generate/route.ts     # Core roadmap generation API
│   │   └── roadmaps/replan/route.ts       # Topological replanning API
│   ├── layout.tsx                         # Root Next.js layout & metadata
│   └── page.tsx                           # Main interactive application dashboard
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                     # Top navigation, export & role controls
│   │   └── QuickControls.tsx              # Target duration & weekly hours sliders
│   ├── roadmap/
│   │   ├── MilestoneInspector.tsx         # Node details, official links & guidance drawer
│   │   ├── MilestoneNode.tsx              # Custom React Flow graph node with status badges
│   │   ├── PathComparisonModal.tsx        # Side-by-side role comparison modal
│   │   └── RoadmapCanvas.tsx              # React Flow canvas with Dagre auto-layout
│   └── ui/                                # Reusable UI components & badges
├── lib/
│   ├── ai/
│   │   ├── client.ts                      # Gemini API caller & domain fallback engine
│   │   └── prompts.ts                     # Universal Career Engine prompts & anti-contamination rules
│   ├── types/
│   │   └── roadmap.ts                     # Zod schemas & TypeScript type definitions
│   └── utils/
│       ├── graphEngine.ts                 # Dagre layout & topological state evaluators
│       └── storage.ts                     # LocalStorage persistence utilities
└── public/                                # Static assets and icons
```

---

## 🛠️ Getting Started Locally

### Prerequisites
- **Node.js** 18.x, 20.x, or 24.x
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/aryansharmacse354-beep/PathCraft-AI.git
cd PathCraft-AI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
> *(Optional: You can also specify `OPENAI_API_KEY` or `GROQ_API_KEY` if using alternate providers).*

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🌐 Live Deployment on Vercel

PathCraft AI is continuously deployed to **Vercel** with optimized serverless edge functions:

🔗 **Production URL**: [https://careerroadmapper.vercel.app](https://careerroadmapper.vercel.app)

---

## 👥 Who is PathCraft AI For?

1. **Students & High School Graduates**: Unsure how to break into specialized careers like Aerospace Engineering, Clinical Nursing, Corporate Law, or Sustainable Energy.
2. **Career Pivoters & Transitioners**: Professionals wanting to understand the exact prerequisite dependencies, time requirements, and shared foundational skills before making a career change.
3. **Academic & Vocational Counselors**: Educators needing an objective, evidence-based roadmap to help students plan realistic study schedules and track verified milestones.
4. **Self-Taught Practitioners**: Learners who want direct links to verified regulatory standards and accredited university coursework instead of uncurated web articles.

---

## 📄 License & Acknowledgments
- Developed for the **PathCraft AI Career Roadmapper** initiative.
- MIT License — free for educational and non-commercial development.
