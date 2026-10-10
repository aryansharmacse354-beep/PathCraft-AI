import { Milestone, RoadmapData, MilestoneStatus } from "../types/roadmap";

/**
 * Evaluates the status of all nodes in the DAG
 * If all prerequisites of a locked node are "completed" or "known", unlocks the node to "available".
 * Recalculates remaining hours, progress percentage, and feasibility.
 */
export function evaluateGraphState(
  nodes: Milestone[],
  weeklyHours: number,
  targetDurationMonths: number
): {
  updatedNodes: Milestone[];
  progressPercentage: number;
  remainingHours: number;
  completedCount: number;
  feasibilityRating: "Comfortable" | "Realistic" | "Aggressive" | "Unrealistic";
  feasibilityFeedback: string;
} {
  // Map of current statuses
  const statusMap = new Map<string, MilestoneStatus>(nodes.map((n) => [n.id, n.status]));

  let remainingHours = 0;
  let completedCount = 0;

  // Multiple passes to ensure multi-depth cascades unlock properly
  let changed = true;
  let currentNodes = [...nodes];

  while (changed) {
    changed = false;
    currentNodes = currentNodes.map((node) => {
      if (node.status === "completed" || node.status === "known") {
        return node;
      }

      // Check if all prerequisites are fulfilled
      const allPrereqsMet = node.prerequisites.length === 0 || node.prerequisites.every((prereqId) => {
        const pStatus = statusMap.get(prereqId);
        return pStatus === "completed" || pStatus === "known";
      });

      if (allPrereqsMet && node.status === "locked") {
        statusMap.set(node.id, "available");
        changed = true;
        return { ...node, status: "available" as MilestoneStatus };
      }

      if (!allPrereqsMet && (node.status === "available" || node.status === "in_progress")) {
        statusMap.set(node.id, "locked");
        changed = true;
        return { ...node, status: "locked" as MilestoneStatus };
      }

      return node;
    });
  }

  // Calculate statistics
  currentNodes.forEach((node) => {
    if (node.status === "completed" || node.status === "known") {
      completedCount++;
    } else {
      remainingHours += node.estimatedHours;
    }
  });

  const progressPercentage = Math.round((completedCount / currentNodes.length) * 100);
  const availableHours = weeklyHours * 4.33 * targetDurationMonths;

  let feasibilityRating: "Comfortable" | "Realistic" | "Aggressive" | "Unrealistic" = "Realistic";
  let feasibilityFeedback = "";

  if (availableHours >= remainingHours * 1.25) {
    feasibilityRating = "Comfortable";
    feasibilityFeedback = `You have ~${Math.round(availableHours)} remaining study hours available for ${remainingHours} required hours. Excellent pacing!`;
  } else if (availableHours >= remainingHours * 0.95) {
    feasibilityRating = "Realistic";
    feasibilityFeedback = `You have ~${Math.round(availableHours)} available hours for ${remainingHours} required hours. Highly realistic on schedule.`;
  } else if (availableHours >= remainingHours * 0.70) {
    feasibilityRating = "Aggressive";
    feasibilityFeedback = `You have ~${Math.round(availableHours)} available hours for ${remainingHours} required hours. A tight schedule; consider dedicating a few extra hours per week.`;
  } else {
    feasibilityRating = "Unrealistic";
    feasibilityFeedback = `Remaining work (${remainingHours}h) exceeds your planned capacity (~${Math.round(availableHours)}h). Consider extending your timeline by ~${Math.ceil((remainingHours - availableHours) / (weeklyHours * 4.33))} months.`;
  }

  return {
    updatedNodes: currentNodes,
    progressPercentage,
    remainingHours,
    completedCount,
    feasibilityRating,
    feasibilityFeedback
  };
}

/**
 * Re-plans an existing roadmap with new node states or new user constraints
 */
export function replanRoadmap(
  roadmap: RoadmapData,
  nodeUpdates: Record<string, MilestoneStatus>,
  updatedWeeklyHours?: number,
  updatedDurationMonths?: number
): RoadmapData {
  const weeklyHours = updatedWeeklyHours ?? roadmap.weeklyStudyHours;
  const durationMonths = updatedDurationMonths ?? roadmap.targetDurationMonths;

  const modifiedNodes = roadmap.nodes.map((node) => {
    if (nodeUpdates[node.id]) {
      return { ...node, status: nodeUpdates[node.id] };
    }
    return node;
  });

  const evaluation = evaluateGraphState(modifiedNodes, weeklyHours, durationMonths);

  return {
    ...roadmap,
    weeklyStudyHours: weeklyHours,
    targetDurationMonths: durationMonths,
    feasibilityRating: evaluation.feasibilityRating,
    feasibilityFeedback: evaluation.feasibilityFeedback,
    nodes: evaluation.updatedNodes
  };
}

/**
 * Dynamically re-scales milestone estimated hours and redistributes timeline
 * when the user changes weekly study hours or target duration months.
 */
export function rescaleRoadmapToConstraints(
  roadmap: RoadmapData,
  newWeeklyHours: number,
  newDurationMonths: number
): RoadmapData {
  const availableHours = Math.round(newWeeklyHours * 4.33 * newDurationMonths);
  const targetTotal = Math.max(30, Math.min(800, Math.round(availableHours * 0.95)));

  // Calculate current baseline total
  const currentTotal = roadmap.nodes.reduce((acc, n) => acc + n.estimatedHours, 0) || 1;
  const scale = targetTotal / currentTotal;

  // Proportionally scale node hours for active learning milestones
  const rescaledNodes = roadmap.nodes.map((n) => {
    // Keep completed or known status untouched
    const scaledHours = Math.max(4, Math.round(n.estimatedHours * scale));
    return {
      ...n,
      estimatedHours: scaledHours
    };
  });

  const evaluation = evaluateGraphState(rescaledNodes, newWeeklyHours, newDurationMonths);
  const totalHours = rescaledNodes.reduce((acc, n) => acc + n.estimatedHours, 0);

  return {
    ...roadmap,
    weeklyStudyHours: newWeeklyHours,
    targetDurationMonths: newDurationMonths,
    totalEstimatedHours: totalHours,
    feasibilityRating: evaluation.feasibilityRating,
    feasibilityFeedback: evaluation.feasibilityFeedback,
    nodes: evaluation.updatedNodes
  };
}

