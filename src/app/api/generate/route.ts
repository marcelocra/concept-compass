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

    // Retry logic with exponential backoff
    const maxRetries = 2;
    let openRouterResponse: Response | null = null;
    let openRouterData: OpenRouterResponse | null = null;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`OpenRouter API attempt ${attempt + 1}/${maxRetries + 1}`);

        // Calculate timeout and delay
        const timeoutMs = 20000 + attempt * 10000; // 20s, 30s, 40s
        const delayMs = attempt > 0 ? Math.min(1000 * Math.pow(2, attempt - 1), 5000) : 0; // 0ms, 1s, 2s

        // Wait before retry (except first attempt)
        if (delayMs > 0) {
          console.log(`Waiting ${delayMs}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }

        // Make API call with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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

          clearTimeout(timeoutId);

          // If we get a response, validate the content before breaking
          if (openRouterResponse.ok) {
            // Parse and validate the response content
            try {
              const responseData: OpenRouterResponse = await openRouterResponse.json();

              if (!responseData.choices || responseData.choices.length === 0) {
                console.warn(`OpenRouter API returned no choices on attempt ${attempt + 1}`);
                lastError = new Error("No choices in API response");
                continue; // Retry
              }

              const responseContent = responseData.choices[0].message.content;

              if (!responseContent || responseContent.trim() === "") {
                console.warn(`OpenRouter API returned empty content on attempt ${attempt + 1}`);
                lastError = new Error("Empty content in API response");
                continue; // Retry
              }

              // Content looks good, store the data and break out of retry loop
              openRouterData = responseData;
              console.log(`OpenRouter API succeeded with valid content on attempt ${attempt + 1}`);
              break;
            } catch (parseError) {
              console.warn(`Failed to parse OpenRouter response on attempt ${attempt + 1}:`, parseError);
              lastError = new Error("Failed to parse API response");
              continue; // Retry
            }
          } else {
            // Handle specific HTTP errors
            const errorText = await openRouterResponse.text();
            console.warn(`OpenRouter API returned ${openRouterResponse.status} on attempt ${attempt + 1}:`, errorText);

            // Don't retry on certain errors
            if (openRouterResponse.status === 401 || openRouterResponse.status === 403) {
              console.error("Authentication error - not retrying");
              break;
            }

            // For other errors, continue to retry
            lastError = new Error(`HTTP ${openRouterResponse.status}: ${errorText}`);
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);

          if (fetchError instanceof Error) {
            if (fetchError.name === "AbortError") {
              console.warn(`OpenRouter API timed out on attempt ${attempt + 1}`);
              lastError = new Error(`Request timed out after ${timeoutMs}ms`);
            } else {
              console.warn(`OpenRouter API fetch error on attempt ${attempt + 1}:`, fetchError.message);
              lastError = fetchError;
            }
          } else {
            lastError = new Error("Unknown fetch error");
          }
        }
      } catch (error) {
        console.error(`Unexpected error on attempt ${attempt + 1}:`, error);
        lastError = error instanceof Error ? error : new Error("Unknown error");
      }

      // If this was the last attempt, we'll exit the loop
      if (attempt === maxRetries) {
        console.error(`All ${maxRetries + 1} attempts failed`);
      }
    }

    // Check if we have a successful response
    if (!openRouterResponse || !openRouterResponse.ok) {
      console.error("OpenRouter API failed after all retries:", lastError?.message);

      // Handle specific error cases
      if (openRouterResponse?.status === 429) {
        return NextResponse.json(
          { success: false, error: "AI service is currently overloaded. Please try again in a moment." },
          { status: 429 }
        );
      }

      if (openRouterResponse?.status === 401 || openRouterResponse?.status === 403) {
        return NextResponse.json({ success: false, error: "API authentication failed" }, { status: 500 });
      }

      // Generic error for other cases
      return NextResponse.json(
        { success: false, error: "AI service is temporarily unavailable. Please try again." },
        { status: 500 }
      );
    }

    // Use the data we already parsed and validated in the retry loop
    if (!openRouterData) {
      console.error("No valid response data after retries");
      return NextResponse.json(
        { success: false, error: "AI service failed to provide valid response after retries." },
        { status: 500 }
      );
    }

    const content = openRouterData.choices[0].message.content;

    // Parse the JSON response from the AI
    let concepts: string[];
    try {
      // Clean the content - sometimes AI adds markdown formatting
      const cleanContent = content
        .trim()
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");

      concepts = JSON.parse(cleanContent);

      // Validate that it's an array of strings
      if (!Array.isArray(concepts) || !concepts.every((item) => typeof item === "string")) {
        throw new Error("Invalid format: expected array of strings");
      }

      // Ensure we have at least some concepts
      if (concepts.length === 0) {
        throw new Error("AI returned empty array");
      }

      // Ensure we have reasonable number of concepts
      if (concepts.length < 3) {
        console.warn(`AI returned only ${concepts.length} concepts, which is too few`);
        throw new Error("AI returned insufficient concepts");
      } else if (concepts.length > 8) {
        console.warn(`AI returned ${concepts.length} concepts, trimming to 8`);
        concepts = concepts.slice(0, 8);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", {
        content: content?.substring(0, 200) + (content?.length > 200 ? "..." : ""), // Log first 200 chars only
        error: parseError,
      });

      // Return a user-friendly error instead of fallback concepts
      return NextResponse.json(
        {
          success: false,
          error: "The AI had trouble understanding your concept. Please try rephrasing it or try a different concept.",
        },
        { status: 500 }
      );
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
