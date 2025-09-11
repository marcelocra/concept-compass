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
  return `Generate exactly 5 to 7 diverse concepts related to "${concept}".

CRITICAL: Your response must be ONLY a valid JSON array of strings. No explanations, no markdown, no additional text.

Format: ["Concept 1", "Concept 2", "Concept 3", "Concept 4", "Concept 5"]

For the concept list, provide a mix of:
- A core component or principle
- A practical application or use case  
- A potential challenge or consideration
- A related technology or tool
- A surprising or "out-of-the-box" connection

Example for "Sustainable Urban Farming":
["Vertical Farming", "Community Supported Agriculture", "Water Scarcity", "IoT Soil Sensors", "Mycoremediation"]

Now generate for "${concept}":`;
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

    // Make OpenRouter API call with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let openRouterResponse: Response;
    try {
      openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error("OpenRouter API request timed out");
        return NextResponse.json(
          { success: false, error: "AI service is taking too long to respond. Please try again." },
          { status: 504 }
        );
      }
      throw fetchError; // Re-throw other fetch errors
    } finally {
      clearTimeout(timeoutId);
    }

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

    // Check if content is empty or null
    if (!content || content.trim() === "") {
      console.error("OpenRouter API returned empty content");
      return NextResponse.json(
        { success: false, error: "AI service returned empty response. Please try again." },
        { status: 500 }
      );
    }

    // Parse the JSON response from the AI
    let concepts: string[];
    try {
      // Clean the content - sometimes AI adds markdown formatting
      const cleanContent = content.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
      
      concepts = JSON.parse(cleanContent);

      // Validate that it's an array of strings
      if (!Array.isArray(concepts) || !concepts.every((item) => typeof item === "string")) {
        throw new Error("Invalid format: expected array of strings");
      }

      // Ensure we have at least some concepts
      if (concepts.length === 0) {
        throw new Error("AI returned empty array");
      }

      // Ensure we have 5-8 concepts as specified, but be flexible
      if (concepts.length < 3) {
        console.warn(`AI returned only ${concepts.length} concepts, padding with generic ones`);
        // Add some generic related concepts if we get too few
        const genericConcepts = ["Related Topic", "Connected Idea", "Associated Concept"];
        while (concepts.length < 5 && genericConcepts.length > 0) {
          concepts.push(genericConcepts.shift()!);
        }
      } else if (concepts.length > 8) {
        console.warn(`AI returned ${concepts.length} concepts, trimming to 8`);
        concepts = concepts.slice(0, 8);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", {
        content: content?.substring(0, 200) + (content?.length > 200 ? '...' : ''), // Log first 200 chars only
        error: parseError,
      });
      
      // Try to provide a fallback response with generic concepts
      const fallbackConcepts = [
        "Related Concept 1",
        "Connected Idea",
        "Associated Topic",
        "Similar Theme",
        "Linked Subject"
      ];
      
      console.warn("Using fallback concepts due to AI parsing error");
      return NextResponse.json({ 
        success: true, 
        concepts: fallbackConcepts,
        warning: "AI response was malformed, using fallback concepts"
      }, { status: 200 });
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
