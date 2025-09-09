# Technology Stack

## Core Framework
- **Next.js 15.5.2** with App Router architecture
- **React 19.1.0** with TypeScript
- **Turbopack** for fast development and builds

## UI & Styling
- **Tailwind CSS v4** for styling with CSS variables
- **shadcn/ui** component library (New York style)
- **Radix UI** primitives for accessible components
- **Lucide React** for icons
- **Geist** fonts (Sans & Mono)

## Backend & Data
- **Supabase** for database and authentication
- **Drizzle ORM** for type-safe database queries
- **PostgreSQL** as the database
- **Clerk** for authentication (alternative/additional)

## AI & External Services
- **OpenAI GPT models** for concept generation
- **Resend** for email services
- **PostHog** for analytics

## Development Tools
- **ESLint** with Next.js and TypeScript configs
- **pnpm** as package manager
- **EditorConfig** for consistent formatting

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
- Create `.env.local` for environment variables
- Required: `OPENAI_API_KEY`
- Additional keys for Supabase, Clerk, etc.