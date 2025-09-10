# Requirements Document

## Introduction

Concept Compass MVP is a stateless, AI-powered interactive mind mapping application that transforms any keyword into a dynamic, explorable graph. Users enter a concept, generate related ideas using OpenAI, and infinitely explore by clicking nodes to re-center the graph. This MVP excludes user accounts, authentication, database integration, and session persistence - the entire experience is stateless and client-side focused.

## Requirements

### Requirement 1

**User Story:** As a user, I want to enter an initial concept on the main page with a simple interface, so that I can start my brainstorming session immediately without any setup.

#### Acceptance Criteria

1. WHEN the user visits the main page (`src/app/page.tsx`) THEN the system SHALL display a single text input field and submit button prominently on the page, with faded but clear instructions on how to use right below the input field
2. WHEN the user types in the text input THEN the system SHALL accept any text string as a valid concept
3. WHEN the user clicks the submit button or presses Enter THEN the system SHALL initiate the mind map generation process
4. IF the input is empty THEN the system SHALL prevent submission and display a validation message
5. WHEN the mind map is generated THEN the system SHALL hide or minimize the input interface to focus on the mind map

### Requirement 2

**User Story:** As a user, I want to see my concept and related ideas displayed in a dedicated mind map component, so that I can visually explore the connections between concepts using React Flow.

#### Acceptance Criteria

1. WHEN the user submits a concept THEN the system SHALL render the MindMapCanvas component (`src/components/mind-map/mind-map-canvas.tsx`) with React Flow
2. WHEN the mind map is generated THEN the system SHALL display the initial concept as the central node with 5-8 related concepts as connected nodes
3. WHEN nodes are displayed THEN the system SHALL show clear visual connections (edges) between the central node and related nodes
4. WHEN the user interacts with the React Flow canvas THEN the system SHALL support zooming, panning, and node selection
5. WHEN the MindMapCanvas is rendered THEN the system SHALL use React Flow's built-in controls and styling capabilities

### Requirement 3

**User Story:** As a developer, I want a secure backend API route that generates related concepts using OpenAI, so that the frontend can request AI-generated ideas without exposing API keys.

#### Acceptance Criteria

1. WHEN a POST request is made to `/api/generate` THEN the system SHALL implement the route in `src/app/api/generate/route.ts` using Next.js App Router
2. WHEN the API route receives a valid concept THEN the system SHALL securely call the OpenAI API using the OPENAI_API_KEY environment variable
3. WHEN the OpenAI API responds successfully THEN the system SHALL return a JSON response with 5-8 related concepts
4. WHEN the OpenAI API call fails THEN the system SHALL return an appropriate error response with status code 500
5. IF the concept parameter is missing or empty THEN the system SHALL return a 400 error with validation message
6. WHEN making OpenAI requests THEN the system SHALL never expose the API key to the client-side code

### Requirement 4

**User Story:** As a user, I want to click on any node in the mind map to make it the new center, so that I can explore deeper into specific areas of interest in a stateless manner.

#### Acceptance Criteria

1. WHEN the user clicks on any node (except the current center) THEN the MindMapCanvas component SHALL make that node the new central concept
2. WHEN a node becomes the new center THEN the system SHALL call the `/api/generate` route with the new concept
3. WHEN new related concepts are generated THEN the system SHALL update the React Flow graph to show the new center with its related concepts
4. WHEN the mind map updates THEN the system SHALL replace the previous graph state (no history preservation in this stateless MVP)
5. WHEN generating new concepts THEN the system SHALL show a loading indicator within the MindMapCanvas component

### Requirement 5

**User Story:** As a user, I want the mind map to have an intuitive and clean interface using Tailwind CSS and shadcn/ui components, so that I can focus on my ideas without distractions.

#### Acceptance Criteria

1. WHEN the mind map is displayed THEN the system SHALL use Tailwind CSS for styling with a clean, minimalist design
2. WHEN UI components are needed THEN the system SHALL use shadcn/ui components following the New York style configuration
3. WHEN nodes are rendered in React Flow THEN the system SHALL display concept text clearly with appropriate typography using Geist fonts
4. WHEN the user hovers over a clickable node THEN the system SHALL provide visual feedback using Tailwind hover utilities
5. WHEN the application is viewed on different screen sizes THEN the system SHALL use Tailwind's responsive utilities for proper layout

### Requirement 6

**User Story:** As a user, I want the stateless application to handle errors gracefully, so that I can understand what went wrong and continue using the application without losing my current session.

#### Acceptance Criteria

1. WHEN an API call to `/api/generate` fails THEN the system SHALL display a user-friendly error message in the UI
2. WHEN the OpenAI API is unavailable THEN the system SHALL inform the user that the AI service is temporarily unavailable
3. WHEN network connectivity issues occur THEN the system SHALL provide appropriate feedback and allow manual retry
4. WHEN an unexpected error occurs THEN the system SHALL log the error to the console while showing a generic error message to the user
5. IF the user encounters an error THEN the system SHALL allow them to retry the operation or start over with a new concept without requiring page refresh

### Requirement 7

**User Story:** As a developer, I want the application to exclude authentication and database features, so that the MVP remains focused on the core mind-mapping experience without complexity.

#### Acceptance Criteria

1. WHEN implementing the application THEN the system SHALL NOT include Clerk authentication integration
2. WHEN implementing the application THEN the system SHALL NOT include Supabase or Drizzle ORM database integration
3. WHEN implementing the application THEN the system SHALL NOT include any session persistence or user account features
4. WHEN implementing the application THEN the system SHALL operate entirely as a stateless, client-side experience
5. WHEN the user refreshes the page or navigates away THEN the system SHALL lose all current mind map state (expected behavior for this MVP)
