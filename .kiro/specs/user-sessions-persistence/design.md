# Design Document

## Overview

This design transforms Concept Compass from a stateless application into a fully-featured, persistent mind mapping platform. The architecture integrates Clerk for authentication, Supabase for PostgreSQL database storage, and Drizzle ORM for type-safe database operations. The design maintains the existing React Flow-based mind mapping experience while adding user accounts, data persistence, and mind map management capabilities.

The core user flow becomes: Sign In → View Saved Maps → Create/Load Mind Map → Edit & Save → Manage Maps. All existing mind mapping functionality (AI generation, node clicking, infinite exploration) remains intact while being enhanced with persistence.

## Architecture

### High-Level Architecture

```mermaid
graph TB
    A[User Browser] --> B[Next.js Frontend]
    B --> C[Clerk Authentication]
    B --> D[Mind Map Components]
    B --> E[API Routes]
    E --> F[Drizzle ORM]
    F --> G[Supabase PostgreSQL]
    E --> H[OpenRouter API]

    subgraph "Client-Side"
        B
        D
        I[Auth Context]
        J[Mind Map List]
        K[Mind Map Canvas]
    end

    subgraph "Authentication"
        C
        L[Clerk Middleware]
    end

    subgraph "Server-Side API"
        E
        M[/api/maps]
        N[/api/maps/[id]]
        O[/api/generate]
    end

    subgraph "Database Layer"
        F
        P[Schema Definition]
        Q[Database Queries]
    end

    subgraph "External Services"
        G
        H
    end
```

### Technology Stack Integration

-   **Authentication**: Clerk with Next.js middleware
-   **Database**: Supabase PostgreSQL with connection pooling
-   **ORM**: Drizzle ORM with TypeScript support
-   **State Management**: React Context for auth, local state for mind maps
-   **API Security**: Clerk user verification on all protected routes
-   **Data Storage**: JSONB for React Flow graph data

## Components and Interfaces

### 1. Database Schema (`src/lib/db/schema.ts`)

```typescript
import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const mindMaps = pgTable("mind_maps", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    graphData: jsonb("graph_data").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type MindMap = typeof mindMaps.$inferSelect;
export type NewMindMap = typeof mindMaps.$inferInsert;

// Graph data structure stored in JSONB
export interface GraphData {
    nodes: Node[];
    edges: Edge[];
    viewport: {
        x: number;
        y: number;
        zoom: number;
    };
    centralConcept: string;
}
```

### 2. Database Configuration (`src/lib/db/index.ts`)

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
```

### 3. API Route Interfaces

#### GET /api/maps

```typescript
interface GetMapsResponse {
    success: boolean;
    maps?: MindMap[];
    error?: string;
}
```

#### POST /api/maps

```typescript
interface CreateMapRequest {
    name: string;
    initialConcept: string;
}

interface CreateMapResponse {
    success: boolean;
    map?: MindMap;
    error?: string;
}
```

#### PUT /api/maps/[id]

```typescript
interface UpdateMapRequest {
    name?: string;
    graphData: GraphData;
}

interface UpdateMapResponse {
    success: boolean;
    map?: MindMap;
    error?: string;
}
```

#### DELETE /api/maps/[id]

```typescript
interface DeleteMapResponse {
    success: boolean;
    error?: string;
}
```

### 4. Enhanced Main Page Component (`src/app/page.tsx`)

```typescript
interface MainPageState {
    user: User | null;
    savedMaps: MindMap[];
    currentMap: MindMap | null;
    isLoading: boolean;
    error: string | null;
    showCreateDialog: boolean;
    hasUnsavedChanges: boolean;
}

interface MainPageProps {
    // No props needed - uses Clerk's useUser hook
}
```

### 5. Mind Map List Component (`src/components/mind-map/mind-map-list.tsx`)

```typescript
interface MindMapListProps {
    maps: MindMap[];
    onSelectMap: (map: MindMap) => void;
    onDeleteMap: (mapId: string) => void;
    onCreateNew: () => void;
    isLoading?: boolean;
}

interface MindMapCardProps {
    map: MindMap;
    onSelect: () => void;
    onDelete: () => void;
}
```

### 6. Enhanced Mind Map Canvas (`src/components/mind-map/mind-map-canvas.tsx`)

```typescript
interface MindMapCanvasProps {
    map: MindMap | null;
    onSave: (graphData: GraphData) => void;
    onNodeClick: (concept: string) => void;
    isLoading?: boolean;
    hasUnsavedChanges?: boolean;
}

interface MindMapCanvasState {
    nodes: Node[];
    edges: Edge[];
    viewport: Viewport;
    isInitialized: boolean;
    lastSavedState: string; // JSON string for comparison
}
```

### 7. Create Mind Map Dialog (`src/components/mind-map/create-mind-map-dialog.tsx`)

```typescript
interface CreateMindMapDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, concept: string) => void;
    isLoading?: boolean;
}

interface CreateMindMapForm {
    name: string;
    initialConcept: string;
}
```

## Data Models

### Mind Map Data Flow

```typescript
// Client-side mind map state
interface MindMapState {
    id: string;
    name: string;
    graphData: GraphData;
    createdAt: string;
    updatedAt: string;
    hasUnsavedChanges: boolean;
}

// API request/response types
interface SaveMindMapPayload {
    name?: string;
    graphData: GraphData;
}

// Database storage format
interface StoredMindMap {
    id: string;
    userId: string;
    name: string;
    graphData: GraphData; // JSONB in PostgreSQL
    createdAt: Date;
    updatedAt: Date;
}
```

### Authentication Integration

```typescript
// Clerk user context
interface AuthState {
    user: User | null;
    isLoaded: boolean;
    isSignedIn: boolean;
}

// Protected API middleware
interface AuthenticatedRequest extends NextRequest {
    userId: string; // Added by Clerk middleware
}
```

## Error Handling

### Client-Side Error Handling

1. **Authentication Errors**:

    - Redirect to sign-in on 401 responses
    - Handle Clerk authentication failures gracefully
    - Show user-friendly messages for auth issues

2. **Database Operation Errors**:

    - Retry mechanisms for transient failures
    - Optimistic updates with rollback on failure
    - Clear error messages for different failure types

3. **Network Errors**:
    - Offline detection and queuing
    - Automatic retry with exponential backoff
    - User notification of connectivity issues

### Server-Side Error Handling

```typescript
// API error response format
interface APIError {
    success: false;
    error: string;
    code?:
        | "UNAUTHORIZED"
        | "FORBIDDEN"
        | "NOT_FOUND"
        | "VALIDATION_ERROR"
        | "DATABASE_ERROR";
}

// Error handling middleware
async function handleAPIError(error: unknown): Promise<APIError> {
    if (error instanceof ClerkAPIError) {
        return {
            success: false,
            error: "Authentication failed",
            code: "UNAUTHORIZED",
        };
    }
    if (error instanceof DrizzleError) {
        return {
            success: false,
            error: "Database operation failed",
            code: "DATABASE_ERROR",
        };
    }
    return { success: false, error: "An unexpected error occurred" };
}
```

## Testing Strategy

### Unit Testing Focus Areas

1. **Database Operations**:

    - CRUD operations with Drizzle ORM
    - Schema validation and constraints
    - User isolation and data security

2. **API Routes**:

    - Authentication middleware functionality
    - Request validation and sanitization
    - Error handling for various failure scenarios

3. **Component Testing**:
    - Mind map list rendering and interactions
    - Save/load functionality
    - Authentication state handling

### Integration Testing

1. **End-to-End User Flows**:

    - Sign in → Create mind map → Save → Load
    - Mind map CRUD operations
    - Authentication-protected routes

2. **Database Integration**:
    - Supabase connection and queries
    - Data persistence and retrieval
    - User data isolation

### Test Data Setup

```typescript
// Test fixtures
const mockUser = {
    id: "user_test123",
    emailAddress: "test@example.com",
};

const mockMindMap: MindMap = {
    id: "map_test123",
    userId: "user_test123",
    name: "Test Mind Map",
    graphData: {
        nodes: [
            /* test nodes */
        ],
        edges: [
            /* test edges */
        ],
        viewport: { x: 0, y: 0, zoom: 1 },
        centralConcept: "Test Concept",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
};
```

## Security Implementation

### Authentication Security

1. **Clerk Integration**:

    - Server-side user verification on all protected routes
    - Secure session management
    - CSRF protection through Clerk's built-in mechanisms

2. **API Route Protection**:
    ```typescript
    // Middleware for protected routes
    export async function authenticateUser(req: NextRequest) {
        const { userId } = auth();
        if (!userId) {
            throw new Error("Unauthorized");
        }
        return userId;
    }
    ```

### Data Security

1. **User Data Isolation**:

    - All queries filtered by authenticated user ID
    - No cross-user data access possible
    - Database-level constraints on user ownership

2. **Input Validation**:

    ```typescript
    // Request validation schemas
    const createMapSchema = z.object({
        name: z.string().min(1).max(100),
        initialConcept: z.string().min(1).max(200),
    });

    const updateMapSchema = z.object({
        name: z.string().min(1).max(100).optional(),
        graphData: z.object({
            nodes: z.array(z.any()),
            edges: z.array(z.any()),
            viewport: z.object({
                x: z.number(),
                y: z.number(),
                zoom: z.number(),
            }),
            centralConcept: z.string(),
        }),
    });
    ```

## Performance Considerations

### Database Optimization

1. **Indexing Strategy**:

    ```sql
    CREATE INDEX idx_mind_maps_user_id ON mind_maps(user_id);
    CREATE INDEX idx_mind_maps_created_at ON mind_maps(created_at DESC);
    ```

2. **Query Optimization**:
    - Limit results for mind map lists
    - Efficient JSONB queries for graph data
    - Connection pooling with Supabase

### Client-Side Performance

1. **State Management**:

    - Efficient React state updates
    - Memoization of expensive calculations
    - Debounced save operations

2. **Data Loading**:
    - Lazy loading of mind map content
    - Optimistic updates for better UX
    - Caching of frequently accessed data

## Styling and UI Design

### Authentication UI

```typescript
// Sign-in prompt component styling
const authPromptStyles = {
    container:
        "flex flex-col items-center justify-center min-h-[60vh] space-y-6",
    heading: "text-3xl font-bold text-center",
    description: "text-lg text-muted-foreground text-center max-w-md",
    signInButton: "bg-primary text-primary-foreground hover:bg-primary/90",
};
```

### Mind Map Management UI

```typescript
// Mind map list styling
const mindMapListStyles = {
    container: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6",
    card: "border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer",
    cardHeader: "flex justify-between items-start mb-2",
    cardTitle: "font-semibold text-lg truncate",
    cardMeta: "text-sm text-muted-foreground",
    deleteButton: "text-destructive hover:text-destructive/80",
};
```

### Save Functionality UI

```typescript
// Save button and status styling
const saveUIStyles = {
    saveButton:
        "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50",
    unsavedIndicator: "text-amber-600 text-sm",
    savedIndicator: "text-green-600 text-sm",
    savingIndicator: "text-blue-600 text-sm",
};
```

## Integration Points

### Clerk Authentication Setup

```typescript
// Environment variables required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### Supabase Database Setup

```typescript
// Environment variables required
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/[database]
SUPABASE_URL=https://[project].supabase.co
SUPABASE_ANON_KEY=eyJ...
```

### Drizzle ORM Configuration

```typescript
// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
    schema: "./src/lib/db/schema.ts",
    out: "./drizzle",
    driver: "pg",
    dbCredentials: {
        connectionString: process.env.DATABASE_URL!,
    },
} satisfies Config;
```

## Migration Strategy

### Database Migration

1. **Schema Creation**:

    ```bash
    pnpm drizzle-kit generate:pg
    pnpm drizzle-kit push:pg
    ```

2. **Data Migration** (if needed):
    - No existing data to migrate for new feature
    - Future migrations will use Drizzle's migration system

### Code Migration

1. **Gradual Integration**:

    - Maintain existing stateless functionality as fallback
    - Progressive enhancement with authentication
    - Feature flags for rollback capability

2. **Backward Compatibility**:
    - Existing mind map generation continues to work
    - New persistence features are additive
    - No breaking changes to existing API routes

## Deployment Considerations

### Environment Setup

```bash
# Additional environment variables for production
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...
```

### Database Deployment

1. **Supabase Setup**:

    - Create new Supabase project
    - Run database migrations
    - Configure connection pooling

2. **Security Configuration**:
    - Row Level Security (RLS) policies
    - API key restrictions
    - CORS configuration

### Monitoring and Analytics

1. **Database Monitoring**:

    - Query performance tracking
    - Connection pool monitoring
    - Storage usage alerts

2. **User Analytics**:
    - Authentication success rates
    - Mind map creation/save patterns
    - Error rate monitoring
