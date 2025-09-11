"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  NodeTypes,
  Handle,
  Position,
  NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import { cn } from "@/lib/utils";

// Custom node component for central concept
const CentralNode = ({ data, selected }: NodeProps) => {
  return (
    <div
      className={cn(
        "px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-2 font-semibold text-center",
        "min-w-[120px] sm:min-w-[140px] max-w-[180px] sm:max-w-[220px]",
        "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-primary/20",
        "shadow-xl shadow-primary/20 transition-all duration-300",
        "ring-4 ring-primary/10 ring-offset-2 ring-offset-background",
        selected && "ring-primary/30 scale-105"
      )}
    >
      <div className="text-sm sm:text-base font-semibold break-words leading-tight">{data.label}</div>
      <div className="text-xs opacity-75 mt-1 font-medium hidden sm:block">Central Concept</div>
      <Handle type="source" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <Handle type="source" position={Position.Left} className="opacity-0" />
    </div>
  );
};

// Custom node component for related concepts
const RelatedNode = ({ data, selected }: NodeProps) => {
  return (
    <div
      className={cn(
        "px-3 sm:px-4 py-2 sm:py-3 rounded-lg border font-medium text-center",
        "min-w-[90px] sm:min-w-[110px] max-w-[160px] sm:max-w-[190px]",
        "bg-gradient-to-br from-card to-card/95 text-card-foreground border-border/60",
        "shadow-lg shadow-black/5 transition-all duration-300 cursor-pointer",
        "hover:bg-gradient-to-br hover:from-accent hover:to-accent/95 hover:text-accent-foreground",
        "hover:shadow-xl hover:shadow-primary/10 hover:scale-110 hover:border-primary/30",
        "hover:-translate-y-1 active:scale-105 active:translate-y-0",
        "ring-2 ring-transparent hover:ring-primary/20",
        selected && "ring-primary/40 scale-105 bg-gradient-to-br from-accent to-accent/95"
      )}
    >
      <div className="text-xs sm:text-sm break-words leading-tight">{data.label}</div>
      <div className="text-xs opacity-60 mt-1 font-normal hidden sm:block">Click to explore</div>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="target" position={Position.Right} className="opacity-0" />
      <Handle type="target" position={Position.Bottom} className="opacity-0" />
      <Handle type="target" position={Position.Left} className="opacity-0" />
    </div>
  );
};

// Node types configuration
const nodeTypes: NodeTypes = {
  central: CentralNode,
  related: RelatedNode,
};

export interface MindMapData {
  centralConcept: string;
  relatedConcepts: string[];
}

export interface MindMapCanvasProps {
  concept: string;
  mindMapData?: MindMapData;
  onNodeClick: (concept: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function MindMapCanvas({
  concept,
  mindMapData,
  onNodeClick,
  isLoading = false,
  error = null,
}: MindMapCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Generate nodes and edges from mind map data with responsive positioning
  const generateNodesAndEdges = useCallback((data: MindMapData) => {
    const centerX = 0;
    const centerY = 0;
    // Responsive radius based on screen size
    const radius = window.innerWidth < 640 ? 150 : window.innerWidth < 1024 ? 180 : 220;

    // Create central node
    const centralNode: Node = {
      id: "central",
      type: "central",
      position: { x: centerX, y: centerY },
      data: {
        label: data.centralConcept,
        concept: data.centralConcept,
      },
      draggable: false,
    };

    // Create related nodes in a circle around the center
    const relatedNodes: Node[] = data.relatedConcepts.map((relatedConcept, index) => {
      const angle = (index * 2 * Math.PI) / data.relatedConcepts.length;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      return {
        id: `related-${index}`,
        type: "related",
        position: { x, y },
        data: {
          label: relatedConcept,
          concept: relatedConcept,
        },
        draggable: false,
      };
    });

    // Create edges from central to related nodes with enhanced styling
    const newEdges: Edge[] = relatedNodes.map((node, index) => ({
      id: `edge-central-${node.id}`,
      source: "central",
      target: node.id,
      type: "default",
      style: {
        stroke: "hsl(var(--primary))",
        strokeWidth: 2,
        strokeOpacity: 0.6,
        strokeDasharray: "0",
      },
      animated: false,
      markerEnd: {
        type: "arrowclosed",
        color: "hsl(var(--primary))",
        width: 20,
        height: 20,
      },
    }));

    return {
      nodes: [centralNode, ...relatedNodes],
      edges: newEdges,
    };
  }, []);

  // Update nodes and edges when mind map data changes
  useEffect(() => {
    if (mindMapData) {
      const { nodes: newNodes, edges: newEdges } = generateNodesAndEdges(mindMapData);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [mindMapData, generateNodesAndEdges, setNodes, setEdges]);

  // Handle node clicks
  const onNodeClickHandler = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Only allow clicking on related nodes (not the central node)
      if (node.type === "related" && node.data.concept) {
        onNodeClick(node.data.concept);
      }
    },
    [onNodeClick]
  );

  // Memoize ReactFlow props for performance with responsive settings
  const reactFlowProps = useMemo(
    () => ({
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      onNodeClick: onNodeClickHandler,
      nodeTypes,
      fitView: true,
      fitViewOptions: {
        padding: window.innerWidth < 640 ? 0.1 : 0.2,
        includeHiddenNodes: false,
        minZoom: window.innerWidth < 640 ? 0.3 : 0.5,
        maxZoom: window.innerWidth < 640 ? 1.5 : 2,
      },
      minZoom: window.innerWidth < 640 ? 0.3 : 0.5,
      maxZoom: window.innerWidth < 640 ? 1.5 : 2,
      defaultViewport: { x: 0, y: 0, zoom: window.innerWidth < 640 ? 0.7 : 1 },
      proOptions: { hideAttribution: true },
      panOnDrag: true,
      panOnScroll: false,
      zoomOnScroll: true,
      zoomOnPinch: true,
      zoomOnDoubleClick: false,
    }),
    [nodes, edges, onNodesChange, onEdgesChange, onNodeClickHandler]
  );

  return (
    <div className="relative w-full h-full min-h-[500px] sm:min-h-[600px] bg-gradient-to-br from-background via-background to-muted/10 border border-border/60 rounded-xl overflow-hidden shadow-xl shadow-black/5">
      <ReactFlow {...reactFlowProps}>
        <Background color="hsl(var(--muted))" gap={24} size={1.2} variant="dots" className="opacity-40" />
        <Controls
          className="bg-card/95 backdrop-blur-sm border-border/60 rounded-lg shadow-lg m-4"
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />
      </ReactFlow>

      {/* Loading overlay with enhanced styling */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center z-10">
          <div className="flex flex-col items-center space-y-6 p-8 bg-card/95 rounded-xl border border-border/60 shadow-2xl">
            <div className="relative">
              <div
                className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"
                role="status"
                aria-label="Loading"
              ></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-transparent animate-pulse"></div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-base font-medium text-foreground">Generating mind map...</p>
              <p className="text-sm text-muted-foreground">AI is exploring connections</p>
            </div>
          </div>
        </div>
      )}

      {/* Error overlay with enhanced styling */}
      {error && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center z-10 p-4">
          <div className="max-w-md w-full p-6 bg-card/95 border border-destructive/30 rounded-xl shadow-2xl animate-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-destructive text-lg">Something went wrong</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state when no data with enhanced styling */}
      {!mindMapData && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-muted-foreground">Ready to explore</p>
              <p className="text-sm text-muted-foreground/80 leading-relaxed">
                Enter a concept above to generate your interactive mind map
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
