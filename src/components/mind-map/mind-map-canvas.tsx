"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { customNodeTypes } from "./custom-nodes";
import { customEdgeTypes } from "./custom-edges";
import { calculateRadialLayout, calculateEnhancedEdges, getResponsiveRadius } from "./layout-utils";
import { LoadingOverlay, ErrorOverlay } from "./loading-overlay";
import { Card } from "@/components/ui/card";

// Use custom node and edge types
const nodeTypes = customNodeTypes;
const edgeTypes = customEdgeTypes;

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
  concept: _concept,
  mindMapData,
  onNodeClick,
  isLoading = false,
  error = null,
}: MindMapCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Generate nodes and edges with enhanced organic layout
  const generateNodesAndEdges = useCallback((data: MindMapData) => {
    const { nodes, relatedNodes } = calculateRadialLayout(
      data.centralConcept,
      data.relatedConcepts
    );
    
    const edges = calculateEnhancedEdges(relatedNodes);

    return { nodes, edges };
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

  // Memoize ReactFlow props for performance with enhanced settings
  const reactFlowProps = useMemo(
    () => ({
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      onNodeClick: onNodeClickHandler,
      nodeTypes,
      edgeTypes,
      fitView: true,
      fitViewOptions: {
        padding: typeof window !== 'undefined' && window.innerWidth < 640 ? 0.15 : 0.25,
        includeHiddenNodes: false,
        duration: 800,
      },
      minZoom: typeof window !== 'undefined' && window.innerWidth < 640 ? 0.4 : 0.6,
      maxZoom: typeof window !== 'undefined' && window.innerWidth < 640 ? 1.8 : 2.5,
      defaultViewport: { 
        x: 0, 
        y: 0, 
        zoom: typeof window !== 'undefined' && window.innerWidth < 640 ? 0.8 : 1.2 
      },
      proOptions: { hideAttribution: true },
      panOnDrag: true,
      panOnScroll: false,
      zoomOnScroll: true,
      zoomOnPinch: true,
      zoomOnDoubleClick: true,
      selectNodesOnDrag: false,
      elementsSelectable: true,
      nodesDraggable: false,
      nodesConnectable: false,
      edgesFocusable: false,
    }),
    [nodes, edges, onNodesChange, onEdgesChange, onNodeClickHandler]
  );

  return (
    <div className="relative w-full h-full min-h-[500px] sm:min-h-[600px] bg-gradient-to-br from-background via-background/95 to-muted/20 border border-border/40 rounded-2xl overflow-hidden shadow-2xl shadow-black/10">
      {/* Subtle animated background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 animate-pulse" />
      </div>

      <ReactFlow {...reactFlowProps}>
        <Background 
          color="hsl(var(--muted-foreground))" 
          gap={32} 
          size={1.5} 
          className="opacity-20" 
        />
        <Controls
          className="bg-card/90 backdrop-blur-md border-border/50 rounded-xl shadow-xl m-6 transition-all duration-300 hover:bg-card/95"
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />
      </ReactFlow>

      {/* Enhanced loading overlay */}
      {isLoading && <LoadingOverlay />}

      {/* Enhanced error overlay */}
      {error && <ErrorOverlay error={error} />}

      {/* Enhanced empty state */}
      {!mindMapData && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <Card className="p-8 bg-card/90 backdrop-blur-sm border-border/50 shadow-xl max-w-md mx-4">
            <div className="text-center space-y-6">
              {/* Animated icon */}
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground font-geist-sans">
                  Ready to explore
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-geist-sans">
                  Enter a concept above to generate your interactive mind map and discover new connections
                </p>
              </div>

              {/* Feature hints */}
              <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground/60">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-primary/60 rounded-full" />
                  <span>AI-powered</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-accent/60 rounded-full" />
                  <span>Interactive</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-secondary/60 rounded-full" />
                  <span>Explorable</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
