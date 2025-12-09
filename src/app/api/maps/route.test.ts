import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Mock Clerk authentication
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

// Mock database
vi.mock("@/lib/db", () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  mindMaps: "mockMindMapsTable",
}));

// Mock the generateConcepts function
vi.mock("@/lib/ai/generate-concepts", () => ({
  generateConcepts: vi.fn(),
}));

// Import after mocks are set up
const { POST } = await import("./route");
const { auth } = await import("@clerk/nextjs/server");
const { db } = await import("@/lib/db");
const { generateConcepts } = await import("@/lib/ai/generate-concepts");

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
};

describe("/api/maps POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up environment variables
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value;
    });

    // Default successful auth
    vi.mocked(auth).mockResolvedValue({ userId: "user_test123" });

    // Default successful database insert
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{
          id: "map_test123",
          userId: "user_test123",
          name: "Test Mind Map",
          graphData: {
            nodes: [{ id: "center", data: { label: "Test Concept" }, position: { x: 0, y: 0 } }],
            edges: [],
            viewport: { x: 0, y: 0, zoom: 1 },
            centralConcept: "Test Concept",
          },
          createdAt: new Date("2024-01-01T00:00:00Z"),
          updatedAt: new Date("2024-01-01T00:00:00Z"),
        }]),
      }),
    });

    // Default successful AI generation using the shared function
    vi.mocked(generateConcepts).mockResolvedValue({
      success: true,
      concepts: ["Concept 1", "Concept 2", "Concept 3", "Concept 4", "Concept 5"],
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const createMockRequest = (body: unknown) => {
    return {
      json: vi.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  };

  describe("Authentication", () => {
    it("should return 401 when user is not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null });

      const request = createMockRequest({
        name: "Test Mind Map",
        initialConcept: "Test Concept",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Authentication required");
    });

    it("should proceed when user is authenticated", async () => {
      const request = createMockRequest({
        name: "Test Mind Map",
        initialConcept: "Test Concept",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(auth).toHaveBeenCalled();
    });
  });

  describe("Request validation", () => {
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

    it("should return 400 when name is missing", async () => {
      const request = createMockRequest({
        initialConcept: "Test Concept",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("name: Required");
    });

    it("should return 400 when name is empty", async () => {
      const request = createMockRequest({
        name: "",
        initialConcept: "Test Concept",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Name is required");
    });

    it("should return 400 when name is too long", async () => {
      const request = createMockRequest({
        name: "a".repeat(101),
        initialConcept: "Test Concept",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Name must be 100 characters or less");
    });

    it("should return 400 when initialConcept is missing", async () => {
      const request = createMockRequest({
        name: "Test Mind Map",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("initialConcept: Required");
    });

    it("should return 400 when initialConcept is empty", async () => {
      const request = createMockRequest({
        name: "Test Mind Map",
        initialConcept: "",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Initial concept is required");
    });

    it("should return 400 when initialConcept is too long", async () => {
      const request = createMockRequest({
        name: "Test Mind Map",
        initialConcept: "a".repeat(201),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Initial concept must be 200 characters or less");
    });

    it("should accept valid request data", async () => {
      const request = createMockRequest({
        name: "Valid Mind Map",
        initialConcept: "Valid Concept",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("AI generation integration", () => {
    it("should call the generateConcepts function with the initial concept", async () => {
      const request = createMockRequest({
        name: "Test Mind Map",
        initialConcept: "Sustainable Farming",
      });

      await POST(request);

      expect(generateConcepts).toHaveBeenCalledWith("Sustainable Farming");
    });

    it("should create mind map with generated concepts", async () => {
      const generatedConcepts = ["Vertical Farming", "Aquaponics", "Soil Health", "Water Conservation"];
      vi.mocked(generateConcepts).mockResolvedValue({
        success: true,
        concepts: generatedConcepts,
      });

      const request = createMockRequest({
        name: "Test Mind Map",
        initialConcept: "Sustainable Farming",
      });

      await POST(request);

      // Verify database insert was called with generated graph data
      const insertCall = vi.mocked(db.insert)().values.mock.calls[0][0];
      expect(insertCall.graphData.nodes).toHaveLength(5); // 1 center + 4 concepts
      expect(insertCall.graphData.edges).toHaveLength(4); // 4 edges from center to concepts
      expect(insertCall.graphData.centralConcept).toBe("Sustainable Farming");
      
      // Check that generated concepts are included in nodes
      const nodeLabels = insertCall.graphData.nodes.map((node: { data: { label: string } }) => node.data.label);
      expect(nodeLabels).toContain("Sustainable Farming"); // Center node
      generatedConcepts.forEach(concept => {
        expect(nodeLabels).toContain(concept);
      });
    });

    it("should handle AI generation failure gracefully", async () => {
      vi.mocked(generateConcepts).mockResolvedValue({
        success: false,
        error: "AI service is temporarily unavailable. Please try again.",
      });

      const request = createMockRequest({
        name: "Test Mind Map",
        initialConcept: "Test Concept",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Should create fallback mind map with just the center node
      const insertCall = vi.mocked(db.insert)().values.mock.calls[0][0];
      expect(insertCall.graphData.nodes).toHaveLength(1);
      expect(insertCall.graphData.nodes[0].data.label).toBe("Test Concept");
      expect(insertCall.graphData.edges).toHaveLength(0);
    });

    it("should handle invalid AI response gracefully", async () => {
      vi.mocked(generateConcepts).mockResolvedValue({
        success: false,
        error: "AI service error",
      });

      const request = createMockRequest({
        name: "Test Mind Map",
        initialConcept: "Test Concept",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Should create fallback mind map
      const insertCall = vi.mocked(db.insert)().values.mock.calls[0][0];
      expect(insertCall.graphData.nodes).toHaveLength(1);
      expect(insertCall.graphData.centralConcept).toBe("Test Concept");
    });
  });

  describe("Database operations", () => {
    it("should insert mind map with correct user association", async () => {
      const request = createMockRequest({
        name: "User's Mind Map",
        initialConcept: "User Concept",
      });

      await POST(request);

      expect(db.insert).toHaveBeenCalledWith("mockMindMapsTable");
      
      const insertCall = vi.mocked(db.insert)().values.mock.calls[0][0];
      expect(insertCall.userId).toBe("user_test123");
      expect(insertCall.name).toBe("User's Mind Map");
      expect(insertCall.graphData).toBeDefined();
      expect(insertCall.graphData.centralConcept).toBe("User Concept");
    });

    it("should return created mind map data", async () => {
      const mockCreatedMap = {
        id: "map_created123",
        userId: "user_test123",
        name: "Created Mind Map",
        graphData: {
          nodes: [{ id: "center", data: { label: "Created Concept" }, position: { x: 0, y: 0 } }],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
          centralConcept: "Created Concept",
        },
        createdAt: "2024-01-01T12:00:00.000Z",
        updatedAt: "2024-01-01T12:00:00.000Z",
      };

      vi.mocked(db.insert)().values().returning.mockResolvedValue([mockCreatedMap]);

      const request = createMockRequest({
        name: "Created Mind Map",
        initialConcept: "Created Concept",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.map).toEqual(mockCreatedMap);
    });

    it("should retry database insertion on failure and succeed", async () => {
      // Fail 2 times, then succeed
      const mockCreatedMap = {
        id: "map_created123",
        userId: "user_test123",
        name: "Created Mind Map",
        graphData: {},
        createdAt: "2024-01-01T12:00:00.000Z",
        updatedAt: "2024-01-01T12:00:00.000Z",
      };

      const returningMock = vi.mocked(db.insert)().values().returning;

      returningMock
        .mockRejectedValueOnce(new Error("connection failed"))
        .mockRejectedValueOnce(new Error("connection failed"))
        .mockResolvedValueOnce([mockCreatedMap]);

      const request = createMockRequest({
        name: "Test Mind Map",
        initialConcept: "Test Concept",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(returningMock).toHaveBeenCalledTimes(3);
    });

    it("should handle database connection errors after retries", async () => {
      // Fail 3 times (initial + 2 retries)
      vi.mocked(db.insert)().values().returning.mockRejectedValue(new Error("connection failed"));

      // Clear the call made during setup above
      vi.mocked(db.insert).mockClear();

      const request = createMockRequest({
        name: "Test Mind Map",
        initialConcept: "Test Concept",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Database connection failed. Please try again.");
      expect(db.insert).toHaveBeenCalledTimes(3);
    });

    it("should handle database constraint errors", async () => {
      vi.mocked(db.insert)().values().returning.mockRejectedValue(new Error("constraint violation"));

      const request = createMockRequest({
        name: "Test Mind Map",
        initialConcept: "Test Concept",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid data provided.");
    });

    it("should handle unexpected database errors", async () => {
      vi.mocked(db.insert)().values().returning.mockRejectedValue(new Error("unexpected error"));

      const request = createMockRequest({
        name: "Test Mind Map",
        initialConcept: "Test Concept",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Internal server error");
    });
  });

  describe("Graph data generation", () => {
    it("should create proper React Flow node structure", async () => {
      const request = createMockRequest({
        name: "Test Mind Map",
        initialConcept: "Central Concept",
      });

      await POST(request);

      const insertCall = vi.mocked(db.insert)().values.mock.calls[0][0];
      const { nodes, edges } = insertCall.graphData;

      // Check center node
      const centerNode = nodes.find((node: { id: string; data: { label: string }; position: { x: number; y: number } }) => node.id === "center");
      expect(centerNode).toBeDefined();
      expect(centerNode?.data.label).toBe("Central Concept");
      expect(centerNode?.position).toEqual({ x: 0, y: 0 });

      // Check concept nodes are positioned around center
      const conceptNodes = nodes.filter((node: { id: string }) => node.id !== "center");
      conceptNodes.forEach((node: { position: { x: number; y: number }; data: { label: string } }) => {
        // At least one coordinate should be non-zero (nodes are positioned in a circle)
        expect(Math.abs(node.position.x) + Math.abs(node.position.y)).toBeGreaterThan(0);
        expect(node.data.label).toBeDefined();
      });

      // Check edges connect center to all concept nodes
      edges.forEach((edge: { source: string; target: string }) => {
        expect(edge.source).toBe("center");
        expect(edge.target).toMatch(/^concept-\d+$/);
      });
    });

    it("should set proper viewport defaults", async () => {
      const request = createMockRequest({
        name: "Test Mind Map",
        initialConcept: "Test Concept",
      });

      await POST(request);

      const insertCall = vi.mocked(db.insert)().values.mock.calls[0][0];
      expect(insertCall.graphData.viewport).toEqual({ x: 0, y: 0, zoom: 1 });
    });

    it("should store central concept correctly", async () => {
      const request = createMockRequest({
        name: "Test Mind Map",
        initialConcept: "My Central Concept",
      });

      await POST(request);

      const insertCall = vi.mocked(db.insert)().values.mock.calls[0][0];
      expect(insertCall.graphData.centralConcept).toBe("My Central Concept");
    });
  });

  describe("Error handling", () => {
    it("should handle unexpected errors gracefully", async () => {
      vi.mocked(auth).mockRejectedValue(new Error("Unexpected auth error"));

      const request = createMockRequest({
        name: "Test Mind Map",
        initialConcept: "Test Concept",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Internal server error");
    });

    it("should log errors for debugging", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(db.insert)().values().returning.mockRejectedValue(new Error("Database error"));

      const request = createMockRequest({
        name: "Test Mind Map",
        initialConcept: "Test Concept",
      });

      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith("Error creating mind map:", expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });
});