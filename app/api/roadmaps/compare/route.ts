import { NextRequest, NextResponse } from "next/server";
import { generatePathComparisonAI } from "../../../../lib/ai/client";
import { z } from "zod";

const CompareInputSchema = z.object({
  roleA: z.string().min(2),
  roleB: z.string().min(2)
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = CompareInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid comparison input", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { roleA, roleB } = validation.data;
    const comparison = await generatePathComparisonAI(roleA, roleB);

    return NextResponse.json(comparison);
  } catch (err: any) {
    console.error("Comparison endpoint error:", err);
    return NextResponse.json(
      { error: "Failed to compare roles", message: err.message },
      { status: 500 }
    );
  }
}
