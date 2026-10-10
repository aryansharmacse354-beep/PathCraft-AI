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

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

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
      // Try next model in list
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
 * Smart Domain-Specific Fallback Generator
 * Produces deep, realistic, non-generic roadmaps reverse-engineered for specific industries and goals
 */
function generateDomainFallbackRoadmap(input: GenerateRoadmapInput): RoadmapData {
  const { targetRole, weeklyHours, targetDurationMonths, existingSkills } = input;
  const roleLower = targetRole.toLowerCase();

  const isClimate = roleLower.includes("climate") || roleLower.includes("energy") || roleLower.includes("sustain");
  const isAI = roleLower.includes("ai") || roleLower.includes("ml") || roleLower.includes("machine learning") || roleLower.includes("deep learning");
  const isSecurity = roleLower.includes("security") || roleLower.includes("cyber") || roleLower.includes("pentest");
  const isDesign = roleLower.includes("design") || roleLower.includes("ui") || roleLower.includes("ux");
  const isData = roleLower.includes("data") || roleLower.includes("analytics");

  let phases: string[];
  let nodes: Milestone[];

  if (isClimate) {
    phases = [
      "Phase 1: Climate Systems & Foundation Stack",
      "Phase 2: IoT Telemetry & Carbon Accounting APIs",
      "Phase 3: High-Scale Energy Dashboards & Production Deployment"
    ];
    nodes = [
      {
        id: "p1-typescript-node",
        title: "Modern TypeScript & Distributed Node.js",
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 25,
        prerequisites: [],
        description: "Master strongly typed async architectures, event loops, and microservices for clean sensor data pipelines.",
        whyItMatters: `Crucial foundation for building scalable backends at a climate tech company handling streaming telemetry.`,
        actionableDetails: {
          miniProjectIdea: "Build a high-throughput mock telemetry emitter simulating solar inverter packet streams.",
          githubRepoSuggestions: ["microsoft/TypeScript-Node-Starter", "fastify/fastify-example"],
          interviewQuestions: [
            "How do you handle backpressure in Node.js streams when ingesting rapid sensor data?",
            "Explain memory leak detection in long-running Node background workers."
          ],
          keySkillsToMaster: ["TypeScript 5.x", "Node.js Streams", "Worker Threads", "Zod Validation"]
        }
      },
      {
        id: "p1-carbon-accounting-standards",
        title: "GHG Protocol & Carbon Footprint Calculation Engines",
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 20,
        prerequisites: [],
        description: "Deep dive into Scope 1, 2, and 3 emissions math, emission factor lookup tables, and audit logs.",
        whyItMatters: `Climate tech startups require developers who understand emission calculation logic and compliance boundaries.`,
        actionableDetails: {
          miniProjectIdea: "Create an open-source GHG Scope 1-3 calculator library with unit tests against official EPA coefficients.",
          githubRepoSuggestions: ["green-software-foundation/sci", "climatiq/carbon-api-samples"],
          interviewQuestions: [
            "What distinguishes Scope 2 location-based vs market-based accounting?",
            "How do you architect data pipelines to maintain audit provenance for sustainability reports?"
          ],
          keySkillsToMaster: ["GHG Protocol", "Emission Factors", "Precision Decimal Math", "Audit Provenance"]
        }
      },
      {
        id: "p2-timeseries-databases",
        title: "TimescaleDB & InfluxDB for Energy Grids",
        phase: phases[1],
        category: "skill",
        status: "locked",
        estimatedHours: 35,
        prerequisites: ["p1-typescript-node"],
        description: "Architect time-series hypertables, continuous aggregates, and retention policies for smart meter feeds.",
        whyItMatters: `Grid energy optimization platforms ingest millions of time-stamped voltage and wattage data points hourly.`,
        actionableDetails: {
          miniProjectIdea: "Design a time-series service indexing simulated 15-minute smart meter readings across 10,000 households.",
          githubRepoSuggestions: ["timescale/timescaledb-docker", "influxdata/influxdb-client-js"],
          interviewQuestions: [
            "How do hypertables chunk time partitions under heavy concurrent write loads?",
            "What are downsampling rollups and why are they essential for multi-year climate trend queries?"
          ],
          keySkillsToMaster: ["TimescaleDB", "Hypertables", "Window Functions", "Continuous Aggregates"]
        }
      },
      {
        id: "p2-iot-ingestion-pipeline",
        title: "MQTT & Apache Kafka Telemetry Gateway",
        phase: phases[1],
        category: "project",
        status: "locked",
        estimatedHours: 40,
        prerequisites: ["p1-typescript-node", "p1-carbon-accounting-standards"],
        description: "Deploy an end-to-end telemetry gateway ingesting MQTT payloads from distributed climate sensors into Kafka topics.",
        whyItMatters: `Proves to climate startup founders that you can bridge edge hardware devices with cloud infrastructure.`,
        actionableDetails: {
          miniProjectIdea: "Deploy an MQTT broker bridged to Kafka that filters duplicate sensor readings and normalizes temperature/CO2 data.",
          githubRepoSuggestions: ["confluentinc/cp-all-in-one", "eclipse/mosquitto"],
          interviewQuestions: [
            "How do you handle MQTT QoS levels 0, 1, and 2 over intermittent cellular connections?",
            "Describe exactly how consumer group offsets prevent data loss during pipeline redeploys."
          ],
          keySkillsToMaster: ["Apache Kafka", "MQTT Protocol", "Docker Compose", "At-Least-Once Delivery"]
        }
      },
      {
        id: "p3-climate-dashboard",
        title: "Real-Time Carbon Intelligence Dashboard",
        phase: phases[2],
        category: "project",
        status: "locked",
        estimatedHours: 45,
        prerequisites: ["p2-timeseries-databases", "p2-iot-ingestion-pipeline"],
        description: "Build a Next.js + React Flow + Tremor dashboard visualizing facility emissions, offset forecasts, and grid intensity.",
        whyItMatters: `The centerpiece of your portfolio: a fully functional, live-deployed platform proving readiness for your dream climate role.`,
        actionableDetails: {
          miniProjectIdea: "Full-stack SaaS app featuring live WattTime / Electricity Maps API integration, predictive alerting, and exportable PDF audit reports.",
          githubRepoSuggestions: ["tremorlabs/tremor", "vercel/nextjs-subscription-payments"],
          interviewQuestions: [
            "How do you optimize React re-renders when streaming real-time metrics via WebSockets?",
            "How would you architect multi-tenant data isolation for enterprise corporate sustainability reporting?"
          ],
          keySkillsToMaster: ["Next.js App Router", "Server Components", "Tremor Charts", "WebSockets"]
        }
      },
      {
        id: "p3-climate-job-readiness",
        title: "Climate Tech Technical Interview & System Design",
        phase: phases[2],
        category: "job_transition",
        status: "locked",
        estimatedHours: 20,
        prerequisites: ["p3-climate-dashboard"],
        description: "Prepare systems design presentations, open-source climate contributions, and domain-specific technical interviews.",
        whyItMatters: `Bridges technical competency into hiring manager conversions at climate scale-ups like Watershed, Patch, or Arcadia.`,
        actionableDetails: {
          miniProjectIdea: "Submit a pull request to a Green Software Foundation repository and draft a comprehensive system design whitepaper.",
          githubRepoSuggestions: ["green-software-foundation/carbon-aware-sdk", "climate-tech-handbook"],
          interviewQuestions: [
            "Design an architectural system for a carbon credit verification exchange with immutable ledger guarantees.",
            "How do you measure and reduce the carbon intensity of cloud compute workloads themselves?"
          ],
          keySkillsToMaster: ["System Design", "Green Computing", "Whitepaper Writing", "Technical Storytelling"]
        }
      }
    ];
  } else if (isAI) {
    phases = [
      "Phase 1: Deep Mathematical Foundations & Python Core",
      "Phase 2: Deep Learning, PyTorch & LLM Architectures",
      "Phase 3: Production LLMOps, RAG Systems & Model Serving"
    ];
    nodes = [
      {
        id: "p1-python-vector-math",
        title: "Vector Calculus, Linear Algebra & High-Perf Python",
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 25,
        prerequisites: [],
        description: "Master matrix decompositions, gradients, broadcasting rules, and vectorized tensor computations in NumPy.",
        whyItMatters: `Top-tier AI engineering requires understanding underlying tensor geometry rather than just calling wrapper libraries.`,
        actionableDetails: {
          miniProjectIdea: "Implement a mini autograd engine and backpropagation system from scratch in pure NumPy.",
          githubRepoSuggestions: ["karpathy/micrograd", "numpy/numpy-tutorials"],
          interviewQuestions: [
            "Derive the gradient update for cross-entropy loss coupled with softmax.",
            "Explain broadcasting memory strides in NumPy arrays and how to prevent allocations."
          ],
          keySkillsToMaster: ["NumPy", "Linear Algebra", "Vectorization", "Computational Graphs"]
        }
      },
      {
        id: "p1-pytorch-core",
        title: "PyTorch Mechanics & Neural Network Fundamentals",
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 30,
        prerequisites: [],
        description: "Implement custom nn.Modules, custom autograd Functions, dataloaders, and multi-GPU training paradigms.",
        whyItMatters: `PyTorch is the de-facto standard framework across product AI labs and frontier technology companies.`,
        actionableDetails: {
          miniProjectIdea: "Train a custom vision transformer or CNN on CIFAR-100 with learning rate warmups, cosine annealing, and mixed precision.",
          githubRepoSuggestions: ["pytorch/examples", "rasbt/deeplearning-models"],
          interviewQuestions: [
            "What is the difference between model.eval() and torch.no_grad()?",
            "How does torch.cuda.amp (mixed precision) save memory and accelerate tensor cores?"
          ],
          keySkillsToMaster: ["PyTorch", "CUDA Basics", "Mixed Precision", "DataLoaders"]
        }
      },
      {
        id: "p2-transformer-architectures",
        title: "Transformer Attention & Fine-Tuning (LoRA / QLoRA)",
        phase: phases[1],
        category: "skill",
        status: "locked",
        estimatedHours: 40,
        prerequisites: ["p1-python-vector-math", "p1-pytorch-core"],
        description: "Demystify multi-head self-attention, rotary positional embeddings (RoPE), and parameter-efficient fine-tuning.",
        whyItMatters: `Enables you to customize open-weights foundation models for enterprise-specific domains and latency targets.`,
        actionableDetails: {
          miniProjectIdea: "Fine-tune a Llama 3 8B model using QLoRA and Unsloth on domain-specific JSON schemas with rigorous eval metrics.",
          githubRepoSuggestions: ["huggingface/peft", "unslothai/unsloth"],
          interviewQuestions: [
            "Explain the mathematical formulation of FlashAttention and why it avoids quadratic HBM read/writes.",
            "How do rank decomposition matrices in LoRA preserve original model weights while adapting representations?"
          ],
          keySkillsToMaster: ["Hugging Face Transformers", "PEFT", "LoRA", "Unsloth"]
        }
      },
      {
        id: "p2-production-rag",
        title: "Advanced Agentic RAG & Hybrid Vector Search",
        phase: phases[1],
        category: "project",
        status: "locked",
        estimatedHours: 35,
        prerequisites: ["p1-pytorch-core"],
        description: "Build an enterprise retrieval engine utilizing semantic chunking, dense vector embeddings, BM25 reranking, and self-correcting agents.",
        whyItMatters: `The #1 most in-demand production skill for AI engineers at product-based companies today.`,
        actionableDetails: {
          miniProjectIdea: "Create an Agentic Financial Analyst that ingests 10-K SEC filings, routes queries, retrieves citations, and validates facts.",
          githubRepoSuggestions: ["run-llama/llama_index", "langchain-ai/rag-from-scratch"],
          interviewQuestions: [
            "How do you mitigate lost-in-the-middle phenomena in dense vector retrieval?",
            "Compare reciprocal rank fusion (RRF) with cross-encoder re-ranking in hybrid search."
          ],
          keySkillsToMaster: ["Qdrant / Milvus", "Hybrid Search", "Cohere Rerank", "Semantic Chunking"]
        }
      },
      {
        id: "p3-model-serving-vllm",
        title: "High-Throughput Model Serving with vLLM & Triton",
        phase: phases[2],
        category: "project",
        status: "locked",
        estimatedHours: 40,
        prerequisites: ["p2-transformer-architectures", "p2-production-rag"],
        description: "Deploy quantized models utilizing PagedAttention, continuous batching, streaming SSE, and Triton inference server.",
        whyItMatters: `Separates junior prompt engineers from senior AI infrastructure engineers who understand token latency and GPU economics.`,
        actionableDetails: {
          miniProjectIdea: "Deploy a multi-tenant vLLM inference server on Docker with Prometheus metrics tracking TTFT (Time To First Token) and TPS.",
          githubRepoSuggestions: ["vllm-project/vllm", "triton-inference-server/server"],
          interviewQuestions: [
            "How does PagedAttention alleviate memory fragmentation compared to static KV cache allocation?",
            "What architectural strategies minimize TTFT under high concurrent request bursts?"
          ],
          keySkillsToMaster: ["vLLM", "PagedAttention", "Docker", "Prometheus / Grafana"]
        }
      },
      {
        id: "p3-ai-interview-transition",
        title: "AI System Design & Frontier Lab Interview Transition",
        phase: phases[2],
        category: "job_transition",
        status: "locked",
        estimatedHours: 25,
        prerequisites: ["p3-model-serving-vllm"],
        description: "Master AI system design questions (designing Copilot, ChatGPT, or multi-modal visual search) and live portfolio reviews.",
        whyItMatters: `Prepares you to clear the most challenging bar-raising rounds at companies building proprietary AI systems.`,
        actionableDetails: {
          miniProjectIdea: "Publish a GitHub repository documenting architecture benchmarks of your fine-tuned model and complete an interactive web demo.",
          githubRepoSuggestions: ["chiphuyen/machine-learning-systems-design"],
          interviewQuestions: [
            "Design a real-time speech-to-speech translation agent with under 300ms end-to-end latency.",
            "How do you evaluate guardrails against prompt injection and data poisoning attacks?"
          ],
          keySkillsToMaster: ["AI System Design", "Safety / Guardrails", "GPU Cost Modeling", "Portfolio Presentation"]
        }
      }
    ];
  } else {
    // Universal Highly Tailored Tech Roadmap
    phases = [
      `Phase 1: Core Fundamentals for ${targetRole}`,
      `Phase 2: Advanced Architecture & Domain Tooling`,
      `Phase 3: Portfolio Capstone & Transition Strategy`
    ];
    nodes = [
      {
        id: "p1-core-architecture",
        title: `Foundational Engineering Stack for ${targetRole}`,
        phase: phases[0],
        category: "skill",
        status: "available",
        estimatedHours: 25,
        prerequisites: [],
        description: `Establish an uncompromising mastery of foundational tools and patterns required for high-performing ${targetRole} positions.`,
        whyItMatters: `Ensures all code you write demonstrates industry-standard quality, readability, and design consistency.`,
        actionableDetails: {
          miniProjectIdea: `Construct a modular, type-safe architectural boilerplate with automated test coverage tailored to ${targetRole}.`,
          githubRepoSuggestions: ["goldbergyoni/nodebestpractices", "kamranahmedse/developer-roadmap"],
          interviewQuestions: [
            `What are the core design trade-offs you prioritize when beginning a greenfield project for ${targetRole}?`,
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
        title: `Flagship Full-Lifecycle Portfolio Project for ${targetRole}`,
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
        title: `Hiring Pipeline & Technical Interview Mastery for ${targetRole}`,
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

  const totalEstimatedHours = nodes.reduce((acc, curr) => acc + curr.estimatedHours, 0);
  const availableHours = weeklyHours * 4.33 * targetDurationMonths;

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
`;

  // 1. Try Gemini if key is present
  if (geminiKey && geminiKey.trim().length > 0) {
    try {
      const rawText = await callGemini(geminiKey, userPrompt, ROADMAP_GENERATOR_SYSTEM_PROMPT);
      const parsed = cleanAndParseJSON(rawText);
      const validated = RoadmapSchema.safeParse(parsed);
      if (validated.success) {
        return validated.data;
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
        return validated.data;
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
        return validated.data;
      }
    } catch (err) {
      console.warn("Groq call failed, attempting fallback:", err);
    }
  }

  // 4. Intelligent high-fidelity fallback generator
  return generateDomainFallbackRoadmap(input);
}

/**
 * Public Method: Generate Milestone Guidance
 */
export async function generateMilestoneGuidanceAI(milestoneId: string, nodeTitle: string, targetRole: string): Promise<MilestoneGuidance> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const userPrompt = `
Provide deep architectural guidance, folder structure, interview scenarios, rookie mistakes, and a mastery checklist for:
Milestone: "${nodeTitle}" (ID: ${milestoneId})
Target Role: "${targetRole}"
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
      console.warn("Gemini guidance call failed, using smart fallback:", err);
    }
  }

  return {
    milestoneId,
    architectureGuidance: `Implement this module with clean hexagonal architecture (ports & adapters). Decouple your business logic from the underlying framework, database, or external APIs. Use dependency injection to simplify isolated unit testing.`,
    folderStructure: `src/
├── domain/       # Core business entities & interfaces
├── usecases/     # Application logic & orchestrators
├── adapters/     # DB queries, external API clients, message brokers
├── infrastructure/ # Server setup, DI container, config
└── index.ts      # Main bootstrap entrypoint`,
    interviewScenarios: [
      `Scenario 1: You notice a memory or latency spike under sudden 10x traffic bursts. How do you profile and isolate the bottleneck without taking down production?`,
      `Scenario 2: An external third-party API begins failing intermittently with 503 errors. How do you implement circuit-breaking and backoff retry logic?`,
      `Scenario 3: The engineering manager asks you to migrate the persistence layer from SQL to document store. How do your architectural abstractions accommodate this change?`
    ],
    rookieMistakes: [
      "Hardcoding environment configuration and secrets directly into repository source files.",
      "Neglecting idempotency keys on write endpoints, leading to duplicate records during client retries.",
      "Tightly coupling UI state with network transport protocols instead of using clean domain models."
    ],
    masteryChecklist: [
      "Full test suite running in GitHub Actions with over 80% branch coverage.",
      "Structured JSON logging with request correlation IDs and OpenTelemetry traces.",
      "Docker container build size optimized under 150MB via multi-stage builds.",
      "Interactive README showcasing architecture diagram, benchmark figures, and local setup steps."
    ]
  };
}

/**
 * Public Method: Generate Path Comparison
 */
/**
 * Public Method: Generate Path Comparison
 */
export async function generatePathComparisonAI(roleA: string, roleB: string): Promise<PathComparison> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  const userPrompt = `
Conduct a rigorous, practical career path comparison between two distinct tech roles:
Role A: "${roleA}"
Role B: "${roleB}"

Analyze:
1. Specific common foundational skills shared by both roles.
2. 4-6 specific technical skills and tools UNIQUE to "${roleA}".
3. 4-6 specific technical skills and tools UNIQUE to "${roleB}".
4. An estimated overlap percentage (0-100%).
5. Pivot difficulty ("Low", "Moderate", or "High").
6. Strategic recommendation explaining career mobility, hiring demand, and how to transition.

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

  // Dynamic Domain-Specific Smart Fallback
  const lowerA = roleA.toLowerCase();
  const lowerB = roleB.toLowerCase();

  const getSkillsForRole = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes("frontend") || r.includes("ui") || r.includes("ux")) {
      return ["React / Next.js", "Tailwind CSS & Design Systems", "State Management (Zustand/Redux)", "Web Performance & Core Web Vitals", "Accessibility (WCAG & ARIA)"];
    }
    if (r.includes("devops") || r.includes("cloud") || r.includes("sre") || r.includes("infrastructure")) {
      return ["Terraform & Infrastructure as Code", "Docker & Kubernetes Orchestration", "CI/CD Pipeline Automation", "AWS / GCP Cloud Architectures", "Prometheus & Grafana Observability"];
    }
    if (r.includes("ai") || r.includes("machine learning") || r.includes("ml") || r.includes("deep learning")) {
      return ["PyTorch / TensorFlow Deep Learning", "Transformer Attention & Fine-Tuning (LoRA)", "Agentic RAG & Vector Databases", "vLLM Inference Serving & CUDA", "Model Evaluation & Guardrails"];
    }
    if (r.includes("data") || r.includes("analytics")) {
      return ["SQL & Advanced Window Functions", "Apache Spark & Distributed ETL", "dbt (data build tool)", "Data Warehousing (Snowflake/BigQuery)", "Data Modeling & Star Schemas"];
    }
    if (r.includes("security") || r.includes("cyber") || r.includes("pentest")) {
      return ["Threat Modeling & Zero Trust Architecture", "Application Security (OWASP Top 10)", "Penetration Testing & Burp Suite", "Identity & Access Management (OAuth/SAML)", "SIEM & Incident Response"];
    }
    if (r.includes("climate") || r.includes("energy")) {
      return ["GHG Protocol Carbon Accounting Standards", "TimescaleDB Time-Series Energy Datasets", "MQTT Sensor Telemetry Ingestion", "Green Software Foundation Principles", "Carbon Offset Verification APIs"];
    }
    // Default Fullstack/Backend
    return [`Modern ${role} Architecture`, "REST & GraphQL API Engineering", "Relational Database Indexing", "Authentication & Session Security", "Automated Integration Testing"];
  };

  const skillsA = getSkillsForRole(roleA);
  const skillsB = getSkillsForRole(roleB);

  // Calculate dynamic overlap
  let overlap = 45;
  if ((lowerA.includes("full") && lowerB.includes("front")) || (lowerA.includes("front") && lowerB.includes("full"))) overlap = 65;
  else if ((lowerA.includes("devops") && lowerB.includes("cloud")) || (lowerA.includes("sre") && lowerB.includes("devops"))) overlap = 80;
  else if ((lowerA.includes("ai") && lowerB.includes("data")) || (lowerA.includes("data") && lowerB.includes("ai"))) overlap = 55;
  else if ((lowerA.includes("design") && lowerB.includes("devops")) || (lowerA.includes("security") && lowerB.includes("design"))) overlap = 15;

  let difficulty = "Moderate";
  if (overlap >= 60) difficulty = "Low";
  else if (overlap <= 25) difficulty = "High";

  return {
    roleA,
    roleB,
    overlapPercentage: overlap,
    sharedFoundations: [
      "Version Control (Git & Trunk-Based Development)",
      "Linux Command Line & Shell Scripting",
      "Software Development Life Cycle & Clean Code Principles",
      "API Communications & Network Fundamentals",
      "Continuous Integration & Testing Mindset"
    ],
    roleAUniqueSkills: skillsA,
    roleBUniqueSkills: skillsB,
    pivotDifficulty: difficulty,
    strategicRecommendation: `Pivoting between ${roleA} and ${roleB} involves an estimated ${overlap}% skill transferability. You can leverage your common foundations in version control, system fundamentals, and testing to accelerate your timeline. Focus your dedicated study hours on the specialized tools listed in the comparison columns.`
  };
}
