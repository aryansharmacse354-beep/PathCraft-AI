import { z } from "zod";

export const MilestoneCategorySchema = z.enum([
  "skill",
  "project",
  "certification",
  "job_transition"
]);
export type MilestoneCategory = z.infer<typeof MilestoneCategorySchema>;

export const MilestoneStatusSchema = z.enum([
  "locked",
  "available",
  "in_progress",
  "completed",
  "known"
]);
export type MilestoneStatus = z.infer<typeof MilestoneStatusSchema>;

export const LearningResourceTypeSchema = z.enum([
  "Official Standards & Regulators",
  "Accredited Course & Curriculum",
  "Interactive Practice & Tools",
  "Textbook & Research Papers"
]);
export type LearningResourceType = z.infer<typeof LearningResourceTypeSchema>;

export const LearningResourceSchema = z.object({
  title: z.string().describe("Clear descriptive title of the resource or portal"),
  url: z.string().url().describe("Direct verified HTTPS link to the official or educational website"),
  type: LearningResourceTypeSchema.default("Official Standards & Regulators")
});
export type LearningResource = z.infer<typeof LearningResourceSchema>;

export const MilestoneSchema = z.object({
  id: z.string().describe("Unique identifier, e.g. 'foundations-typescript'"),
  title: z.string().describe("Clear, concise name of the milestone"),
  phase: z.string().describe("Phase name, e.g. 'Phase 1: Foundations'"),
  category: MilestoneCategorySchema,
  status: MilestoneStatusSchema.default("locked"),
  estimatedHours: z.number().min(1).describe("Estimated study and building hours"),
  prerequisites: z.array(z.string()).describe("Array of node IDs that must precede this node"),
  description: z.string().describe("What the student will learn"),
  whyItMatters: z.string().describe("Specific rationale linking this milestone to the hyper-specific target role"),
  actionableDetails: z.object({
    miniProjectIdea: z.string().describe("Portfolio mini-project to build"),
    githubRepoSuggestions: z.array(z.string()).describe("Open-source blueprints or templates to reference"),
    interviewQuestions: z.array(z.string()).min(1).describe("Realistic interview questions"),
    keySkillsToMaster: z.array(z.string()).min(1).describe("Specific tools, libraries, or concepts"),
    learningResources: z.array(LearningResourceSchema).optional()
  })
});
export type Milestone = z.infer<typeof MilestoneSchema>;

export const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  animated: z.boolean().optional().default(true)
});
export type RoadmapEdge = z.infer<typeof EdgeSchema>;

export const RoadmapSchema = z.object({
  roadmapId: z.string(),
  targetRole: z.string(),
  summary: z.string().describe("Executive summary of the reverse-engineered journey"),
  weeklyStudyHours: z.number().min(1),
  targetDurationMonths: z.number().min(1),
  totalEstimatedHours: z.number().min(1),
  feasibilityRating: z.enum(["Comfortable", "Realistic", "Aggressive", "Unrealistic"]),
  feasibilityFeedback: z.string(),
  phases: z.array(z.string()).min(2),
  nodes: z.array(MilestoneSchema).min(4),
  edges: z.array(EdgeSchema).min(3)
});
export type RoadmapData = z.infer<typeof RoadmapSchema>;

export const GenerateRoadmapInputSchema = z.object({
  targetRole: z.string().min(3),
  weeklyHours: z.number().min(2).max(80).default(15),
  targetDurationMonths: z.number().min(1).max(36).default(6),
  existingSkills: z.array(z.string()).optional().default([])
});
export type GenerateRoadmapInput = z.infer<typeof GenerateRoadmapInputSchema>;

export const MilestoneGuidanceSchema = z.object({
  milestoneId: z.string(),
  architectureGuidance: z.string(),
  folderStructure: z.string(),
  interviewScenarios: z.array(z.string()),
  rookieMistakes: z.array(z.string()),
  masteryChecklist: z.array(z.string())
});
export type MilestoneGuidance = z.infer<typeof MilestoneGuidanceSchema>;

export const PathComparisonSchema = z.object({
  roleA: z.string(),
  roleB: z.string(),
  overlapPercentage: z.number(),
  sharedFoundations: z.array(z.string()),
  roleAUniqueSkills: z.array(z.string()),
  roleBUniqueSkills: z.array(z.string()),
  pivotDifficulty: z.string(),
  strategicRecommendation: z.string()
});
export type PathComparison = z.infer<typeof PathComparisonSchema>;
