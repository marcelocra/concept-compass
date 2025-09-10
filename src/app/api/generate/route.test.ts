import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock environment variables
const mockEnv = {
  OPENROUTER_API_KEY: "test-api-key",
  NODE_ENV: "test",
  OPENROUTER_MODEL: "gpt-oss-120b",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
};

describe("/api/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up environment variables
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value;
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const createMockRequest = (body: Record<string, unknown>) => {
    return {
      json: vi.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  };

  const createMockOpenRouterResponse = (content: string, status = 200) => {
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? "OK" : "Error",
      json: vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content,
            },
          },
        ],
      }),
      text: vi.fn().mockResolvedValue(`Error ${status}`),
    };
  };

  describe("Request validation", () => {
    it("should return 400 when concept parameter is missing", async () => {
      const request = createMockRequest({});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Concept parameter is required and must be a string");
    });

    it("should return 400 when concept parameter is not a string", async () => {
      const request = createMockRequest({ concept: 123 });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Concept parameter is required and must be a string");
    });

    it("should return 400 when concept is empty after sanitization", async () => {
      const request = createMockRequest({ concept: "   " });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Concept cannot be empty after sanitization");
    });

    it("should return 400 when request body is invalid JSON", async () => {
      const request = {
        json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
      } as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid JSON in request body");
    });
  });

  describe("Environment validation", () => {
    it("should return 500 when OPENROUTER_API_KEY is not set", async () => {
      delete process.env.OPENROUTER_API_KEY;

      const request = createMockRequest({ concept: "test concept" });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("API configuration error");
    });
  });

  describe("Model selection", () => {
    it("should use gpt-oss-20b in development environment", async () => {
      vi.stubEnv('NODE_ENV', 'development');

      const mockResponse = createMockOpenRouterResponse(
        '["Concept 1", "Concept 2", "Concept 3", "Concept 4", "Concept 5"]'
      );
      mockFetch.mockResolvedValue(mockResponse);

      const request = createMockRequest({ concept: "test concept" });

      await POST(request);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://openrouter.ai/api/v1/chat/completions",
        expect.objectContaining({
          body: expect.stringContaining('"model":"gpt-oss-20b"'),
        })
      );
    });

    it("should use gpt-oss-120b in production environment", async () => {
      vi.stubEnv('NODE_ENV', 'production');

      const mockResponse = createMockOpenRouterResponse(
        '["Concept 1", "Concept 2", "Concept 3", "Concept 4", "Concept 5"]'
      );
      mockFetch.mockResolvedValue(mockResponse);

      const request = createMockRequest({ concept: "test concept" });

      await POST(request);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://openrouter.ai/api/v1/chat/completions",
        expect.objectContaining({
          body: expect.stringContaining('"model":"gpt-oss-120b"'),
        })
      );
    });

    it("should use OPENROUTER_MODEL environment variable when set", async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('OPENROUTER_MODEL', 'custom-model');

      const mockResponse = createMockOpenRouterResponse(
        '["Concept 1", "Concept 2", "Concept 3", "Concept 4", "Concept 5"]'
      );
      mockFetch.mockResolvedValue(mockResponse);

      const request = createMockRequest({ concept: "test concept" });

      await POST(request);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://openrouter.ai/api/v1/chat/completions",
        expect.objectContaining({
          body: expect.stringContaining('"model":"custom-model"'),
        })
      );
    });
  });

  describe("OpenRouter API integration", () => {
    it("should make correct API call to OpenRouter", async () => {
      const mockResponse = createMockOpenRouterResponse(
        '["Concept 1", "Concept 2", "Concept 3", "Concept 4", "Concept 5"]'
      );
      mockFetch.mockResolvedValue(mockResponse);

      const request = createMockRequest({ concept: "sustainable farming" });

      await POST(request);

      expect(mockFetch).toHaveBeenCalledWith("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-api-key",
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Concept Compass MVP",
        },
        body: expect.stringContaining('"sustainable farming"'),
      });
    });

    it("should return successful response with valid concepts", async () => {
      const concepts = [
        "Vertical Farming",
        "Community Gardens",
        "Aquaponics",
        "Rooftop Agriculture",
        "Hydroponic Systems",
      ];
      const mockResponse = createMockOpenRouterResponse(JSON.stringify(concepts));
      mockFetch.mockResolvedValue(mockResponse);

      const request = createMockRequest({ concept: "sustainable farming" });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.concepts).toEqual(concepts);
    });

    it("should sanitize concept input", async () => {
      const mockResponse = createMockOpenRouterResponse(
        '["Concept 1", "Concept 2", "Concept 3", "Concept 4", "Concept 5"]'
      );
      mockFetch.mockResolvedValue(mockResponse);

      const request = createMockRequest({ concept: '  <script>alert("xss")</script>farming  ' });

      await POST(request);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.messages[0].content).toContain("farming");
      expect(callBody.messages[0].content).not.toContain("<script>");
      expect(callBody.messages[0].content).not.toContain("</script>");
    });
  });

  describe("Error handling", () => {
    it("should handle 429 rate limit errors", async () => {
      const mockResponse = createMockOpenRouterResponse("Rate limited", 429);
      mockFetch.mockResolvedValue(mockResponse);

      const request = createMockRequest({ concept: "test concept" });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Rate limit exceeded. Please try again later.");
    });

    it("should handle 401 authentication errors", async () => {
      const mockResponse = createMockOpenRouterResponse("Unauthorized", 401);
      mockFetch.mockResolvedValue(mockResponse);

      const request = createMockRequest({ concept: "test concept" });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("API authentication failed");
    });

    it("should handle other OpenRouter API errors", async () => {
      const mockResponse = createMockOpenRouterResponse("Server Error", 500);
      mockFetch.mockResolvedValue(mockResponse);

      const request = createMockRequest({ concept: "test concept" });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("AI service temporarily unavailable");
    });

    it("should handle invalid JSON response from OpenRouter", async () => {
      const mockResponse = createMockOpenRouterResponse("This is not valid JSON");
      mockFetch.mockResolvedValue(mockResponse);

      const request = createMockRequest({ concept: "test concept" });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid response format from AI service");
    });

    it("should handle empty choices from OpenRouter", async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ choices: [] }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const request = createMockRequest({ concept: "test concept" });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("No response from AI service");
    });

    it("should handle non-array response from AI", async () => {
      const mockResponse = createMockOpenRouterResponse('{"not": "an array"}');
      mockFetch.mockResolvedValue(mockResponse);

      const request = createMockRequest({ concept: "test concept" });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid response format from AI service");
    });

    it("should handle unexpected errors", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const request = createMockRequest({ concept: "test concept" });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Internal server error");
    });
  });

  describe("Input sanitization", () => {
    it("should limit concept length to 100 characters", async () => {
      const longConcept = "a".repeat(150);
      const mockResponse = createMockOpenRouterResponse(
        '["Concept 1", "Concept 2", "Concept 3", "Concept 4", "Concept 5"]'
      );
      mockFetch.mockResolvedValue(mockResponse);

      const request = createMockRequest({ concept: longConcept });

      await POST(request);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      const promptContent = callBody.messages[0].content;
      const conceptInPrompt = promptContent.match(/"([^"]+)"/)[1];

      expect(conceptInPrompt.length).toBe(100);
    });

    it("should remove dangerous characters", async () => {
      const dangerousConcept = 'farming<script>alert("xss")</script>';
      const mockResponse = createMockOpenRouterResponse(
        '["Concept 1", "Concept 2", "Concept 3", "Concept 4", "Concept 5"]'
      );
      mockFetch.mockResolvedValue(mockResponse);

      const request = createMockRequest({ concept: dangerousConcept });

      await POST(request);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      const promptContent = callBody.messages[0].content;

      expect(promptContent).toContain("farming");
      expect(promptContent).not.toContain("<");
      expect(promptContent).not.toContain(">");
    });
  });
});
