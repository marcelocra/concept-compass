# Project Structure

## Root Directory Organization

```
├── .devcontainer/          # Development container configuration
├── .kiro/                  # Kiro AI assistant configuration
├── public/                 # Static assets (SVGs, images)
├── src/                    # Source code
└── node_modules/           # Dependencies (managed by pnpm)
```

## Source Code Structure (`src/`)

```
src/
├── app/                  # Next.js App Router pages and layouts
│   ├── layout.tsx        # Root layout with fonts and metadata
│   ├── page.tsx          # Home page component
│   ├── globals.css       # Global styles and Tailwind imports
│   └── favicon.ico       # App favicon
├── components/           # Reusable React components
│   └── ui/               # shadcn/ui component library
└── lib/                  # Utility functions and configurations
    └── utils.ts          # Common utilities (cn function for class merging)
```

## Key Conventions

### File Naming

-   **Pages**: lowercase for App Router pages (`page.tsx`, `layout.tsx`)
-   **ts, js, tsx, jsx, css**: kebab-case (`alert-dialog.tsx`, `utils.ts`, `globals.css`)

### Import Aliases

-   `@/*` maps to `src/*` (configured in `tsconfig.json`)
-   `@/components` for component imports
-   `@/lib/utils` for utility functions
-   `@/components/ui` for UI components

### Component Organization

-   **UI Components**: Located in `src/components/ui/` (shadcn/ui components)
-   **Custom Components**: Place in `src/components/` root
-   **Page Components**: Use App Router structure in `src/app/`

### Styling Patterns

-   Use `cn()` utility from `@/lib/utils` for conditional class merging
-   Tailwind CSS classes with CSS variables for theming
-   Component-specific styles co-located with components

### Configuration Files

-   `components.json`: shadcn/ui configuration
-   `tsconfig.json`: TypeScript paths and compiler options
-   `eslint.config.mjs`: ESLint rules for Next.js and TypeScript
-   `.editorconfig`: Consistent formatting across editors
