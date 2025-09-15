"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MindMapCanvas, { MindMapData } from "@/components/mind-map/mind-map-canvas";
import MindMapCanvas2 from "@/components/mind-map/mind-map-canvas-2";
import MindMapCanvas3 from "@/components/mind-map/mind-map-canvas-3";
import MindMapCanvas4 from "@/components/mind-map/mind-map-canvas-4";

// API response interface for type safety
interface GenerateResponse {
  success: boolean;
  concepts?: string[];
  error?: string;
}

// Helper function to get implementation name from environment variable
const getImplementationName = (index: number, defaultName?: string): string => {
  // Direct access to specific env vars (Next.js bundles these at build time)
  const envVars: Record<number, string | undefined> = {
    0: process.env.NEXT_PUBLIC_MINDMAP_IMPL_0,
    1: process.env.NEXT_PUBLIC_MINDMAP_IMPL_1,
    2: process.env.NEXT_PUBLIC_MINDMAP_IMPL_2,
    3: process.env.NEXT_PUBLIC_MINDMAP_IMPL_3,
    // Add more as needed
  };

  console.log(`Implementation ${index}:`, envVars[index]); // Debug log
  return envVars[index] || defaultName || `${index}`;
};

// Mind map implementations registry
const MIND_MAP_IMPLEMENTATIONS = [
  {
    id: "default",
    name: getImplementationName(0, "Classic"),
    description: "Original implementation with particles and breadcrumbs",
    component: MindMapCanvas,
  },
  {
    id: "enhanced",
    name: getImplementationName(1, "Enhanced"),
    description: "Clean modern design with enhanced animations",
    component: MindMapCanvas2,
  },
  {
    id: "cosmic",
    name: getImplementationName(2, "Cosmic"),
    description: "Quantum particle field with advanced physics",
    component: MindMapCanvas3,
  },
  {
    id: "galaxy",
    name: getImplementationName(3, "Galaxy"),
    description: "Advanced spiral galaxy layout with quantum effects",
    component: MindMapCanvas4,
  },
] as const;

export default function Home() {
  // State management for the application
  const [currentConcept, setCurrentConcept] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [mindMapData, setMindMapData] = useState<MindMapData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImplementation, setSelectedImplementation] = useState<string>("default");

  // API call function with proper error handling for OpenRouter responses
  const generateMindMap = useCallback(async (concept: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ concept }),
      });

      const data: GenerateResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (!data.success || !data.concepts) {
        throw new Error(data.error || "Failed to generate concepts");
      }

      // Update state with successful response
      setCurrentConcept(concept);
      setMindMapData({
        centralConcept: concept,
        relatedConcepts: data.concepts,
      });
    } catch (err) {
      console.error("Error generating mind map:", err);

      // User-friendly error messages for different scenarios
      if (err instanceof Error) {
        if (err.message.includes("fetch")) {
          setError("Network error. Please check your connection and try again.");
        } else if (err.message.includes("rate limit")) {
          setError("API rate limit reached. Please wait a moment and try again.");
        } else if (err.message.includes("API")) {
          setError("AI service is temporarily unavailable. Please try again later.");
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const trimmedInput = inputValue.trim();
      if (!trimmedInput) {
        setError("Please enter a concept to explore");
        return;
      }

      generateMindMap(trimmedInput);
    },
    [inputValue, generateMindMap]
  );

  // Handle node click events from the mind map canvas
  const handleNodeClick = useCallback(
    (concept: string) => {
      generateMindMap(concept);
    },
    [generateMindMap]
  );

  // Handle retry functionality for failed API calls
  const handleRetry = useCallback(() => {
    if (currentConcept) {
      generateMindMap(currentConcept);
    } else if (inputValue.trim()) {
      generateMindMap(inputValue.trim());
    }
  }, [currentConcept, inputValue, generateMindMap]);

  // Handle starting over with a new concept
  const handleStartOver = useCallback(() => {
    setCurrentConcept("");
    setInputValue("");
    setMindMapData(undefined);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Conditional rendering: show input form or mind map canvas */}
      {!mindMapData && !isLoading ? (
        // Input form interface with enhanced styling
        <div className="container mx-auto px-4 py-8 sm:py-16 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md shadow-xl border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader className="text-center space-y-3 pb-6">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Concept Compass
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground leading-relaxed">
                Transform any keyword into a dynamic, explorable mind map
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="concept-input" className="text-sm font-medium">
                    Enter a concept to explore
                  </Label>
                  <Input
                    id="concept-input"
                    type="text"
                    placeholder="e.g., Sustainable Urban Farming"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    autoFocus
                  />
                </div>

                {error && (
                  <div
                    data-testid="error-message"
                    className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-4 rounded-lg animate-in slide-in-from-top-2 duration-300"
                  >
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1 h-12 text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Generating...
                      </div>
                    ) : (
                      "Generate Mind Map"
                    )}
                  </Button>
                  {error && (
                    <Button
                      data-testid="retry-button"
                      type="button"
                      variant="outline"
                      className="h-12 px-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      onClick={handleRetry}
                      disabled={isLoading}
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </form>

              <div className="text-center space-y-2 pt-2 border-t border-border/50">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Enter any concept and watch it bloom into a universe of connected ideas.
                </p>
                <p className="text-xs text-muted-foreground/80 font-medium">💡 Click on any node to explore deeper</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Mind map canvas interface with enhanced styling
        <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/10">
          {/* Header with current concept and controls */}
          <div className="border-b bg-card/95 backdrop-blur-sm px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-sm">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-lg sm:text-xl font-semibold">Concept Compass</h1>
              </div>
              {currentConcept && (
                <div className="text-sm text-muted-foreground min-w-0 flex-1">
                  <span className="hidden sm:inline">Exploring: </span>
                  <span className="font-medium text-foreground truncate block sm:inline">{currentConcept}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* <Select value={selectedImplementation} onValueChange={setSelectedImplementation}>
                <SelectTrigger className="w-32 sm:w-40 h-8 text-xs">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {MIND_MAP_IMPLEMENTATIONS.map((impl) => (
                    <SelectItem key={impl.id} value={impl.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{impl.name}</span>
                        <span className="text-xs text-muted-foreground hidden sm:block">{impl.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}
              {error && (
                <Button
                  data-testid="retry-button"
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Retry
                </Button>
              )}
              <Button
                data-testid="start-over-button"
                variant="outline"
                size="sm"
                onClick={handleStartOver}
                className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden sm:inline">Start Over</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>

          {/* Mind map canvas */}
          <div className="flex-1 p-3 sm:p-6">
            {(() => {
              const implementation = MIND_MAP_IMPLEMENTATIONS.find((impl) => impl.id === selectedImplementation);
              const Component = implementation?.component || MindMapCanvas;
              return (
                <Component
                  concept={currentConcept}
                  mindMapData={mindMapData}
                  onNodeClick={handleNodeClick}
                  isLoading={isLoading}
                  error={error}
                />
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
