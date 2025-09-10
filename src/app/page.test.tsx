import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Home from "./page";

// Mock the MindMapCanvas component
vi.mock("@/components/mind-map/mind-map-canvas", () => ({
  default: vi.fn(({ concept, onNodeClick, isLoading, error }) => (
    <div data-testid="mind-map-canvas">
      <div data-testid="concept">{concept}</div>
      {isLoading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error">{error}</div>}
      <button
        data-testid="node-click"
        onClick={() => onNodeClick("Related Concept")}
      >
        Click Node
      </button>
    </div>
  )),
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Home Page Integration Tests", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should render the input form initially", () => {
      render(<Home />);
      
      expect(screen.getByText("Concept Compass")).toBeInTheDocument();
      expect(screen.getByLabelText("Enter a concept to explore")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("e.g., Sustainable Urban Farming")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Generate Mind Map" })).toBeInTheDocument();
    });

    it("should show instructions for users", () => {
      render(<Home />);
      
      expect(screen.getByText("Transform any keyword into a dynamic, explorable mind map")).toBeInTheDocument();
      expect(screen.getByText("Enter any concept and watch it bloom into a universe of connected ideas.")).toBeInTheDocument();
      expect(screen.getByText("Click on any node to explore deeper.")).toBeInTheDocument();
    });
  });

  describe("Input Validation", () => {
    it("should prevent submission with empty input", async () => {
      render(<Home />);
      
      const submitButton = screen.getByRole("button", { name: "Generate Mind Map" });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toHaveTextContent("Please enter a concept to explore");
      });
      
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should prevent submission with whitespace-only input", async () => {
      render(<Home />);
      
      const input = screen.getByLabelText("Enter a concept to explore");
      const submitButton = screen.getByRole("button", { name: "Generate Mind Map" });
      
      fireEvent.change(input, { target: { value: "   " } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toHaveTextContent("Please enter a concept to explore");
      });
      
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("API Integration", () => {
    it("should call API with correct parameters on form submission", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          concepts: ["Concept 1", "Concept 2", "Concept 3"],
        }),
      });

      render(<Home />);
      
      const input = screen.getByLabelText("Enter a concept to explore");
      const submitButton = screen.getByRole("button", { name: "Generate Mind Map" });
      
      fireEvent.change(input, { target: { value: "Test Concept" } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ concept: "Test Concept" }),
        });
      });
    });

    it("should show loading state during API call", async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      mockFetch.mockReturnValueOnce(promise);

      render(<Home />);
      
      const input = screen.getByLabelText("Enter a concept to explore");
      const submitButton = screen.getByRole("button", { name: "Generate Mind Map" });
      
      fireEvent.change(input, { target: { value: "Test Concept" } });
      fireEvent.click(submitButton);
      
      // Should show loading state in the mind map canvas
      await waitFor(() => {
        expect(screen.getByTestId("loading")).toBeInTheDocument();
      });
      
      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: async () => ({
          success: true,
          concepts: ["Concept 1", "Concept 2"],
        }),
      });
      
      // Loading should disappear
      await waitFor(() => {
        expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
      });
    });

    it("should render mind map canvas after successful API response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          concepts: ["Related Concept 1", "Related Concept 2"],
        }),
      });

      render(<Home />);
      
      const input = screen.getByLabelText("Enter a concept to explore");
      const submitButton = screen.getByRole("button", { name: "Generate Mind Map" });
      
      fireEvent.change(input, { target: { value: "Test Concept" } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId("mind-map-canvas")).toBeInTheDocument();
        expect(screen.getByTestId("concept")).toHaveTextContent("Test Concept");
      });
      
      // Input form should be hidden
      expect(screen.queryByLabelText("Enter a concept to explore")).not.toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("fetch failed"));

      render(<Home />);
      
      const input = screen.getByLabelText("Enter a concept to explore");
      const submitButton = screen.getByRole("button", { name: "Generate Mind Map" });
      
      fireEvent.change(input, { target: { value: "Test Concept" } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toHaveTextContent("Network error. Please check your connection and try again.");
      });
    });

    it("should handle API errors with proper status codes", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: "Internal server error",
        }),
      });

      render(<Home />);
      
      const input = screen.getByLabelText("Enter a concept to explore");
      const submitButton = screen.getByRole("button", { name: "Generate Mind Map" });
      
      fireEvent.change(input, { target: { value: "Test Concept" } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toHaveTextContent("Internal server error");
      });
    });

    it("should handle rate limit errors specifically", async () => {
      mockFetch.mockRejectedValueOnce(new Error("rate limit exceeded"));

      render(<Home />);
      
      const input = screen.getByLabelText("Enter a concept to explore");
      const submitButton = screen.getByRole("button", { name: "Generate Mind Map" });
      
      fireEvent.change(input, { target: { value: "Test Concept" } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toHaveTextContent("API rate limit reached. Please wait a moment and try again.");
      });
    });
  });

  describe("Mind Map Interaction", () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          concepts: ["Related Concept 1", "Related Concept 2"],
        }),
      });

      render(<Home />);
      
      const input = screen.getByLabelText("Enter a concept to explore");
      const submitButton = screen.getByRole("button", { name: "Generate Mind Map" });
      
      fireEvent.change(input, { target: { value: "Initial Concept" } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId("mind-map-canvas")).toBeInTheDocument();
      });
    });

    it("should handle node clicks and generate new mind map", async () => {
      const nodeClickButton = screen.getByTestId("node-click");
      fireEvent.click(nodeClickButton);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ concept: "Related Concept" }),
        });
      });
    });

    it("should show header with current concept", async () => {
      expect(screen.getByText("Exploring:")).toBeInTheDocument();
      expect(screen.getAllByText("Initial Concept")[0]).toBeInTheDocument();
    });

    it("should provide start over functionality", async () => {
      const startOverButton = screen.getByTestId("start-over-button");
      fireEvent.click(startOverButton);
      
      await waitFor(() => {
        expect(screen.getByLabelText("Enter a concept to explore")).toBeInTheDocument();
        expect(screen.queryByTestId("mind-map-canvas")).not.toBeInTheDocument();
      });
    });
  });

  describe("Error Recovery", () => {
    it("should provide retry functionality when API fails", async () => {
      // First call fails
      mockFetch.mockRejectedValueOnce(new Error("API error"));
      
      render(<Home />);
      
      const input = screen.getByLabelText("Enter a concept to explore");
      const submitButton = screen.getByRole("button", { name: "Generate Mind Map" });
      
      fireEvent.change(input, { target: { value: "Test Concept" } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toHaveTextContent("AI service is temporarily unavailable. Please try again later.");
      });
      
      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          concepts: ["Concept 1", "Concept 2"],
        }),
      });
      
      // Click retry
      const retryButton = screen.getByTestId("retry-button");
      fireEvent.click(retryButton);
      
      await waitFor(() => {
        expect(screen.getByTestId("mind-map-canvas")).toBeInTheDocument();
      });
    });
  });

  describe("Form Submission Methods", () => {
    it("should submit form on Enter key press", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          concepts: ["Concept 1", "Concept 2"],
        }),
      });

      render(<Home />);
      
      const input = screen.getByLabelText("Enter a concept to explore");
      
      fireEvent.change(input, { target: { value: "Test Concept" } });
      fireEvent.submit(input.closest('form')!);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ concept: "Test Concept" }),
        });
      });
    });
  });
});