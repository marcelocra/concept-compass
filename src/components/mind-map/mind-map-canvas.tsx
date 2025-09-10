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
import { cn } from "@/lib/utils";

// Custom node component for central concept
const CentralNode = ({ data, selected }: NodeProps) => {
  return (
    <div
      className={cn(
        "px-4 py-3 rounded-lg border-2 font-semibold text-center min-w-[120px] max-w-[200px]",
        "bg-primary text-primary-foreground border-border",
        "shadow-lg transition-all duration-200",
        selected && "ring-2 ring-ring ring-offset-2"
      )}
    >
      <div className="text-sm font-medium break-words">{data.label}</div>
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
        "px-3 py-2 rounded-md border font-medium text-center min-w-[100px] max-w-[180px]",
        "bg-card text-card-foreground border-border",
        "shadow-md transition-all duration-200 cursor-pointer",
        "hover:bg-accent hover:text-accent-foreground hover:shadow-lg hover:scale-105",
        selected && "ring-2 ring-ring ring-offset-2"
      )}
    >
      <div className="text-sm break-words">{data.label}</div>
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

  // Generate nodes and edges from mind map data
  const generateNodesAndEdges = useCallback((data: MindMapData) => {
    const centerX = 0;
    const centerY = 0;
    const radius = 200;

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

    // Create edges from central to related nodes
    const newEdges: Edge[] = relatedNodes.map((node) => ({
      id: `edge-central-${node.id}`,
      source: "central",
      target: node.id,
      type: "default",
      style: {
        stroke: "hsl(var(--border))",
        strokeWidth: 2,
      },
      animated: false,
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

  // Memoize ReactFlow props for performance
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
        padding: 0.2,
        includeHiddenNodes: false,
      },
      minZoom: 0.5,
      maxZoom: 2,
      defaultViewport: { x: 0, y: 0, zoom: 1 },
      proOptions: { hideAttribution: true },
    }),
    [nodes, edges, onNodesChange, onEdgesChange, onNodeClickHandler]
  );

  return (
    <div className="relative w-full h-full min-h-[600px] bg-background border border-border rounded-lg overflow-hidden">
      <ReactFlow {...reactFlowProps}>
        <Background color="hsl(var(--muted))" gap={20} size={1} />
        <Controls className="bg-card border-border" showZoom={true} showFitView={true} showInteractive={false} />
      </ReactFlow>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" role="status" aria-label="Loading"></div>
            <p className="text-sm text-muted-foreground">Generating mind map...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="max-w-md p-6 bg-card border border-destructive rounded-lg shadow-lg">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="text-destructive">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-destructive">Error</h3>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state when no data */}
      {!mindMapData && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">Enter a concept to generate your mind map</p>
          </div>
        </div>
      )}
    </div>
  );
}
