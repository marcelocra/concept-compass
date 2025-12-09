import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { mindMaps, type GraphData } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Validation schema for graph data
const graphDataSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      type: z.string().optional(),
      data: z.object({
        label: z.string(),
      }),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }),
    })
  ),
  edges: z.array(
    z.object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
      type: z.string().optional(),
    })
  ),
  viewport: z.object({
    x: z.number(),
    y: z.number(),
    zoom: z.number(),
  }),
  centralConcept: z.string(),
});

// Request validation schema for PUT
const updateMapSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  graphData: graphDataSchema,
});

interface UpdateMapRequest {
  name?: string;
  graphData: GraphData;
}

interface UpdateMapResponse {
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

interface DeleteMapResponse {
  success: boolean;
  error?: string;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<UpdateMapResponse>> {
  try {
    // Authenticate user using Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get map ID from params (Next.js 15 always provides params as Promise)
    const params = await context.params;
    const mapId = params.id;

    if (!mapId) {
      return NextResponse.json(
        { success: false, error: "Map ID is required" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    let body: UpdateMapRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate request data using Zod
    const validation = updateMapSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");

      return NextResponse.json(
        { success: false, error: `Validation error: ${errorMessage}` },
        { status: 400 }
      );
    }

    const { name, graphData } = validation.data;

    // Check if the mind map exists and belongs to the user
    const existingMaps = await db
      .select()
      .from(mindMaps)
      .where(and(eq(mindMaps.id, mapId), eq(mindMaps.userId, userId)))
      .limit(1);

    if (existingMaps.length === 0) {
      return NextResponse.json(
        { success: false, error: "Mind map not found or access denied" },
        { status: 404 }
      );
    }

    // Update the mind map
    const updateData: { graphData: GraphData; updatedAt: Date; name?: string } = {
      graphData,
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      updateData.name = name;
    }

    const [updatedMap] = await db
      .update(mindMaps)
      .set(updateData)
      .where(and(eq(mindMaps.id, mapId), eq(mindMaps.userId, userId)))
      .returning();

    return NextResponse.json({
      success: true,
      map: {
        ...updatedMap,
        graphData: updatedMap.graphData as GraphData,
      },
    });
  } catch (error) {
    console.error("Error updating mind map:", error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("connection")) {
        return NextResponse.json(
          { success: false, error: "Database connection failed. Please try again." },
          { status: 503 }
        );
      }

      if (error.message.includes("constraint")) {
        return NextResponse.json(
          { success: false, error: "Invalid data provided." },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<DeleteMapResponse>> {
  try {
    // Authenticate user using Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get map ID from params (Next.js 15 always provides params as Promise)
    const params = await context.params;
    const mapId = params.id;

    if (!mapId) {
      return NextResponse.json(
        { success: false, error: "Map ID is required" },
        { status: 400 }
      );
    }

    // Check if the mind map exists and belongs to the user
    const existingMaps = await db
      .select()
      .from(mindMaps)
      .where(and(eq(mindMaps.id, mapId), eq(mindMaps.userId, userId)))
      .limit(1);

    if (existingMaps.length === 0) {
      return NextResponse.json(
        { success: false, error: "Mind map not found or access denied" },
        { status: 404 }
      );
    }

    // Delete the mind map
    await db
      .delete(mindMaps)
      .where(and(eq(mindMaps.id, mapId), eq(mindMaps.userId, userId)));

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting mind map:", error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("connection")) {
        return NextResponse.json(
          { success: false, error: "Database connection failed. Please try again." },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
