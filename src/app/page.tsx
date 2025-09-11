"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MindMapCanvas, { MindMapData } from "@/components/mind-map/mind-map-canvas";
import ErrorBoundary from "@/components/error-boundary";

// API response interface for type safety
interface GenerateResponse {
  success: boolean;
  concepts?: string[];
  error?: string;
}

export default function Home() {
  // State management for the application
  const [currentConcept, setCurrentConcept] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);

  // Memoized computed values for better performance
  const hasError = useMemo(() => error !== null, [error]);
  const canSubmit = useMemo(() => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    const MIN_REQUEST_INTERVAL = 1000; // 1 second minimum between requests
    return !isLoading && timeSinceLastRequest >= MIN_REQUEST_INTERVAL;
  }, [isLoading, lastRequestTime]);

  // API call function with proper error handling and rate limiting
  const generateMindMap = useCallback(async (concept: string) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    const MIN_REQUEST_INTERVAL = 1000; // 1 second minimum between requests
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      setError("Please wait before making another request");
      return;
    }

    setIsLoading(true);
    setError(null);
    setLastRequestTime(now);

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
  }, [lastRequestTime]);

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const trimmedInput = inputValue.trim();
      if (!trimmedInput) {
        setError("Please enter a concept to explore");
        return;
      }

      if (!canSubmit) {
        setError("Please wait before making another request");
        return;
      }

      generateMindMap(trimmedInput);
    },
    [inputValue, generateMindMap, canSubmit]
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
    setMindMapData(null);
    setError(null);
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Conditional rendering: show input form or mind map canvas */}
        {!mindMapData && !isLoading ? (
        // Input form interface
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Concept Compass</CardTitle>
              <CardDescription>Transform any keyword into a dynamic, explorable mind map</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="concept-input">Enter a concept to explore</Label>
                  <Input
                    id="concept-input"
                    type="text"
                    placeholder="e.g., Sustainable Urban Farming"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full"
                    autoFocus
                  />
                </div>

                {error && (
                  <div
                    data-testid="error-message"
                    className="text-sm text-destructive bg-destructive/10 p-3 rounded-md"
                  >
                    {error}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={!canSubmit}>
                    {isLoading ? "Generating..." : "Generate Mind Map"}
                  </Button>
                  {hasError && (
                    <Button
                      data-testid="retry-button"
                      type="button"
                      variant="outline"
                      onClick={handleRetry}
                      disabled={!canSubmit}
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>Enter any concept and watch it bloom into a universe of connected ideas.</p>
                <p className="mt-1">Click on any node to explore deeper.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Mind map canvas interface
        <div className="h-screen flex flex-col">
          {/* Header with current concept and controls */}
          <div className="border-b bg-card px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold">Concept Compass</h1>
              {currentConcept && (
                <div className="text-sm text-muted-foreground">
                  Exploring: <span className="font-medium text-foreground">{currentConcept}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {hasError && (
                <Button data-testid="retry-button" variant="outline" size="sm" onClick={handleRetry} disabled={!canSubmit}>
                  Retry
                </Button>
              )}
              <Button data-testid="start-over-button" variant="outline" size="sm" onClick={handleStartOver}>
                Start Over
              </Button>
            </div>
          </div>

          {/* Mind map canvas */}
          <div className="flex-1 p-4">
            <MindMapCanvas
              mindMapData={mindMapData}
              onNodeClick={handleNodeClick}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}
