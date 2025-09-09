# Concept Compass

**Navigate the universe of ideas. Your AI-powered brainstorming partner for turning a single word into a world of possibilities.**

[Link to Live Demo] · [Link to Video Presentation]

---

## 💡 The Inspiration

Every great project, story, or business starts with a single idea. But the journey from a nascent concept to a fully-fledged plan is often hampered by one of the oldest creative challenges: the blank page. Traditional brainstorming is often linear and limited by our own immediate knowledge. We wanted to create a tool that breaks this linear process, transforming brainstorming into an infinite, interactive exploration.

Concept Compass was born from the need to build a thinking partner that doesn't just give you answers, but helps you ask better questions and discover paths you never thought to explore.

## ✨ What It Does

Concept Compass is an interactive web application that transforms any keyword or idea into a dynamic, explorable mind map. Instead of a static list of suggestions, it provides a visual graph of interconnected concepts, allowing users to navigate and expand their ideas in any direction, infinitely.

**How it works:**

1. **Plant a Seed:** The user starts by entering a single concept (e.g., "Sustainable Urban Farming").
2. **Grow the Universe:** Powered by OpenAI's `gpt-oss` models, Concept Compass generates a rich mind map of related core concepts, such as "Vertical Farming," "Community Gardens," "Aquaponics," and "Target Markets."
3. **Explore Infinitely:** The magic is in the interaction. A user can click on any node (e.g., "Aquaponics") to make it the new center of the universe, generating a fresh set of related sub-concepts. This process can be repeated endlessly, allowing for an unparalleled depth of exploration.

This creates a seamless partnership between human curiosity and the expansive, creative power of AI.

## 🚀 Key Features

- **AI-Powered Mind Mapping:** Leverages advanced generative models to create meaningful and contextually relevant conceptual connections.
- **Infinite Exploration:** A dynamic graph interface that allows users to endlessly expand any node, diving deeper into any topic.
- **Visual & Intuitive UI:** A clean, minimalist canvas designed to keep the focus on the ideas, making brainstorming feel like a creative journey.
- **Save & Resume Sessions:** Users can save their brainstorming graphs to the cloud, allowing them to revisit and continue their thought process at any time.

## 🛠️ How We Built It

Concept Compass is built with a modern, robust, and scalable tech stack designed to provide a seamless user experience.

- **Core AI Engine:** The conceptual generation is powered by **OpenAI's `gpt-oss` models**. We chose these models for their exceptional ability to understand nuance and generate a diverse, high-quality range of interconnected ideas that form the backbone of the application.
- **Frontend:** A responsive and interactive user interface built with **React** and **Next.js**.
- **Visualization:** The dynamic mind map is rendered using **React Flow**, a powerful library for building node-based UIs, allowing for smooth navigation, zooming, and expansion.
- **Backend:** A lightweight **Node.js** server using **Express** handles API requests to the AI model, ensuring security and efficient communication.
- **Styling:** Styled with **Tailwind CSS** for a clean, modern, and mobile-first design.

## 🛣️ What's Next for Concept Compass

We believe this is just the beginning. Our vision is to build Concept Compass into a comprehensive platform for creative thinking. Our roadmap includes:

- **Real-Time Collaboration:** Allowing multiple users to brainstorm on the same canvas simultaneously.
- **Template Library:** Pre-built starting maps for common brainstorming tasks like "Business Model Canvas," "SWOT Analysis," or "Story Plotting."
- **Advanced Export Options:** Exporting graphs to various formats, including high-resolution images, PDF, and Markdown outlines.
- **Workflow Integrations:** Connecting nodes to external applications (like Notion, Trello, or a calendar) to turn ideas into actionable tasks.

## 🏃 Getting Started

To run this project locally, follow these simple steps:

1. **Clone the repository:**
   ```sh
   git clone https://github.com/marcelocra/concept-compass.git
   cd concept-compass
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Set up environment variables:**
   Create a `.env.local` file and add your API keys:
   ```
   OPENAI_API_KEY=your_key_here
   ```
4. **Run the development server:**
   ```sh
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.
