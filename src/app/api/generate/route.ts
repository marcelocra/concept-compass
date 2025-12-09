import { NextRequest, NextResponse } from "next/server";
import { generateConcepts } from "@/lib/ai/generate-concepts";

interface GenerateResponse {
  success: boolean;
  concepts?: string[];
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponse>> {
  try {
    // Parse and validate request body
    let body: { concept: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON in request body" }, { status: 400 });
    }

    // Validate concept parameter
    if (!body.concept || typeof body.concept !== "string") {
      return NextResponse.json(
        { success: false, error: "Concept parameter is required and must be a string" },
        { status: 400 }
      );
    }

    // Use the shared generateConcepts function
    const result = await generateConcepts(body.concept);

    if (!result.success) {
      // Determine appropriate status code based on error
      let statusCode = 500;
      if (result.error?.includes("overloaded")) {
        statusCode = 429;
      } else if (result.error?.includes("empty after sanitization")) {
        statusCode = 400;
      }
      return NextResponse.json({ success: false, error: result.error }, { status: statusCode });
    }

    return NextResponse.json({
      success: true,
      concepts: result.concepts,
    });
  } catch (error) {
    console.error("Unexpected error in generate API route:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
