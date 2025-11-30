import { NextRequest } from "next/server";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Set up environment variables for testing
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

// Mock database
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock schema
vi.mock("@/lib/db/schema", () => ({
  mindMaps: "mockMindMapsTable",
}));

// Mock drizzle-orm functions
vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  and: vi.fn(),
}));

// Dynamic imports after mocking
const { PUT, DELETE } = await import("./route");
const { auth } = await import("@clerk/nextjs/server");
const { db } = await import("@/lib/db");

describe("/api/maps/[id] PUT Route", () => {
  const mockUserId = "user_test123";
  const mockMapId = "map_test456";
  const mockGraphData = {
    nodes: [
      {
        id: "center",
        type: "default",
        data: { label: "Test Concept" },
        position: { x: 0, y: 0 },
      },
    ],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    centralConcept: "Test Concept",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default successful mocks
    vi.mocked(auth).mockResolvedValue({ userId: mockUserId });
    
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            {
              id: mockMapId,
              userId: mockUserId,
              name: "Test Map",
              graphData: mockGraphData,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]),
        }),
      }),
    });

    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: mockMapId,
              userId: mockUserId,
              name: "Updated Test Map",
              graphData: mockGraphData,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]),
        }),
      }),
    });
  });

  describe("Authentication", () => {
    it("should return 401 when user is not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null });

      const request = new NextRequest("http://localhost:3000/api/maps/test", {
        method: "PUT",
        body: JSON.stringify({
          graphData: mockGraphData,
        }),
      });

      const response = await PUT(request, { params: { id: mockMapId } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Authentication required");
    });

    it("should proceed when user is authenticated", async () => {
      const request = new NextRequest("http://localhost:3000/api/maps/test", {
        method: "PUT",
        body: JSON.stringify({
          graphData: mockGraphData,
        }),
      });

      const response = await PUT(request, { params: { id: mockMapId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("Request Validation", () => {
    it("should return 400 for invalid JSON", async () => {
      const request = new NextRequest("http://localhost:3000/api/maps/test", {
        method: "PUT",
        body: "invalid json",
      });

      const response = await PUT(request, { params: { id: mockMapId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid JSON in request body");
    });

    it("should return 400 when map ID is missing", async () => {
      const request = new NextRequest("http://localhost:3000/api/maps/test", {
        method: "PUT",
        body: JSON.stringify({
          graphData: mockGraphData,
        }),
      });

      const response = await PUT(request, { params: { id: "" } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Map ID is required");
    });

    it("should return 400 for missing graphData", async () => {
      const request = new NextRequest("http://localhost:3000/api/maps/test", {
        method: "PUT",
        body: JSON.stringify({
          name: "Test Map",
        }),
      });

      const response = await PUT(request, { params: { id: mockMapId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("Validation error");
    });

    it("should accept valid request with only graphData", async () => {
      const request = new NextRequest("http://localhost:3000/api/maps/test", {
        method: "PUT",
        body: JSON.stringify({
          graphData: mockGraphData,
        }),
      });

      const response = await PUT(request, { params: { id: mockMapId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("should accept valid request with name and graphData", async () => {
      const request = new NextRequest("http://localhost:3000/api/maps/test", {
        method: "PUT",
        body: JSON.stringify({
          name: "Updated Map Name",
          graphData: mockGraphData,
        }),
      });

      const response = await PUT(request, { params: { id: mockMapId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("Ownership Verification", () => {
    it("should return 404 when mind map does not exist", async () => {
      // Mock empty result for map lookup
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // Empty array = not found
          }),
        }),
      });

      const request = new NextRequest("http://localhost:3000/api/maps/test", {
        method: "PUT",
        body: JSON.stringify({
          graphData: mockGraphData,
        }),
      });

      const response = await PUT(request, { params: { id: "nonexistent" } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Mind map not found or access denied");
    });
  });

  describe("Database Operations", () => {
    it("should update mind map with graphData only", async () => {
      const request = new NextRequest("http://localhost:3000/api/maps/test", {
        method: "PUT",
        body: JSON.stringify({
          graphData: mockGraphData,
        }),
      });

      const response = await PUT(request, { params: { id: mockMapId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.map).toBeDefined();
      expect(data.map?.graphData).toEqual(mockGraphData);
    });

    it("should handle database connection errors", async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockRejectedValue(new Error("connection failed")),
          }),
        }),
      });

      const request = new NextRequest("http://localhost:3000/api/maps/test", {
        method: "PUT",
        body: JSON.stringify({
          graphData: mockGraphData,
        }),
      });

      const response = await PUT(request, { params: { id: mockMapId } });
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Database connection failed. Please try again.");
    });
  });
});

describe("/api/maps/[id] DELETE Route", () => {
  const mockUserId = "user_test123";
  const mockMapId = "map_test456";

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default successful mocks
    vi.mocked(auth).mockResolvedValue({ userId: mockUserId });
    
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            {
              id: mockMapId,
              userId: mockUserId,
              name: "Test Map",
              graphData: {},
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]),
        }),
      }),
    });

    vi.mocked(db.delete).mockReturnValue({
      where: vi.fn().mockResolvedValue({ rowCount: 1 }),
    });
  });

  describe("Authentication", () => {
    it("should return 401 when user is not authenticated", async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null });

      const request = new NextRequest("http://localhost:3000/api/maps/test", {
        method: "DELETE",
      });

      const response = await DELETE(request, { params: { id: mockMapId } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Authentication required");
    });

    it("should proceed when user is authenticated", async () => {
      const request = new NextRequest("http://localhost:3000/api/maps/test", {
        method: "DELETE",
      });

      const response = await DELETE(request, { params: { id: mockMapId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("Request Validation", () => {
    it("should return 400 when map ID is missing", async () => {
      const request = new NextRequest("http://localhost:3000/api/maps/test", {
        method: "DELETE",
      });

      const response = await DELETE(request, { params: { id: "" } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Map ID is required");
    });
  });

  describe("Ownership Verification", () => {
    it("should return 404 when mind map does not exist", async () => {
      // Mock empty result for map lookup
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // Empty array = not found
          }),
        }),
      });

      const request = new NextRequest("http://localhost:3000/api/maps/test", {
        method: "DELETE",
      });

      const response = await DELETE(request, { params: { id: "nonexistent" } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Mind map not found or access denied");
    });
  });

  describe("Database Operations", () => {
    it("should successfully delete mind map", async () => {
      const request = new NextRequest("http://localhost:3000/api/maps/test", {
        method: "DELETE",
      });

      const response = await DELETE(request, { params: { id: mockMapId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.error).toBeUndefined();
    });

    it("should handle database connection errors", async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockRejectedValue(new Error("connection failed")),
          }),
        }),
      });

      const request = new NextRequest("http://localhost:3000/api/maps/test", {
        method: "DELETE",
      });

      const response = await DELETE(request, { params: { id: mockMapId } });
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Database connection failed. Please try again.");
    });
  });
});