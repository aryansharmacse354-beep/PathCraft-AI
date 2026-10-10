import { NextRequest, NextResponse } from "next/server";
import { RoadmapSchema } from "../../../../lib/types/roadmap";
import { replanRoadmap } from "../../../../lib/utils/graphEngine";
import { z } from "zod";

export const maxDuration = 60;

const ReplanInputSchema = z.object({
  roadmap: RoadmapSchema,
  nodeStates: z.record(z.string(), z.enum(["locked", "available", "in_progress", "completed", "known"])),
  updatedWeeklyHours: z.number().optional(),
  updatedDurationMonths: z.number().optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = ReplanInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid replan request", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { roadmap, nodeStates, updatedWeeklyHours, updatedDurationMonths } = validation.data;
    const replanned = replanRoadmap(roadmap, nodeStates, updatedWeeklyHours, updatedDurationMonths);

    return NextResponse.json(replanned);
  } catch (err: any) {
    console.error("Roadmap replan endpoint error:", err);
    return NextResponse.json(
      { error: "Failed to replan roadmap", message: err.message },
      { status: 500 }
    );
  }
}
