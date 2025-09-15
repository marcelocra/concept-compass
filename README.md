# Concept Compass

**Navigate the universe of ideas. Your AI-powered brainstorming partner for turning a single word into a world of possibilities.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Deployed with Vercel](https://img.shields.io/badge/Deployed_with-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com)

## 🏆 Hackathon Submission Portal

> This project is an evolving entry for two sequential hackathons. I plan to continue developing it long after the competitions are over. To ensure **fair judging**, each submission is preserved in a permanent Git hash and has its own immutable deployment link.

### **🚀 Current Submission: Kiro.dev Hackathon (Sept 12-15)**

This is the active version of the project, featuring user authentication, session persistence, and a development workflow powered by Kiro.dev.

-   **[📦 Code at Submission]()**: TBD
-   **[➡️ Live Demo at Submission]()**: TBD
-   **[📄 View on Devpost]()**: TBD

### **📍 Past Milestone: OpenAI `gpt-oss` Hackathon (Sept 9-11)**

The initial MVP was a stateless, client-side focused application built in a 48-hour sprint to demonstrate the core mind-mapping experience with `gpt-oss` models.

-   **[📦 Code at Submission](https://github.com/marcelocra/concept-compass/tree/edd2fe74ad9df895b391e674a80f35597a45bb44)**
-   **[➡️ Live Demo at Submission](https://concept-compass-i2oqfkahs-marcelo-almeidas-projects.vercel.app)**
-   **[📄 View on Devpost](https://devpost.com/software/concept-compass)**

> [!NOTE]\
> **A Note for Judging**: The Code at Submission link points to the final commit made before the deadline. This version includes several last-minute UI/UX enhancements. These final commits passed all local builds but were prevented from deploying by automated CI checks. Therefore, the Live Demo link reflects the last successful deployment from a few hours prior. For the most complete review of the work accomplished, please refer to the **Code at Submission** link.

## ✨ What It Does

Concept Compass is an interactive web application that transforms any keyword or idea into a dynamic, explorable mind map. Instead of a static list of suggestions, it provides a visual graph of interconnected concepts, allowing you to navigate and expand your ideas in any direction, infinitely.

1.  **Plant a Seed:** Start with a single concept (e.g., "The Future of AI Assistants").
2.  **Grow the Universe:** Powered by OpenAI's `gpt-oss` models, it generates a rich mind map of related ideas.
3.  **Explore Infinitely:** Click any node to make it the new center of the universe, revealing ever-deeper layers of thought in a seamless partnership between human curiosity and AI.

## 🛠️ Tech Stack & Architecture

Concept Compass is built with a modern, high-performance tech stack. The entire development process for new features is orchestrated using a **spec-driven workflow** within the **Kiro.dev IDE**.

| Category           | Technology                                                                             |
| ------------------ | -------------------------------------------------------------------------------------- |
| **Framework**      | [Next.js](https://nextjs.org/) 15 (App Router & Turbopack)                             |
| **UI**             | [React](https://react.dev/) 19, [TypeScript](https://www.typescriptlang.org/)          |
| **Styling**        | [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)          |
| **AI Model**       | [OpenAI `gpt-oss-120b`](https://openai.com/) via [OpenRouter.ai](http://openrouter.ai) |
| **Visualization**  | [React Flow](https://reactflow.dev/)                                                   |
| **Authentication** | [Clerk](https://clerk.com/)                                                            |
| **Database**       | [Supabase](https://supabase.com/) (Postgres), [Drizzle ORM](https://orm.drizzle.team/) |
| **Testing**        | [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/)   |
| **Deployment**     | [Vercel](https://vercel.com/)                                                          |

## 🏃 Getting Started

To run this project locally, follow these simple steps:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/marcelocra/concept-compass.git
    cd concept-compass
    ```

2.  **Install dependencies using pnpm:**

    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project by copying the example file:

    ```bash
    cp .env.example .env.local
    ```

    Now, fill in the required API keys and environment variables in your new `.env.local` file.

4.  **Run the development server:**
    ```bash
    pnpm dev
    ```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 🛣️ What's Next for Concept Compass

This project is more than a hackathon entry; it's the foundation for a comprehensive creative suite. The roadmap includes:

-   **Branching History & Exploration Trees:** Implement a system to go back and forth in the graph of ideas, allowing a user to explore multiple creative paths from a single starting point.
-   **"Deep Dive" Elaboration Engine:** Add a feature to expand the content of any node, generating a detailed summary or explanation of that specific concept.
-   **Actionable Content Generation:** Create a feature where a user can select a path of nodes and have the AI generate practical content from it, such as a blog post outline or a series of social media posts.
