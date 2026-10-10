# PathCraft AI — Reverse-Engineered Career Roadmapper
> **National Hackathon Submission** | Problem Statement 1: Reverse-Engineered Career Roadmapper  
> Built with Next.js 14, TypeScript, React Flow (@xyflow/react), Dagre, Tailwind CSS, and Generative AI.

---

## What it does
PathCraft AI is an interactive, game-inspired career intelligence platform that reverse-engineers a student's hyper-specific dream job (such as *"Full Stack Developer at a Climate-Tech Startup"* or *"AI Engineer at an Autonomous Robotics Scale-up"*) into an adaptive, visual skill tree and dependency-governed learning roadmap. Rather than providing generic, one-size-fits-all lists, our Generative AI engine reverse-engineers the target role into logical phases, prerequisite chains, actionable mini-projects, GitHub template blueprints, and interview challenges. Clicking milestones opens a rich contextual inspector, and marking skills as completed or already known dynamically satisfies prerequisites, unlocks downstream nodes, and recalculates study schedules according to student weekly hours and timeline constraints.

## Done / Left / Plan
- **Done (Working Features)**:
  - **Dynamic AI Generation Engine (`POST /api/roadmaps/generate`)**: Accepts hyper-specific goals, weekly hours (5-45h), duration months (1-24m), and existing skills; returns validated structured JSON conforming to `RoadmapSchema`.
  - **Interactive Visual Skill Tree**: Fullscreen zoomable, pannable, and draggable graph rendered via `@xyflow/react` with automated Dagre hierarchical DAG layout.
  - **Categorized Custom Nodes**: Visual nodes with 4 distinct category badges (*skill*, *project*, *credential*, *job_transition*) and 4 live status states (*completed*, *unlocked*, *in-progress*, *locked*).
  - **Rich Milestone Inspector Drawer**: Contextual slide-out drawer providing domain rationale, actionable mini-project blueprints, suggested open-source GitHub templates, and technical interview scenarios.
  - **On-Demand Staff Architect Guidance (`POST /api/milestones/guidance`)**: AI endpoint generating production folder structures, design patterns, rookie mistakes, and mastery checklists for any node.
  - **Topological Replanning Engine (`POST /api/roadmaps/replan`)**: Marking nodes as "Already Known" or "Completed" immediately satisfies prerequisite chains and unlocks downstream nodes.
  - **Pacing & Constraint Recalculation**: Live sliders for weekly hours and timeline months dynamically calculate remaining study hours and update feasibility ratings (*Comfortable*, *Realistic*, *Aggressive*, *Unrealistic*).
  - **Dual-Path Comparison (`POST /api/roadmaps/compare`)**: Side-by-side comparison modal highlighting shared foundational skills vs. diverging specializations between two roles.
  - **Persistence & Export**: Automatic browser LocalStorage auto-save and one-click JSON export.
- **Left (Next 16-Hour Scope)**:
  - Live GitHub API integration to verify real-time stars and fork metrics for suggested repositories.
  - Calendar integration (.ics export) syncing weekly milestones directly into Google Calendar or Apple Calendar.
  - Social sharing links generating read-only preview cards for student portfolios.
- **Plan**:
  - Deploy to Vercel with edge caching.
  - Connect Supabase / PostgreSQL for multi-user authentication and persistent roadmap sharing.
  - Add peer code reviews and community-verified roadmaps.

## Architecture and why
- **Next.js 14 (App Router) + TypeScript**: Chosen for unified full-stack architecture, zero-latency server API routes, and strict compile-time type safety across the client and server.
- **React Flow (`@xyflow/react`) + Dagre Layout Engine**: Career paths are inherently Directed Acyclic Graphs (DAGs) with complex multi-parent prerequisites. Traditional linear checklists or accordions fail to communicate dependency ordering. React Flow paired with Dagre provides smooth 60fps panning, zooming, and automated hierarchical node placement.
- **Structured JSON Generative AI Engine**: Calls Google Gemini / OpenAI with strict schema constraints validated at runtime with **Zod** (`RoadmapSchema`). Includes a domain-resilient fallback engine ensuring zero downtime or UI breaks even under network constraints or API quota limits.
- **State Management & Topological Evaluator**: Custom deterministic DAG evaluator (`evaluateGraphState`) handles immediate graph cascades and status propagation locally with zero lag, synchronizing with LocalStorage for persistent progress tracking.

## What we added
Beyond the core hackathon requirements, PathCraft AI introduces several high-impact features:
1. **Interactive Dual-Role Comparison**: Allows students to evaluate pivot feasibility between two career ambitions (e.g., *Climate Tech Developer* vs. *FinTech Architect*) to find shared foundational milestones.
2. **On-Demand Staff Architect Deep-Dives**: Generates enterprise folder structures, design patterns, and common rookie pitfalls tailored to each individual milestone.
3. **Pacing Feasibility Engine**: Mathematically checks user study hours against required curriculum hours and issues transparent warnings if a timeline is unrealistic.
4. **Pre-Existing Skill Auto-Unlocking**: Allows students to declare existing proficiencies before generating, immediately skipping redundant foundational phases.
5. **Interactive Confetti & Progress Feedback**: Gamified milestone completion animations celebrating student momentum.

## How to run it
### Prerequisites
- Node.js 18.x or 20.x+
- npm or yarn

### Setup Commands
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd career_roadmapper
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env.local
   ```
   Add your Gemini, OpenAI, or Groq API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. **Launch Development Server**:
   ```bash
   npm run dev
   ```
5. **Open Application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Tools and AI used
- **AI Models & Frameworks**: Google Gemini 1.5 Flash (via structured JSON mode), OpenAI GPT-4o, and Groq.
- **Core Libraries**: Next.js 14, React 18, `@xyflow/react`, `dagre`, `zod`, `lucide-react`, `tailwindcss`, `canvas-confetti`.
- **Transparency & Disclosure**:
  - The application clearly informs users that career roadmaps and architectural specifications are synthesized by Generative AI.
  - Every milestone contains clear markers distinguishing AI suggestions from verified skills.
  - Code generation and prompt schemas were architected and verified during the hackathon.

## Who it is for
PathCraft AI is built for:
1. **University Engineering Students**: Who are tired of vague advice like *"learn data structures"* and need concrete, project-backed roadmaps tailored to specific modern roles.
2. **Self-Taught Developers & Career Switchers**: Who need to know exactly which prerequisite skills to tackle first without wasting months on redundant tutorials.
3. **Mentors & University Career Counselors**: To visually audit and tailor realistic learning timetables for students based on their actual weekly study availability.

**Retention Drivers**: Students return weekly as an interactive study dashboard—marking completed nodes, inspecting newly unlocked interview questions, and monitoring their live career readiness percentage.
