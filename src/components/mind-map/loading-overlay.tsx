import React from "react";
import { Card } from "@/components/ui/card";

export const LoadingOverlay = () => {
  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-lg flex items-center justify-center z-50">
      <Card className="p-8 bg-card/95 border-border/60 shadow-2xl max-w-sm mx-4">
        <div className="flex flex-col items-center space-y-6">
          {/* Animated spinner with multiple rings */}
          <div className="relative">
            {/* Outer ring */}
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            {/* Inner ring - counter rotation */}
            <div className="absolute inset-2 w-12 h-12 border-4 border-accent/30 border-b-accent rounded-full animate-spin" 
                 style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            {/* Center dot */}
            <div className="absolute inset-6 w-4 h-4 bg-primary rounded-full animate-pulse" />
          </div>

          {/* Loading text with typewriter effect */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold font-geist-sans text-foreground">
              Generating Mind Map
            </h3>
            <div className="flex items-center justify-center space-x-1">
              <span className="text-sm text-muted-foreground font-geist-mono">
                AI is exploring connections
              </span>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>

          {/* Progress bar simulation */}
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full animate-pulse" 
                 style={{ 
                   width: '70%',
                   animation: 'progress 2s ease-in-out infinite alternate'
                 }} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export const ErrorOverlay = ({ error }: { error: string }) => {
  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <Card className="p-6 bg-card/95 border-destructive/30 shadow-2xl max-w-md w-full">
        <div className="flex flex-col items-center space-y-4 text-center">
          {/* Error icon with animation */}
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          {/* Error content */}
          <div className="space-y-2">
            <h3 className="font-semibold text-destructive text-lg font-geist-sans">
              Something went wrong
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-geist-sans">
              {error}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};