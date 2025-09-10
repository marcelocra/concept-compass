"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MindMapCanvas, { MindMapData } from "@/components/mind-map/mind-map-canvas";

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
    setMindMapData(null);
    setError(null);
  }, []);

  return (
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

                {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Generating..." : "Generate Mind Map"}
                </Button>
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
              {error && (
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  Retry
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleStartOver}>
                Start Over
              </Button>
            </div>
          </div>

          {/* Mind map canvas */}
          <div className="flex-1 p-4">
            <MindMapCanvas
              concept={currentConcept}
              mindMapData={mindMapData}
              onNodeClick={handleNodeClick}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      )}
    </div>
  );
}
