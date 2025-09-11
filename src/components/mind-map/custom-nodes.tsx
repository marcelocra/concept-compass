import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Central Node Component - Visually Dominant
export const CentralNode = ({ data, selected }: NodeProps) => {
  return (
    <Card
      className={cn(
        "relative px-6 py-4 min-w-[160px] max-w-[240px] text-center",
        "bg-gradient-to-br from-primary via-primary to-primary/90",
        "text-primary-foreground border-primary/30 border-2",
        "shadow-2xl shadow-primary/30 transition-all duration-500",
        "ring-4 ring-primary/20 ring-offset-4 ring-offset-background",
        "hover:shadow-3xl hover:shadow-primary/40 hover:scale-105",
        selected && "ring-primary/40 scale-110 shadow-primary/50"
      )}
    >
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-lg blur-sm -z-10" />
      
      {/* Main content */}
      <div className="relative z-10">
        <div className="text-lg font-bold font-geist-sans leading-tight mb-2">
          {data.label}
        </div>
        <div className="text-xs font-medium opacity-90 font-geist-mono tracking-wide uppercase">
          Central Concept
        </div>
      </div>

      {/* Pulse animation ring */}
      <div className="absolute inset-0 rounded-lg border-2 border-primary-foreground/20 animate-pulse" />

      {/* Handles for connections */}
      <Handle type="source" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <Handle type="source" position={Position.Left} className="opacity-0" />
    </Card>
  );
};

// Related Node Component - Interactive and Engaging
export const RelatedNode = ({ data, selected }: NodeProps) => {
  return (
    <Card
      className={cn(
        "relative px-4 py-3 min-w-[120px] max-w-[200px] text-center cursor-pointer",
        "bg-gradient-to-br from-card via-card to-card/95",
        "text-card-foreground border-border/60 border",
        "shadow-lg shadow-black/10 transition-all duration-300",
        "hover:bg-gradient-to-br hover:from-accent hover:to-accent/95",
        "hover:text-accent-foreground hover:shadow-xl hover:shadow-primary/20",
        "hover:scale-110 hover:border-primary/40 hover:-translate-y-2",
        "active:scale-105 active:translate-y-0",
        "group relative overflow-hidden",
        selected && "ring-2 ring-primary/40 scale-105 bg-gradient-to-br from-accent to-accent/95"
      )}
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />

      {/* Main content */}
      <div className="relative z-10">
        <div className="text-sm font-semibold font-geist-sans leading-tight mb-1">
          {data.label}
        </div>
        <div className="text-xs text-muted-foreground/80 font-geist-mono opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Click to explore →
        </div>
      </div>

      {/* Interactive indicator */}
      <div className="absolute top-2 right-2 w-2 h-2 bg-primary/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 animate-pulse" />

      {/* Handles for connections */}
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="target" position={Position.Right} className="opacity-0" />
      <Handle type="target" position={Position.Bottom} className="opacity-0" />
      <Handle type="target" position={Position.Left} className="opacity-0" />
    </Card>
  );
};

// Node types configuration for React Flow
export const customNodeTypes = {
  central: CentralNode,
  related: RelatedNode,
};