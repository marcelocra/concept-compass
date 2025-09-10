# Implementation Plan

-   [x] 1. Install dependencies and set up project foundation

    -   Install React Flow package using pnpm
    -   Install Vitest and testing dependencies (@testing-library/react, jsdom, @vitest/ui)
    -   Create `.env.example` file with OPENROUTER_API_KEY and OPENROUTER_MODEL variables
    -   Set up environment variable structure for OpenRouter API integration
    -   _Requirements: 3.2, 3.6_

-   [ ] 2. Create secure OpenRouter API route

    -   Implement POST endpoint at `src/app/api/generate/route.ts` using Next.js App Router
    -   Add request validation for concept parameter with proper error responses
    -   Integrate OpenRouter API call using OPENROUTER_API_KEY environment variable
    -   Implement model selection (gpt-oss-20b for dev, gpt-oss-120b for production)
    -   Add proper prompt engineering for concept generation with JSON response format
    -   Implement error handling for OpenRouter API failures and rate limiting
    -   Write unit tests for API route functionality using Vitest
    -   _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

-   [ ] 3. Build mind map canvas component with React Flow

    -   Create `src/components/mind-map/mind-map-canvas.tsx` component structure (kebab-case naming)
    -   Implement React Flow integration with nodes and edges state management
    -   Create custom node types for central and related concepts with Tailwind CSS styling
    -   Add node click handlers to trigger concept re-centering
    -   Implement loading states and error display within the canvas
    -   Write unit tests for mind map canvas component interactions using Vitest and @testing-library/react
    -   _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.5_

-   [ ] 4. Implement main page with input and state management

    -   Modify `src/app/page.tsx` to include concept input form with submit button
    -   Add state management for current concept, loading, and error states
    -   Implement API call to `/api/generate` endpoint with proper error handling for OpenRouter responses
    -   Add conditional rendering to show input form or mind map canvas
    -   Integrate mind map canvas component with node click event handling
    -   Write integration tests for the complete user flow using Vitest
    -   _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.2, 4.3, 4.4_

-   [ ] 5. Style components with Tailwind CSS and shadcn/ui

    -   Apply Tailwind CSS styling to input form with proper responsive design using Geist fonts
    -   Style mind map canvas with clean, minimalist design using CSS variables and zinc color scheme
    -   Implement hover effects and visual feedback for interactive elements using Tailwind utilities
    -   Add loading indicators and error message styling using shadcn/ui New York style components
    -   Ensure responsive layout works across desktop, tablet, and mobile devices with mobile-first approach
    -   _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

-   [ ] 6. Implement comprehensive error handling

    -   Add client-side error handling for network failures and OpenRouter API errors
    -   Implement user-friendly error messages for different failure scenarios (API unavailable, rate limits, etc.)
    -   Add retry functionality for failed API calls with proper debouncing
    -   Implement proper error logging to console for debugging without exposing sensitive information
    -   Add error recovery mechanisms to allow users to start over or retry operations
    -   Write error handling tests using Vitest and MSW for API mocking
    -   _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

-   [ ] 7. Add final integration and testing
    -   Test complete user flow from concept input to mind map generation using OpenRouter API
    -   Verify node clicking triggers new API calls and updates the graph with proper model responses
    -   Test error scenarios and recovery mechanisms with different OpenRouter failure modes
    -   Validate responsive design across different screen sizes using Tailwind breakpoints
    -   Ensure stateless behavior when page is refreshed or navigated away (no persistence)
    -   Run comprehensive test suite with Vitest and validate all components work together
    -   _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
