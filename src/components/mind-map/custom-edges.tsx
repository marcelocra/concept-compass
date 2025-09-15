import React from "react";
import {
  EdgeProps,
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
} from "reactflow";
import { ArrowRight } from "lucide-react";

// Custom Smart Edge with smooth curves and enhanced styling
export const CustomSmartEdge = ({
  id, // eslint-disable-line @typescript-eslint/no-unused-vars
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({ // eslint-disable-line @typescript-eslint/no-unused-vars
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 20,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: "hsl(var(--primary))",
          strokeWidth: 3,
          strokeOpacity: 0.8,
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
          ...style,
        }}
      />
      
      {/* Animated flow indicator */}
      <BaseEdge
        path={edgePath}
        style={{
          stroke: "hsl(var(--primary))",
          strokeWidth: 6,
          strokeOpacity: 0.2,
          strokeDasharray: "10,10",
          animation: "dash 2s linear infinite",
        }}
      />

      {/* Custom arrow marker using Lucide icon */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${targetX}px,${targetY}px)`,
            fontSize: 12,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <div className="bg-primary text-primary-foreground rounded-full p-1 shadow-lg animate-pulse">
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

// Edge types configuration for React Flow
export const customEdgeTypes = {
  smart: CustomSmartEdge,
};