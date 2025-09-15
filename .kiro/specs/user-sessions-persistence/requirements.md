# Requirements Document

## Introduction

This feature adds user authentication and mind map persistence to Concept Compass, transforming it from a stateless application into a personalized experience where users can save, load, and manage their mind maps. The implementation uses Clerk for authentication, Supabase for database storage, and Drizzle ORM for type-safe database operations. Users will be able to sign in, create multiple mind maps, save their progress, and return to their work later.

## Requirements

### Requirement 1

**User Story:** As a user, I want to sign in to Concept Compass using Clerk authentication, so that I can access personalized features and save my mind maps.

#### Acceptance Criteria

1. WHEN the user visits the main page THEN the system SHALL display a Sign-In button prominently if the user is not authenticated
2. WHEN the user clicks the Sign-In button THEN the system SHALL redirect to Clerk's authentication flow
3. WHEN the user successfully signs in THEN the system SHALL redirect back to the main page and display the user's dashboard
4. WHEN the user is signed in THEN the system SHALL display a Sign-Out button in the navigation
5. WHEN the user clicks Sign-Out THEN the system SHALL log them out and return to the unauthenticated state

### Requirement 2

**User Story:** As an unauthenticated user, I want to be prompted to sign in before creating mind maps, so that I understand the need for authentication to access the core functionality.

#### Acceptance Criteria

1. WHEN an unauthenticated user visits the main page THEN the system SHALL hide the mind map creation input field
2. WHEN an unauthenticated user visits the main page THEN the system SHALL display a message prompting them to sign in to begin creating mind maps
3. WHEN an unauthenticated user tries to access mind map functionality THEN the system SHALL redirect them to the sign-in flow
4. WHEN a user signs in THEN the system SHALL immediately show the mind map creation interface and saved maps list
5. IF a user is already signed in THEN the system SHALL bypass the sign-in prompt and show the full interface

### Requirement 3

**User Story:** As a developer, I want to define a proper database schema for mind maps using Drizzle ORM, so that user data is stored efficiently and type-safely in Supabase.

#### Acceptance Criteria

1. WHEN implementing the database schema THEN the system SHALL create a `mind_maps` table with the following columns: `id` (UUID primary key), `userId` (string), `name` (string), `graphData` (JSONB), `createdAt` (timestamp), `updatedAt` (timestamp)
2. WHEN defining the schema THEN the system SHALL use Drizzle ORM syntax in a `src/lib/db/schema.ts` file
3. WHEN storing graph data THEN the system SHALL use JSONB format to store React Flow nodes and edges data
4. WHEN creating the schema THEN the system SHALL include proper indexes on `userId` for efficient querying
5. WHEN implementing the schema THEN the system SHALL ensure the `userId` field matches Clerk's user ID format

### Requirement 4

**User Story:** As a developer, I want secure API routes for mind map CRUD operations, so that users can only access and modify their own mind maps.

#### Acceptance Criteria

1. WHEN implementing API routes THEN the system SHALL create a `/api/maps` endpoint that handles GET, POST requests
2. WHEN implementing API routes THEN the system SHALL create a `/api/maps/[id]` endpoint that handles PUT, DELETE requests
3. WHEN any API route is called THEN the system SHALL verify the user is authenticated using Clerk middleware
4. WHEN fetching mind maps (GET /api/maps) THEN the system SHALL only return mind maps belonging to the authenticated user
5. WHEN creating, updating, or deleting mind maps THEN the system SHALL verify ownership before allowing the operation
6. IF an unauthenticated request is made THEN the system SHALL return a 401 Unauthorized response
7. IF a user tries to access another user's mind map THEN the system SHALL return a 403 Forbidden response

### Requirement 5

**User Story:** As a signed-in user, I want to see a list of my saved mind maps on the main page, so that I can easily access my previous work.

#### Acceptance Criteria

1. WHEN a signed-in user visits the main page THEN the system SHALL display a list of their saved mind maps
2. WHEN displaying saved mind maps THEN the system SHALL show the map name, creation date, and last updated date
3. WHEN the user has no saved mind maps THEN the system SHALL display an empty state message encouraging them to create their first mind map
4. WHEN the user clicks on a saved mind map THEN the system SHALL load that mind map in the canvas
5. WHEN loading a saved mind map THEN the system SHALL restore the exact nodes, edges, and positioning from the saved state

### Requirement 6

**User Story:** As a user, I want to create new mind maps and give them custom names, so that I can organize multiple brainstorming sessions.

#### Acceptance Criteria

1. WHEN a signed-in user wants to create a new mind map THEN the system SHALL provide a "Create New Mind Map" button or interface
2. WHEN creating a new mind map THEN the system SHALL prompt the user to enter a name for the mind map
3. WHEN the user submits a concept for a new mind map THEN the system SHALL automatically create and save the mind map with the generated content
4. WHEN a new mind map is created THEN the system SHALL assign it a unique ID and associate it with the current user
5. WHEN a new mind map is saved THEN the system SHALL add it to the user's mind maps list and make it the currently active map

### Requirement 7

**User Story:** As a user working on a mind map, I want to save my progress at any time, so that I don't lose my work and can continue later.

#### Acceptance Criteria

1. WHEN viewing a mind map THEN the system SHALL display a "Save" button in the interface
2. WHEN the user clicks the Save button THEN the system SHALL call the PUT /api/maps/[id] endpoint to update the mind map
3. WHEN saving a mind map THEN the system SHALL capture the current state of all nodes, edges, and their positions
4. WHEN a save operation completes successfully THEN the system SHALL show a confirmation message to the user
5. WHEN a save operation fails THEN the system SHALL display an error message and allow the user to retry
6. WHEN the user makes changes to a mind map THEN the system SHALL indicate unsaved changes in the UI

### Requirement 8

**User Story:** As a user, I want to delete mind maps I no longer need, so that I can keep my workspace organized.

#### Acceptance Criteria

1. WHEN viewing the mind maps list THEN the system SHALL provide a delete option for each mind map
2. WHEN the user clicks delete THEN the system SHALL show a confirmation dialog to prevent accidental deletion
3. WHEN the user confirms deletion THEN the system SHALL call the DELETE /api/maps/[id] endpoint
4. WHEN a mind map is successfully deleted THEN the system SHALL remove it from the list and show a confirmation message
5. WHEN a delete operation fails THEN the system SHALL display an error message and keep the mind map in the list

### Requirement 9

**User Story:** As a developer, I want proper error handling and loading states for all database operations, so that users have a smooth experience even when things go wrong.

#### Acceptance Criteria

1. WHEN any API call is in progress THEN the system SHALL display appropriate loading indicators
2. WHEN database operations fail THEN the system SHALL display user-friendly error messages without exposing technical details
3. WHEN network connectivity issues occur THEN the system SHALL provide retry mechanisms for failed operations
4. WHEN Supabase is unavailable THEN the system SHALL gracefully handle the outage and inform users
5. WHEN Clerk authentication fails THEN the system SHALL handle the error and guide users to retry authentication

### Requirement 10

**User Story:** As a user, I want the mind map interface to seamlessly integrate with the new persistence features, so that saving and loading feels natural and doesn't disrupt my creative flow.

#### Acceptance Criteria

1. WHEN a mind map is loaded THEN the system SHALL maintain all existing mind map functionality (node clicking, AI generation, etc.)
2. WHEN switching between mind maps THEN the system SHALL preserve the current state before loading the new one
3. WHEN auto-saving is implemented THEN the system SHALL save changes periodically without user intervention
4. WHEN the user creates new nodes by clicking THEN the system SHALL mark the mind map as having unsaved changes
5. WHEN the user navigates away from a mind map with unsaved changes THEN the system SHALL prompt them to save first
