import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { mindMaps, type GraphData, type MindMap } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateConcepts } from "@/lib/ai/generate-concepts";

// Request validation schema
const createMapSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  initialConcept: z
    .string()
    .min(1, "Initial concept is required")
    .max(200, "Initial concept must be 200 characters or less"),
});

interface CreateMapRequest {
  name: string;
  initialConcept: string;
}

interface CreateMapResponse {
  success: boolean;
  map?: {
    id: string;
    userId: string;
    name: string;
    graphData: GraphData;
    createdAt: Date;
    updatedAt: Date;
  };
  error?: string;
}

interface GetMapResponse {
  success: boolean;
  map?: MindMap | null;
  error?: string;
}

/**
 * Generates initial mind map content using the shared AI generation logic
 * This calls the generateConcepts function directly without HTTP overhead
 */
async function generateInitialMindMap(concept: string): Promise<GraphData> {
  try {
    // Call the shared generate concepts function directly
    const generateResult = await generateConcepts(concept);

    if (!generateResult.success || !generateResult.concepts) {
      throw new Error(generateResult.error || "Failed to generate concepts");
    }

    // Create React Flow nodes and edges from the generated concepts
    const centerNodeId = "center";
    const nodes = [
      {
        id: centerNodeId,
        type: "default",
        data: { label: concept },
        position: { x: 0, y: 0 },
      },
    ];

    const edges: Array<{
      id: string;
      source: string;
      target: string;
      type: string;
    }> = [];

    // Add concept nodes around the center
    generateResult.concepts.forEach((conceptText: string, index: number) => {
      const nodeId = `concept-${index}`;
      const angle = (index * 2 * Math.PI) / generateResult.concepts!.length;
      const radius = 200;

      // Ensure we don't place nodes at exactly (0,0) by adding a small offset for the first node
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      nodes.push({
        id: nodeId,
        type: "default",
        data: { label: conceptText },
        position: {
          x: x === 0 && y === 0 ? radius : x,
          y: y === 0 && x === radius ? 0 : y,
        },
      });

      edges.push({
        id: `edge-${centerNodeId}-${nodeId}`,
        source: centerNodeId,
        target: nodeId,
        type: "default",
      });
    });

    return {
      nodes,
      edges,
      viewport: { x: 0, y: 0, zoom: 1 },
      centralConcept: concept,
    };
  } catch (error) {
    console.error("Error generating initial mind map:", error);

    // Fallback: create a simple mind map with just the central concept
    return {
      nodes: [
        {
          id: "center",
          type: "default",
          data: { label: concept },
          position: { x: 0, y: 0 },
        },
      ],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      centralConcept: concept,
    };
  }
}

export async function GET(): Promise<NextResponse<GetMapResponse>> {
  try {
    // Authenticate user using Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    // Query database for the first mind map found for the user
    const userMaps = await db.select().from(mindMaps).where(eq(mindMaps.userId, userId)).limit(1);

    // Return the first map or null if no maps found
    const map = userMaps.length > 0 ? {
      ...userMaps[0],
      graphData: userMaps[0].graphData as GraphData,
    } : null;

    return NextResponse.json({
      success: true,
      map,
    });
  } catch (error) {
    console.error("Error fetching mind map:", error);

    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<CreateMapResponse>> {
  try {
    // Authenticate user using Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    // Parse and validate request body
    let body: CreateMapRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON in request body" }, { status: 400 });
    }

    // Validate request data using Zod
    const validation = createMapSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ");

      return NextResponse.json({ success: false, error: `Validation error: ${errorMessage}` }, { status: 400 });
    }

    const { name, initialConcept } = validation.data;

    // Generate initial mind map content using existing AI generation
    const graphData = await generateInitialMindMap(initialConcept);

    // Insert new mind map into database with retry logic for cold connections
    // Truncate name to ensure it fits within limits (though validation should catch this,
    // safe truncation prevents DB errors if schema changes)
    let newMindMap;
    const maxRetries = 2;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await db
          .insert(mindMaps)
          .values({
            userId,
            name: name.slice(0, 100),
            graphData,
          })
          .returning();

        newMindMap = result[0];
        break; // Success, exit loop
      } catch (err) {
        console.warn(`Database insert failed on attempt ${attempt + 1}:`, err);

        // If this was the last attempt, rethrow
        if (attempt === maxRetries) throw err;

        // Wait before retry (exponential backoff: 500ms, 1000ms)
        const delay = 500 * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    if (!newMindMap) {
      throw new Error("Failed to insert mind map into database after retries");
    }

    return NextResponse.json({
      success: true,
      map: {
        ...newMindMap,
        graphData: newMindMap.graphData as GraphData,
      },
    });
  } catch (error) {
    console.error("Error creating mind map:", error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("connection")) {
        return NextResponse.json(
          { success: false, error: "Database connection failed. Please try again." },
          { status: 503 }
        );
      }

      if (error.message.includes("constraint")) {
        return NextResponse.json({ success: false, error: "Invalid data provided." }, { status: 400 });
      }
    }

    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
