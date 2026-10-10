import { NextRequest, NextResponse } from "next/server";
import { GenerateRoadmapInputSchema } from "../../../../lib/types/roadmap";
import { generateRoadmapAI } from "../../../../lib/ai/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = GenerateRoadmapInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }

    const roadmap = await generateRoadmapAI(validation.data);
    return NextResponse.json(roadmap);
  } catch (err: any) {
    console.error("Roadmap generation endpoint error:", err);
    return NextResponse.json(
      { error: "Failed to generate roadmap", message: err.message },
      { status: 500 }
    );
  }
}
