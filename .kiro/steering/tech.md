# Technology Stack

## Core Framework

-   **Next.js 15.5.2** with App Router architecture
-   **React 19.1.0** with TypeScript
-   **Turbopack** for fast development and builds

## UI & Styling

-   **Tailwind CSS v4** for styling with CSS variables
-   **shadcn/ui** component library (New York style)
-   **Radix UI** primitives for accessible components
-   **Lucide React** for icons
-   **Geist** fonts (Sans & Mono)
-   **State management in React** will be handled with React Hooks (useState, useContext) for simplicity. No external state management libraries unless absolutely necessary. When necessary, prefer `zustand`

## Backend & Data

-   **Supabase** for database
-   **Drizzle ORM** for type-safe database queries
-   **PostgreSQL** as the database
-   **Clerk** for authentication, user management and billing support

## AI & External Services

-   **OpenAI GPT models** for concept generation
-   **Resend** for email services
-   **PostHog** for analytics

## Development Tools

-   **ESLint** with Next.js and TypeScript configs
-   **pnpm** as package manager
-   **EditorConfig** for consistent formatting

## Common Commands

```bash
# Development
pnpm dev              # Start dev server with Turbopack
pnpm build            # Build for production with Turbopack
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Package Management
pnpm install          # Install dependencies
pnpm add <package>    # Add new dependency
```

## Environment Setup

-   Create `.env.local` for environment variables
-   Required: `OPENAI_API_KEY`
-   Additional keys for Supabase, Clerk, etc.

## AI Collaboration Workflow

**Critical Instruction:** This project is developed within a containerized environment to which you do not have direct shell access.

Therefore, you **must not** attempt to execute any shell commands (e.g., `pnpm install`, `cp ...`, etc.). Instead, for any task that requires a command, your primary function is to provide the exact, copy-pasteable command as a code block in your response. I am responsible for executing it.

## Good Coding Practice

1. Code comments:
    1. Document your code with comments unless it is absolutely obvious (most code isn't).
    2. Explain what or why something exists, do NOT describe it: if a class is named User, do NOT comment `The user class.`. Document what is particular about it, if there's anything. For example, `Follows the Firebase definition of a user. Details here: ...`.
