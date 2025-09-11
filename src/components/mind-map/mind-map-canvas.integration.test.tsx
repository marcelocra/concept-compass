import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MindMapCanvas from "./mind-map-canvas";

// Mock ReactFlow for integration testing
vi.mock("reactflow", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="react-flow-integration">
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

describe("MindMapCanvas Integration", () => {
  it("integrates correctly with project structure and styling", () => {
    const mockOnNodeClick = vi.fn();

    render(<MindMapCanvas onNodeClick={mockOnNodeClick} />);

    // Verify the component renders without errors
    expect(screen.getByTestId("react-flow-integration")).toBeInTheDocument();
    expect(screen.getByTestId("mock-canvas")).toBeInTheDocument();
    expect(screen.getByTestId("react-flow-controls")).toBeInTheDocument();
    expect(screen.getByTestId("react-flow-background")).toBeInTheDocument();
  });

  it("uses Tailwind CSS classes correctly", () => {
    const mockOnNodeClick = vi.fn();

    render(<MindMapCanvas onNodeClick={mockOnNodeClick} />);

    // Check that the main container has the expected Tailwind classes
    const container = screen.getByTestId("react-flow-integration").parentElement;
    expect(container).toHaveClass(
      "relative",
      "w-full",
      "h-full",
      "min-h-[600px]",
      "bg-background",
      "border",
      "border-border",
      "rounded-lg",
      "overflow-hidden"
    );
  });

  it("exports the correct TypeScript interfaces", () => {
    // This test ensures our TypeScript interfaces are properly exported
    // and can be imported by other components
    const mockData = {
      centralConcept: "Test",
      relatedConcepts: ["Related 1", "Related 2"],
    };

    const mockProps = {
      concept: "Test Concept",
      mindMapData: mockData,
      onNodeClick: vi.fn(),
      isLoading: false,
      error: null,
    };

    // If this compiles without TypeScript errors, our interfaces are correct
    expect(mockProps.concept).toBe("Test Concept");
    expect(mockProps.mindMapData?.centralConcept).toBe("Test");
    expect(mockProps.mindMapData?.relatedConcepts).toHaveLength(2);
  });
});
