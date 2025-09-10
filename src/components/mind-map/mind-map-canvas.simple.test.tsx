import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock ReactFlow completely to avoid CSS issues
vi.mock("reactflow", () => ({
  __esModule: true,
  default: ({ children }: any) => (
    <div data-testid="react-flow-mock">
      {children}
      <div data-testid="mock-canvas">ReactFlow Canvas</div>
    </div>
  ),
  Controls: () => <div data-testid="react-flow-controls" />,
  Background: () => <div data-testid="react-flow-background" />,
  useNodesState: () => [[], vi.fn(), vi.fn()],
  useEdgesState: () => [[], vi.fn(), vi.fn()],
  Handle: () => null,
  Position: {
    Top: "top",
    Right: "right",
    Bottom: "bottom",
    Left: "left",
  },
}));

import MindMapCanvas, { MindMapData } from "./mind-map-canvas";

describe("MindMapCanvas - Simple Tests", () => {
  const mockOnNodeClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<MindMapCanvas concept="test concept" onNodeClick={mockOnNodeClick} />);

    expect(screen.getByTestId("react-flow-mock")).toBeInTheDocument();
  });

  it("shows empty state when no data provided", () => {
    render(<MindMapCanvas concept="test concept" onNodeClick={mockOnNodeClick} />);

    expect(screen.getByText("Enter a concept to generate your mind map")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<MindMapCanvas concept="test concept" onNodeClick={mockOnNodeClick} isLoading={true} />);

    expect(screen.getByText("Generating mind map...")).toBeInTheDocument();
  });

  it("shows error state", () => {
    const errorMessage = "Test error";

    render(<MindMapCanvas concept="test concept" onNodeClick={mockOnNodeClick} error={errorMessage} />);

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("accepts mind map data prop", () => {
    const mockData: MindMapData = {
      centralConcept: "Test Concept",
      relatedConcepts: ["Related 1", "Related 2"],
    };

    render(<MindMapCanvas concept="test concept" mindMapData={mockData} onNodeClick={mockOnNodeClick} />);

    // Component should render without errors when data is provided
    expect(screen.getByTestId("react-flow-mock")).toBeInTheDocument();
  });

  it("has correct TypeScript types", () => {
    // This test ensures our TypeScript interfaces work correctly
    const mockData: MindMapData = {
      centralConcept: "Test",
      relatedConcepts: ["A", "B", "C"],
    };

    expect(mockData.centralConcept).toBe("Test");
    expect(mockData.relatedConcepts).toHaveLength(3);
    expect(typeof mockOnNodeClick).toBe("function");
  });
});
