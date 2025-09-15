import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { mindMaps, type GraphData, type MindMap } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
 * Generates initial mind map content using the existing AI generation logic
 * This reuses the same AI generation functionality from /api/generate
 */
async function generateInitialMindMap(concept: string): Promise<GraphData> {
  try {
    // Call the existing generate API internally
    const generateResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ concept }),
      }
    );

    if (!generateResponse.ok) {
      throw new Error("Failed to generate initial concepts");
    }

    const generateData = await generateResponse.json();

    if (!generateData.success || !generateData.concepts) {
      throw new Error("Invalid response from generate API");
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

    const edges = [];

    // Add concept nodes around the center
    generateData.concepts.forEach((conceptText: string, index: number) => {
      const nodeId = `concept-${index}`;
      const angle = (index * 2 * Math.PI) / generateData.concepts.length;
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
    const map = userMaps.length > 0 ? userMaps[0] : null;

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

    // Insert new mind map into database
    const [newMindMap] = await db
      .insert(mindMaps)
      .values({
        userId,
        name,
        graphData,
      })
      .returning();

    return NextResponse.json({
      success: true,
      map: newMindMap,
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
