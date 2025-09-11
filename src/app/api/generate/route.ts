import { NextRequest, NextResponse } from "next/server";

interface GenerateRequest {
  concept: string;
}

interface GenerateResponse {
  success: boolean;
  concepts?: string[];
  error?: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

function sanitizeConcept(concept: string): string {
  return concept
    .trim()
    .slice(0, 100) // Limit length
    .replace(/[<>]/g, ""); // Basic XSS prevention
}

function generatePrompt(concept: string): string {
  return `Generate a list of 5 to 7 diverse concepts related to "${concept}".
Return ONLY a valid JSON array of strings in your response, with no other text, explanations, or markdown.

For the concept list, provide a mix of the following categories:

- A core component or principle.
- A practical application or use case.
- A potential challenge or consideration.
- A related technology or tool.
- A surprising or "out-of-the-box" connection.

Example for "Sustainable Urban Farming":
["Vertical Farming", "Community Supported Agriculture (CSA)", "Water Scarcity", "IoT Soil Sensors", "Mycoremediation"]`;
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponse>> {
  try {
    // Validate environment variables
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY environment variable is not set");
      return NextResponse.json({ success: false, error: "API configuration error" }, { status: 500 });
    }

    // Parse and validate request body
    let body: GenerateRequest;
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

    const sanitizedConcept = sanitizeConcept(body.concept);
    if (!sanitizedConcept) {
      return NextResponse.json(
        { success: false, error: "Concept cannot be empty after sanitization" },
        { status: 400 }
      );
    }

    // Model selection based on environment
    const model =
      process.env.NODE_ENV === "production" ? process.env.OPENROUTER_MODEL || "gpt-oss-120b" : "gpt-oss-20b";

    // Make OpenRouter API call
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Concept Compass MVP",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: generatePrompt(sanitizedConcept),
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error("OpenRouter API error:", {
        status: openRouterResponse.status,
        statusText: openRouterResponse.statusText,
        body: errorText,
      });

      // Handle specific error cases
      if (openRouterResponse.status === 429) {
        return NextResponse.json(
          { success: false, error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }

      if (openRouterResponse.status === 401) {
        return NextResponse.json({ success: false, error: "API authentication failed" }, { status: 500 });
      }

      return NextResponse.json({ success: false, error: "AI service temporarily unavailable" }, { status: 500 });
    }

    const openRouterData: OpenRouterResponse = await openRouterResponse.json();

    if (!openRouterData.choices || openRouterData.choices.length === 0) {
      console.error("OpenRouter API returned no choices");
      return NextResponse.json({ success: false, error: "No response from AI service" }, { status: 500 });
    }

    const content = openRouterData.choices[0].message.content;

    // Parse the JSON response from the AI
    let concepts: string[];
    try {
      concepts = JSON.parse(content);

      // Validate that it's an array of strings
      if (!Array.isArray(concepts) || !concepts.every((item) => typeof item === "string")) {
        throw new Error("Invalid format: expected array of strings");
      }

      // Ensure we have 5-8 concepts as specified
      if (concepts.length < 5 || concepts.length > 8) {
        console.warn(`AI returned ${concepts.length} concepts, expected 5-8`);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", {
        content,
        error: parseError,
      });
      return NextResponse.json({ success: false, error: "Invalid response format from AI service" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      concepts,
    });
  } catch (error) {
    console.error("Unexpected error in generate API route:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
