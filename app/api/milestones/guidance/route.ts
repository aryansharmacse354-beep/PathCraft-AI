import { NextRequest, NextResponse } from "next/server";
import { generateMilestoneGuidanceAI } from "../../../../lib/ai/client";
import { z } from "zod";

const GuidanceInputSchema = z.object({
  milestoneId: z.string(),
  nodeTitle: z.string(),
  targetRole: z.string()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = GuidanceInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid guidance request", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { milestoneId, nodeTitle, targetRole } = validation.data;
    const guidance = await generateMilestoneGuidanceAI(milestoneId, nodeTitle, targetRole);

    return NextResponse.json(guidance);
  } catch (err: any) {
    console.error("Milestone guidance endpoint error:", err);
    return NextResponse.json(
      { error: "Failed to generate guidance", message: err.message },
      { status: 500 }
    );
  }
}
