'use client';

import React, { useState } from 'react';
import MindMapCanvas, { MindMapData } from './mind-map-canvas';

/**
 * Example component demonstrating how to use MindMapCanvas
 * This shows the expected integration pattern for the main page
 */
export default function MindMapExample() {
  const [currentConcept, setCurrentConcept] = useState<string>('');
  const [mindMapData, setMindMapData] = useState<MindMapData | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Example mind map data for demonstration
  const exampleData: MindMapData = {
    centralConcept: 'Sustainable Urban Farming',
    relatedConcepts: [
      'Vertical Farming',
      'Community Gardens',
      'Aquaponics',
      'Rooftop Agriculture',
      'Hydroponic Systems',
      'Permaculture Design',
    ],
  };

  const handleLoadExample = () => {
    setCurrentConcept('Sustainable Urban Farming');
    setMindMapData(exampleData);
    setError(null);
  };

  const handleNodeClick = (concept: string) => {
    console.log('Node clicked:', concept);
    setCurrentConcept(concept);
    
    // In a real implementation, this would call the API
    // For now, we'll simulate loading and show example data
    setIsLoading(true);
    setError(null);
    
    setTimeout(() => {
      // Simulate API response with new data
      const newData: MindMapData = {
        centralConcept: concept,
        relatedConcepts: [
          `${concept} Applications`,
          `${concept} Benefits`,
          `${concept} Challenges`,
          `${concept} Technology`,
          `${concept} Future`,
        ],
      };
      setMindMapData(newData);
      setIsLoading(false);
    }, 1000);
  };

  const handleShowError = () => {
    setError('This is an example error message to demonstrate error handling.');
    setMindMapData(undefined);
  };

  const handleClear = () => {
    setCurrentConcept('');
    setMindMapData(undefined);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Example controls */}
      <div className="p-4 border-b border-border bg-card">
        <h2 className="text-lg font-semibold mb-4">MindMapCanvas Example</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleLoadExample}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
          >
            Load Example
          </button>
          <button
            onClick={handleShowError}
            className="px-3 py-2 bg-destructive text-destructive-foreground rounded-md text-sm hover:bg-destructive/90"
          >
            Show Error
          </button>
          <button
            onClick={() => setIsLoading(!isLoading)}
            className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/90"
          >
            Toggle Loading
          </button>
          <button
            onClick={handleClear}
            className="px-3 py-2 bg-muted text-muted-foreground rounded-md text-sm hover:bg-muted/90"
          >
            Clear
          </button>
        </div>
        {currentConcept && (
          <p className="mt-2 text-sm text-muted-foreground">
            Current concept: <span className="font-medium">{currentConcept}</span>
          </p>
        )}
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
  );
}