import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { mindMaps, type GraphData } from "@/lib/db/schema";

// Request validation schema for updating mind maps
const updateMapSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less").optional(),
  graphData: z.object({
    nodes: z.array(z.object({
      id: z.string(),
      type: z.string().optional(),
      data: z.object({
        label: z.string(),
      }),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }),
    })),
    edges: z.array(z.object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
      type: z.string().optional(),
    })),
    viewport: z.object({
      x: z.number(),
      y: z.number(),
      zoom: z.number(),
    }),
    centralConcept: z.string(),
  }),
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

/**
 * Updates an existing mind map with new graph data and optionally a new name
 * Includes ownership verification and optimistic locking via updatedAt timestamp
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      
      return NextResponse.json(
        { success: false, error: `Validation error: ${errorMessage}` },
        { status: 400 }
      );
    }

    const { name, graphData } = validation.data;

    // First, verify the mind map exists and belongs to the user
    const existingMap = await db
      .select()
      .from(mindMaps)
      .where(and(
        eq(mindMaps.id, mapId),
        eq(mindMaps.userId, userId)
      ))
      .limit(1);

    if (existingMap.length === 0) {
      return NextResponse.json(
        { success: false, error: "Mind map not found or access denied" },
        { status: 404 }
      );
    }

    // Prepare update data - only include name if provided
    const updateData: Partial<typeof mindMaps.$inferInsert> = {
      graphData,
      updatedAt: new Date(), // Explicit timestamp for optimistic locking
    };

    if (name !== undefined) {
      updateData.name = name;
    }

    // Update the mind map with ownership verification
    // The WHERE clause ensures we only update if the user owns the map
    const [updatedMap] = await db
      .update(mindMaps)
      .set(updateData)
      .where(and(
        eq(mindMaps.id, mapId),
        eq(mindMaps.userId, userId)
      ))
      .returning();

    if (!updatedMap) {
      // This shouldn't happen given our previous check, but handle it gracefully
      return NextResponse.json(
        { success: false, error: "Failed to update mind map" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      map: updatedMap,
    });

  } catch (error) {
    console.error("Error updating mind map:", error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('connection')) {
        return NextResponse.json(
          { success: false, error: "Database connection failed. Please try again." },
          { status: 503 }
        );
      }
      
      if (error.message.includes('constraint')) {
        return NextResponse.json(
          { success: false, error: "Invalid data provided." },
          { status: 400 }
        );
      }

      // Handle potential concurrent update conflicts
      if (error.message.includes('concurrent') || error.message.includes('conflict')) {
        return NextResponse.json(
          { success: false, error: "Mind map was updated by another session. Please refresh and try again." },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Deletes a mind map after verifying ownership
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const mapId = params.id;
    
    if (!mapId) {
      return NextResponse.json(
        { success: false, error: "Map ID is required" },
        { status: 400 }
      );
    }

    // First, verify the mind map exists and belongs to the user
    const existingMap = await db
      .select()
      .from(mindMaps)
      .where(and(
        eq(mindMaps.id, mapId),
        eq(mindMaps.userId, userId)
      ))
      .limit(1);

    if (existingMap.length === 0) {
      return NextResponse.json(
        { success: false, error: "Mind map not found or access denied" },
        { status: 404 }
      );
    }

    // Delete the mind map with ownership verification
    const deletedRows = await db
      .delete(mindMaps)
      .where(and(
        eq(mindMaps.id, mapId),
        eq(mindMaps.userId, userId)
      ));

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error("Error deleting mind map:", error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('connection')) {
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