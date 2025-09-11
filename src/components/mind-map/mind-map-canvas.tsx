"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  EdgeTypes,
  BaseEdge,
  getSmoothStepPath,
  EdgeProps,
} from "reactflow";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import "reactflow/dist/style.css";

// --- Enhanced Custom Nodes with God-Tier Styling ---
const CentralNode = ({ data, selected }: NodeProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative group cursor-pointer transition-all duration-700 ease-out",
        "transform-gpu will-change-transform",
        isHovered && "scale-110"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-1000 animate-pulse" />

      {/* Orbital rings */}
      <div
        className="absolute -inset-8 border border-primary/10 rounded-full animate-spin-slow opacity-0 group-hover:opacity-50 transition-opacity duration-1000"
        style={{ animationDuration: "20s" }}
      />
      <div
        className="absolute -inset-12 border border-accent/10 rounded-full animate-spin-slow opacity-0 group-hover:opacity-30 transition-opacity duration-1000"
        style={{ animationDuration: "30s", animationDirection: "reverse" }}
      />

      {/* Main node */}
      <div
        className={cn(
          "relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground",
          "rounded-2xl border-2 border-white/20 backdrop-blur-sm p-6 shadow-2xl w-56 text-center",
          "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0",
          "hover:before:opacity-100 before:transition-opacity before:duration-500",
          "after:absolute after:inset-0 after:rounded-2xl after:shadow-inner after:shadow-white/20",
          selected && "ring-4 ring-accent/50 ring-offset-4 ring-offset-background shadow-accent/25"
        )}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out" />

        <div className="relative z-10 text-base font-bold break-words leading-tight tracking-wide">{data.label}</div>

        {/* Particle effect dots */}
        <div className="absolute top-2 right-2 w-2 h-2 bg-white/40 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-accent/60 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <Handle type="source" position={Position.Top} className="!opacity-0" />
        <Handle type="source" position={Position.Right} className="!opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!opacity-0" />
        <Handle type="source" position={Position.Left} className="!opacity-0" />
      </div>
    </div>
  );
};

const RelatedNode = ({ data, selected }: NodeProps) => {
  return (
    <div className="group cursor-pointer">
      {/* Simple, modern node with CentralNode hover colors */}
      <div
        className={cn(
          "relative bg-card text-card-foreground border border-border/50",
          "rounded-lg p-4 w-44 text-center shadow-sm",
          "transition-all duration-300 ease-out",
          "hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/40",
          "hover:bg-gradient-to-br hover:from-blue-600/5 hover:via-purple-600/5 hover:to-pink-600/5",
          "hover:-translate-y-1 hover:scale-[1.02]",
          selected && "ring-2 ring-primary/50 ring-offset-2 border-primary/70"
        )}
      >
        {/* Clean text */}
        <div className="text-sm font-medium break-words leading-relaxed transition-colors duration-300 group-hover:text-foreground">
          {data.label}
        </div>

        {/* Gradient accent dot */}
        <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-gradient-to-r from-blue-500/60 to-purple-500/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <Handle type="target" position={Position.Top} className="!opacity-0" />
        <Handle type="target" position={Position.Right} className="!opacity-0" />
        <Handle type="target" position={Position.Bottom} className="!opacity-0" />
        <Handle type="target" position={Position.Left} className="!opacity-0" />
      </div>
    </div>
  );
};
// --- Enhanced Custom Edge - REVERTIDO para conexão simples ---
const AnimatedEdge = ({ id, sourceX, sourceY, targetX, targetY, style }: EdgeProps) => {
  // Usando a forma anterior simples que funcionava
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    borderRadius: 20,
  });

  return (
    <g>
      {/* Background path */}
      <BaseEdge
        path={edgePath}
        style={{
          ...style,
          strokeWidth: 2.5,
          stroke: "url(#edgeGradient)",
          filter: "url(#edgeGlow)",
        }}
      />

      {/* Animated particle along the path */}
      <circle r="4" className="opacity-80">
        <animateMotion dur="4s" repeatCount="indefinite" path={edgePath} />
        <animate attributeName="fill" values="#3b82f6;#8b5cf6;#ec4899;#3b82f6" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* End particle at target */}
      <circle cx={targetX} cy={targetY} r="3" className="opacity-60">
        <animate attributeName="fill" values="#ec4899;#8b5cf6;#3b82f6;#ec4899" dur="3s" repeatCount="indefinite" />
        <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Enhanced definitions */}
      <defs>
        <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.5" />
        </linearGradient>
        <filter id="edgeGlow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </g>
  );
};

const nodeTypes: NodeTypes = {
  central: CentralNode,
  related: RelatedNode,
};

const edgeTypes: EdgeTypes = {
  animated: AnimatedEdge,
};

// --- Enhanced Layout Algorithm ---
const generateAdvancedLayout = (centralConcept: string, relatedConcepts: string[]) => {
  const centerX = 0;
  const centerY = 0;
  const baseRadius = 200;
  const radiusIncrement = Math.min(relatedConcepts.length * 8, 80);
  const finalRadius = baseRadius + radiusIncrement;

  const centralNode: Node = {
    id: "central",
    type: "central",
    position: { x: centerX - 112, y: centerY - 40 },
    data: { label: centralConcept, concept: centralConcept },
    draggable: false,
  };

  const relatedNodes: Node[] = relatedConcepts.map((relatedConcept, index) => {
    // Create organic spiral layout
    const angleOffset = index * 137.508 * (Math.PI / 180); // Golden angle
    const spiralRadius = finalRadius + Math.sin(index * 0.5) * 40;
    const x = centerX + spiralRadius * Math.cos(angleOffset);
    const y = centerY + spiralRadius * Math.sin(angleOffset);

    return {
      id: `related-${index}`,
      type: "related",
      position: { x: x - 88, y: y - 32 },
      data: { label: relatedConcept, concept: relatedConcept },
      draggable: false,
    };
  });

  const edges: Edge[] = relatedNodes.map((node, index) => ({
    id: `edge-central-${node.id}`,
    source: "central",
    target: node.id,
    type: "animated",
    style: {
      strokeWidth: 2.5,
    },
    animated: false, // We handle animation in custom edge
  }));

  return { nodes: [centralNode, ...relatedNodes], edges };
};

// --- Interfaces ---
export interface MindMapData {
  centralConcept: string;
  relatedConcepts: string[];
}

export interface MindMapCanvasProps {
  concept?: string;
  mindMapData?: MindMapData | null;
  onNodeClick: (concept: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

// --- God-Tier Mind Map Component ---
export default function MindMapCanvas({
  concept: _concept,
  mindMapData,
  onNodeClick,
  isLoading = false,
  error = null,
}: MindMapCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]); // ✅ CORREÇÃO AQUI
  const [isVisible, setIsVisible] = useState(false);

  const generateNodesAndEdges = useCallback((data: MindMapData) => {
    return generateAdvancedLayout(data.centralConcept, data.relatedConcepts);
  }, []);

  useEffect(() => {
    if (mindMapData) {
      const { nodes: newNodes, edges: newEdges } = generateNodesAndEdges(mindMapData);
      setNodes(newNodes);
      setEdges(newEdges);

      // Trigger entrance animation
      setTimeout(() => setIsVisible(true), 100);
    }
  }, [mindMapData, generateNodesAndEdges, setNodes, setEdges]);

  const onNodeClickHandler = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (node.type === "related" && node.data.concept) {
        onNodeClick(node.data.concept);
      }
    },
    [onNodeClick]
  );

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
        padding: typeof window !== "undefined" && window.innerWidth < 640 ? 0.1 : 0.2,
        includeHiddenNodes: false,
        duration: 1200,
      },
      minZoom: typeof window !== "undefined" && window.innerWidth < 640 ? 0.3 : 0.5,
      maxZoom: typeof window !== "undefined" && window.innerWidth < 640 ? 1.5 : 2.0,
      defaultViewport: {
        x: 0,
        y: 0,
        zoom: typeof window !== "undefined" && window.innerWidth < 640 ? 0.7 : 1.0,
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
    <div className="relative w-full h-full min-h-[500px] sm:min-h-[700px] bg-gradient-to-br from-background via-background/98 to-muted/10 border border-border/30 rounded-3xl overflow-hidden shadow-2xl shadow-black/20 backdrop-blur-sm">
      {/* Animated background layers */}
      <div className="absolute inset-0 opacity-40">
        <div
          className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent via-accent/3 to-secondary/3 animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-primary/2 to-transparent animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "2s" }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute w-1 h-1 bg-primary/30 rounded-full",
              "animate-float opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
            )}
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 10}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div
        className={cn(
          "transition-all duration-1000 ease-out h-full",
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        <ReactFlow {...reactFlowProps}>
          <Background color="hsl(var(--muted-foreground))" gap={40} size={1} className="opacity-15" />
          <Controls
            className="bg-card/80 backdrop-blur-xl border-border/30 rounded-2xl shadow-2xl m-8 transition-all duration-500 hover:bg-card/90 hover:shadow-xl hover:scale-105"
            showZoom={true}
            showFitView={true}
            showInteractive={false}
          />
        </ReactFlow>
      </div>

      {/* Enhanced loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center z-20">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/30"></div>
              <div
                className="animate-spin rounded-full h-16 w-16 border-4 border-accent border-t-transparent absolute inset-0"
                style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
              ></div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-foreground animate-pulse">Generating Mind Map</p>
              <p className="text-sm text-muted-foreground">Creating connections...</p>
            </div>
          </div>
        </div>
      )}

      {/* Friendly error overlay */}
      {error && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-lg flex items-center justify-center z-20 p-6">
          <Card className="p-8 bg-gradient-to-br from-muted/20 to-muted/10 border-border/40 shadow-2xl max-w-lg mx-4 relative overflow-hidden">
            {/* Subtle animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />

            <div className="relative text-center space-y-6">
              {/* Friendly icon instead of warning */}
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-xl text-foreground">Let's try that again</h3>
                <p className="text-muted-foreground leading-relaxed">{error}</p>
              </div>

              {/* Encouraging message */}
              <div className="text-sm text-muted-foreground/80 bg-muted/30 rounded-lg p-3">
                💡 Try a different concept or rephrase your idea
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Enhanced empty state */}
      {!mindMapData && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <Card className="p-10 bg-gradient-to-br from-card/95 via-card/90 to-accent/5 backdrop-blur-xl border-border/40 shadow-2xl max-w-lg mx-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />

            <div className="relative text-center space-y-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-full flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                <svg
                  className="w-12 h-12 text-primary relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Ready to Explore
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Enter a concept above to generate your interactive mind map and discover amazing connections
                </p>
              </div>

              <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground/80">
                {[
                  { label: "AI-Powered", color: "primary" },
                  { label: "Interactive", color: "accent" },
                  { label: "Beautiful", color: "secondary" },
                ].map((feature, i) => (
                  <div key={feature.label} className="flex items-center space-x-2">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full animate-pulse",
                        feature.color === "primary" && "bg-primary/60",
                        feature.color === "accent" && "bg-accent/60",
                        feature.color === "secondary" && "bg-secondary/60"
                      )}
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                    <span className="font-medium">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(5deg);
          }
          66% {
            transform: translateY(5px) rotate(-3deg);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
