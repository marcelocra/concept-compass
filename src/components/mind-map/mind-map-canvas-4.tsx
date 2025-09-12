"use client";
import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
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
  getBezierPath,
  EdgeProps,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import "reactflow/dist/style.css";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Particle system for magical effects
const ParticleField = () => {
  const particlesRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      hue: number;
    }>
  >([]);

  useEffect(() => {
    const particleCount = 40;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      hue: Math.random() * 60 + 200, // Blue to purple range
    }));
    setParticles(newParticles);

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: (p.x + p.vx + 100) % 100,
          y: (p.y + p.vy + 100) % 100,
          opacity: Math.sin(Date.now() * 0.001 + p.id) * 0.3 + 0.4,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={particlesRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: `hsl(${particle.hue}, 70%, 60%)`,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 4}px hsl(${particle.hue}, 70%, 60%)`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
};

// Enhanced Central Node with morphing gradients and quantum effects
const CentralNode = ({ data, selected }: NodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        "relative group cursor-pointer transition-all duration-1000 ease-out",
        "transform-gpu will-change-transform",
        isHovered && "scale-115 rotate-1"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Quantum field effects */}
      <div
        className="absolute -inset-16 opacity-0 group-hover:opacity-100 transition-all duration-1500"
        style={{
          background: `radial-gradient(circle at 50% 50%,
            hsl(${220 + Math.sin(pulsePhase * 0.01) * 20}, 80%, 60%) 0%,
            transparent 70%)`,
          filter: "blur(20px)",
          transform: `scale(${1 + Math.sin(pulsePhase * 0.05) * 0.1})`,
        }}
      />

      {/* Rotating orbital rings */}
      <div
        className="absolute -inset-12 border-2 border-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000"
        style={{
          transform: `rotate(${pulsePhase}deg)`,
          borderStyle: "dashed",
        }}
      />
      <div
        className="absolute -inset-16 border border-accent/20 rounded-full opacity-0 group-hover:opacity-80 transition-all duration-1000"
        style={{
          transform: `rotate(${-pulsePhase * 1.5}deg)`,
          borderImage: "linear-gradient(45deg, transparent, #3b82f6, transparent) 1",
        }}
      />
      <div
        className="absolute -inset-20 border border-purple-500/10 rounded-full opacity-0 group-hover:opacity-60 transition-all duration-1000"
        style={{
          transform: `rotate(${pulsePhase * 0.5}deg) scale(${1 + Math.sin(pulsePhase * 0.02) * 0.05})`,
        }}
      />

      {/* Morphing gradient background */}
      <div
        className="absolute -inset-8 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-1500"
        style={{
          background: `conic-gradient(from ${pulsePhase}deg at 50% 50%,
            #3b82f6 0deg, #8b5cf6 120deg, #ec4899 240deg, #3b82f6 360deg)`,
          filter: "blur(24px)",
          transform: `rotate(${pulsePhase * 0.2}deg)`,
        }}
      />

      {/* Main node container with glass morphism */}
      <div
        className={cn(
          "relative bg-gradient-to-br from-primary via-primary/90 to-primary/80",
          "rounded-3xl border-2 backdrop-blur-xl p-8 shadow-2xl w-64 text-center",
          "before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-tr",
          "before:from-white/20 before:via-white/10 before:to-transparent",
          "before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-700",
          "after:absolute after:inset-0 after:rounded-3xl after:shadow-inner after:shadow-white/30",
          selected && "ring-4 ring-accent/60 ring-offset-8 ring-offset-background shadow-accent/40",
          "border-white/30 hover:border-white/50 transition-all duration-700"
        )}
      >
        {/* Animated light sweep */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden"
          style={{
            background: `linear-gradient(105deg,
              transparent 40%,
              rgba(255, 255, 255, 0.4) 50%,
              transparent 60%)`,
            transform: `translateX(${isHovered ? "200%" : "-200%"})`,
            transition: "transform 1.5s ease-out",
          }}
        />

        {/* Glowing orbs */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm" />

        {/* Content */}
        <div className="relative z-10">
          <div className="text-lg font-bold text-white break-words leading-tight tracking-wide drop-shadow-lg">
            {data.label}
          </div>
          <div className="mt-2 text-xs text-white/70 font-medium">Central Concept</div>
        </div>

        {/* Energy indicator */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-1 bg-white/60 rounded-full"
              style={{
                animation: `pulse 2s ease-in-out ${i * 0.3}s infinite`,
                boxShadow: "0 0 4px rgba(255, 255, 255, 0.6)",
              }}
            />
          ))}
        </div>

        <Handle type="source" position={Position.Top} className="!opacity-0" />
        <Handle type="source" position={Position.Right} className="!opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!opacity-0" />
        <Handle type="source" position={Position.Left} className="!opacity-0" />
      </div>
    </div>
  );
};

// Enhanced Related Node with crystal effects
const RelatedNode = ({ data, selected }: NodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={nodeRef}
      className="group cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover glow effect */}
      <div
        className={cn(
          "absolute -inset-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500",
          "bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20",
          "blur-xl"
        )}
        style={{
          transform: isHovered ? "scale(1.1)" : "scale(0.9)",
        }}
      />

      {/* Main node with glass effect */}
      <div
        className={cn(
          "relative bg-gradient-to-br from-card/95 via-card/90 to-card/85",
          "backdrop-blur-xl border rounded-2xl p-4 w-48 text-center",
          "transition-all duration-500 ease-out",
          "hover:shadow-2xl hover:shadow-primary/20",
          "hover:-translate-y-2 hover:scale-105",
          "border-border/40 hover:border-primary/60",
          selected && "ring-2 ring-primary/60 ring-offset-4 ring-offset-background",
          "before:absolute before:inset-0 before:rounded-2xl",
          "before:bg-gradient-to-br before:from-white/5 before:to-transparent",
          "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500"
        )}
      >
        {/* Crystalline pattern overlay */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(139, 92, 246, 0.1) 10px,
              rgba(139, 92, 246, 0.1) 20px
            )`,
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="text-sm font-semibold text-foreground break-words leading-relaxed">{data.label}</div>
          {isHovered && <div className="mt-2 text-xs text-muted-foreground/80 animate-fade-in">Click to explore</div>}
        </div>

        {/* Corner accent */}
        <div className="absolute top-2 right-2">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              "bg-gradient-to-br from-primary/60 to-accent/60",
              "opacity-0 group-hover:opacity-100 transition-all duration-300",
              "animate-pulse"
            )}
          />
        </div>

        <Handle type="target" position={Position.Top} className="!opacity-0" />
        <Handle type="target" position={Position.Right} className="!opacity-0" />
        <Handle type="target" position={Position.Bottom} className="!opacity-0" />
        <Handle type="target" position={Position.Left} className="!opacity-0" />
      </div>
    </div>
  );
};

// Ultra-smooth animated edge with energy flow
const AnimatedEdge = ({ id, sourceX, sourceY, targetX, targetY, style }: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    curvature: 0.25,
  });

  return (
    <g>
      {/* Background glow */}
      <path
        d={edgePath}
        style={{
          strokeWidth: 12,
          stroke: "url(#edgeGradientGlow)",
          filter: "blur(8px)",
          opacity: 0.3,
        }}
      />

      {/* Main edge */}
      <BaseEdge
        path={edgePath}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: "url(#edgeGradient)",
        }}
      />

      {/* Energy particles flowing along the edge */}
      {[0, 1, 2].map((i) => (
        <circle key={i} r="3" className="opacity-90">
          <animateMotion dur={`${3 + i * 0.5}s`} repeatCount="indefinite" path={edgePath} begin={`${i * 0.8}s`} />
          <animate attributeName="fill" values="#3b82f6;#8b5cf6;#ec4899;#3b82f6" dur="2s" repeatCount="indefinite" />
          <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite" />
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur={`${3 + i * 0.5}s`}
            repeatCount="indefinite"
            begin={`${i * 0.8}s`}
          />
        </circle>
      ))}

      {/* Pulse at connection point */}
      <circle cx={targetX} cy={targetY} r="0" fill="url(#pulseGradient)">
        <animate attributeName="r" values="0;8;0" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
      </circle>

      <defs>
        <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8">
            <animate attributeName="stop-color" values="#3b82f6;#8b5cf6;#3b82f6" dur="3s" repeatCount="indefinite" />
          </stop>
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.7">
            <animate attributeName="stop-color" values="#8b5cf6;#ec4899;#8b5cf6" dur="3s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.6">
            <animate attributeName="stop-color" values="#ec4899;#3b82f6;#ec4899" dur="3s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
        <linearGradient id="edgeGradientGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id="pulseGradient">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
        </radialGradient>
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

// Advanced spiral galaxy layout algorithm
const generateGalaxyLayout = (centralConcept: string, relatedConcepts: string[]) => {
  const centerX = 0;
  const centerY = 0;
  const baseRadius = 240;
  const spiralTightness = 0.1;
  const verticalSpread = 60;

  const centralNode: Node = {
    id: "central",
    type: "central",
    position: { x: centerX - 128, y: centerY - 48 },
    data: { label: centralConcept, concept: centralConcept },
    draggable: false,
  };

  const relatedNodes: Node[] = relatedConcepts.map((relatedConcept, index) => {
    const angle = (index / relatedConcepts.length) * Math.PI * 2;
    const spiralRadius = baseRadius + index * spiralTightness * baseRadius;
    const heightVariation = Math.sin(index * 0.8) * verticalSpread;

    const x = centerX + spiralRadius * Math.cos(angle + index * 0.2);
    const y = centerY + spiralRadius * Math.sin(angle + index * 0.2) + heightVariation;

    return {
      id: `related-${index}`,
      type: "related",
      position: { x: x - 96, y: y - 32 },
      data: { label: relatedConcept, concept: relatedConcept },
      draggable: false,
    };
  });

  const edges: Edge[] = relatedNodes.map((node) => ({
    id: `edge-central-${node.id}`,
    source: "central",
    target: node.id,
    type: "animated",
    animated: false,
  }));

  return { nodes: [centralNode, ...relatedNodes], edges };
};

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

const MindMapContent = ({
  concept: _concept,
  mindMapData,
  onNodeClick,
  isLoading = false,
  error = null,
}: MindMapCanvasProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const reactFlowInstance = useReactFlow();

  const [mindMapCache, setMindMapCache] = useState<Record<string, MindMapData>>({});
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentConcept, setCurrentConcept] = useState<string>("");
  const isNavigatingRef = useRef(false);

  const generateNodesAndEdges = useCallback((data: MindMapData) => {
    return generateGalaxyLayout(data.centralConcept, data.relatedConcepts);
  }, []);

  const navigateToConceptFromCache = useCallback(
    (concept: string) => {
      const cachedData = mindMapCache[concept];
      if (cachedData) {
        isNavigatingRef.current = true;
        setIsTransitioning(true);
        setIsVisible(false);

        setTimeout(() => {
          const { nodes: newNodes, edges: newEdges } = generateNodesAndEdges(cachedData);
          setNodes(newNodes);
          setEdges(newEdges);
          setCurrentConcept(concept);

          setTimeout(() => {
            setIsVisible(true);
            setIsTransitioning(false);
            if (reactFlowInstance) {
              reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
            }
          }, 100);
        }, 300);
      }
    },
    [mindMapCache, generateNodesAndEdges, setNodes, setEdges, reactFlowInstance]
  );

  useEffect(() => {
    if (mindMapData && mindMapData.centralConcept) {
      setMindMapCache((prev) => ({
        ...prev,
        [mindMapData.centralConcept]: mindMapData,
      }));

      // Only add to history if this is a new concept and we're not navigating
      if (currentConcept !== mindMapData.centralConcept && !isNavigatingRef.current) {
        setNavigationHistory((prev) => [...prev, mindMapData.centralConcept]);
        setHistoryIndex((prev) => prev + 1);
      }

      // Reset navigation flag
      isNavigatingRef.current = false;

      setCurrentConcept(mindMapData.centralConcept);
      setIsTransitioning(true);
      setIsVisible(false);

      setTimeout(() => {
        const { nodes: newNodes, edges: newEdges } = generateNodesAndEdges(mindMapData);
        setNodes(newNodes);
        setEdges(newEdges);

        setTimeout(() => {
          setIsVisible(true);
          setIsTransitioning(false);
          if (reactFlowInstance) {
            reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
          }
        }, 100);
      }, 300);
    }
  }, [mindMapData, generateNodesAndEdges, setNodes, setEdges, currentConcept, reactFlowInstance]);

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const concept = navigationHistory[newIndex];
      setHistoryIndex(newIndex);
      navigateToConceptFromCache(concept);
    }
  }, [historyIndex, navigationHistory, navigateToConceptFromCache]);

  const goForward = useCallback(() => {
    if (historyIndex < navigationHistory.length - 1) {
      const newIndex = historyIndex + 1;
      const concept = navigationHistory[newIndex];
      setHistoryIndex(newIndex);
      navigateToConceptFromCache(concept);
    }
  }, [historyIndex, navigationHistory, navigateToConceptFromCache]);

  const onNodeClickHandler = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (node.type === "related" && node.data.concept) {
        onNodeClick(node.data.concept);
      }
    },
    [onNodeClick]
  );

  const NavigationBreadcrumb = () => {
    if (navigationHistory.length <= 1) return null;

    const maxVisible = 5;
    const startIndex = Math.max(0, historyIndex - maxVisible + 1);
    const visibleHistory = navigationHistory.slice(startIndex, historyIndex + 1);

    return (
      <div className="absolute top-4 left-4 z-30 animate-fade-in">
        <Breadcrumb>
          <BreadcrumbList className="bg-card/90 backdrop-blur-2xl rounded-2xl px-4 py-2 shadow-2xl border border-border/30">
            {startIndex > 0 && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    className="hover:text-primary transition-colors cursor-pointer"
                    onClick={() => {
                      setHistoryIndex(0);
                      navigateToConceptFromCache(navigationHistory[0]);
                    }}
                  >
                    {navigationHistory[0].length > 12
                      ? `${navigationHistory[0].substring(0, 12)}...`
                      : navigationHistory[0]}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <span className="text-muted-foreground">...</span>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}

            {visibleHistory.map((concept, idx) => {
              const actualIndex = startIndex + idx;
              const isLast = actualIndex === historyIndex;
              const displayText = concept.length > 20 ? `${concept.substring(0, 20)}...` : concept;

              return (
                <React.Fragment key={`${concept}-${actualIndex}`}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="font-semibold text-primary">{displayText}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        className="hover:text-primary transition-colors cursor-pointer"
                        onClick={() => {
                          setHistoryIndex(actualIndex);
                          navigateToConceptFromCache(concept);
                        }}
                      >
                        {displayText}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    );
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "ArrowLeft") {
        e.preventDefault();
        goBack();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "ArrowRight") {
        e.preventDefault();
        goForward();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [goBack, goForward]);

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
        padding: 0.3,
        includeHiddenNodes: false,
        duration: 1000,
      },
      minZoom: 0.4,
      maxZoom: 2.5,
      defaultViewport: {
        x: 0,
        y: 0,
        zoom: 1.0,
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
    <div className="relative w-full h-full min-h-[600px] sm:min-h-[800px] bg-gradient-to-br from-background via-background/95 to-background/90 border border-border/20 rounded-3xl overflow-hidden shadow-2xl">
      {/* Enhanced animated background layers */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-purple-500/8 to-pink-500/8 animate-gradient-shift" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/12 via-purple-500/6 to-transparent opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-pink-500/12 via-purple-500/6 to-transparent opacity-60" />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-purple-500/4 to-transparent opacity-80 animate-pulse"
          style={{ animationDuration: "8s" }}
        />
      </div>

      {/* Particle field */}
      <ParticleField />

      <NavigationBreadcrumb />

      <div
        className={cn(
          "transition-all duration-1000 ease-out h-full",
          isVisible && !isTransitioning ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        <ReactFlow {...reactFlowProps}>
          <Background
            color="hsl(var(--muted-foreground))"
            gap={64}
            size={1}
            className="opacity-[0.08]"
            variant="dots"
          />
        </ReactFlow>
      </div>

      {/* Navigation controls with glassmorphism */}
      <div className="absolute bottom-8 left-8 z-30">
        <div className="flex items-center space-x-4 bg-card/80 backdrop-blur-2xl border border-border/30 rounded-3xl p-4 shadow-2xl">
          <button
            onClick={goBack}
            disabled={historyIndex <= 0}
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300",
              "bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10",
              "border border-border/40 hover:border-primary/40 shadow-lg hover:shadow-xl",
              "disabled:opacity-30 disabled:cursor-not-allowed",
              "hover:scale-110 active:scale-95",
              "text-foreground font-semibold"
            )}
            title="Go Back (Cmd/Ctrl + ←)"
          >
            ←
          </button>

          <button
            onClick={goForward}
            disabled={historyIndex >= navigationHistory.length - 1}
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300",
              "bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10",
              "border border-border/40 hover:border-primary/40 shadow-lg hover:shadow-xl",
              "disabled:opacity-30 disabled:cursor-not-allowed",
              "hover:scale-110 active:scale-95",
              "text-foreground font-semibold"
            )}
            title="Go Forward (Cmd/Ctrl + →)"
          >
            →
          </button>

          <div className="px-4 py-2 bg-background/30 rounded-xl border border-border/20 text-xs text-muted-foreground font-medium">
            {historyIndex + 1} / {navigationHistory.length}
          </div>
        </div>
      </div>

      {/* ReactFlow Controls positioned separately */}
      <div className="absolute bottom-8 right-8 z-30">
        <Controls
          className="bg-card/80 backdrop-blur-2xl border-border/30 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500"
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />
      </div>

      {/* Loading state with quantum spinner */}
      {(isLoading || isTransitioning) && (
        <div className="absolute inset-0 bg-gradient-to-br from-background/85 via-blue-500/5 to-purple-500/5 backdrop-blur-xl flex items-center justify-center z-20">
          {/* Enhanced loading background */}
          <div className="absolute inset-0 opacity-30">
            <div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"
              style={{ animationDuration: "3s" }}
            />
            <div
              className="absolute inset-0 bg-gradient-to-tl from-pink-500/8 via-transparent to-blue-500/8 animate-pulse"
              style={{ animationDuration: "4s", animationDelay: "1s" }}
            />
          </div>

          <div className="flex flex-col items-center space-y-8 relative z-10">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-500/30 rounded-full animate-spin" />
              <div
                className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"
                style={{ animationDirection: "reverse", animationDuration: "1s" }}
              />
              <div
                className="absolute inset-2 w-16 h-16 border-4 border-transparent border-r-pink-500 rounded-full animate-spin"
                style={{ animationDuration: "1.5s" }}
              />
              <div className="absolute inset-4 w-12 h-12 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-foreground animate-pulse">
                {isTransitioning ? "Navigating dimensions..." : "Generating neural pathways..."}
              </p>
              <p className="text-sm text-muted-foreground">
                {isTransitioning ? "Quantum transition in progress" : "Mapping conceptual connections"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error state with elegant card */}
      {error && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-2xl flex items-center justify-center z-20 p-8">
          <Card className="p-8 bg-gradient-to-br from-card via-card/95 to-destructive/5 border-destructive/20 shadow-2xl max-w-lg mx-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-destructive/5 to-transparent animate-pulse" />

            <div className="relative text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-xl text-foreground">Connection Lost</h3>
                <p className="text-muted-foreground leading-relaxed">{error}</p>
              </div>

              <div className="text-sm text-muted-foreground/80 bg-muted/30 rounded-lg p-3 mb-4">
                💡 Use the retry button at the top to try again, or enter a different concept
              </div>

              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
              >
                Reconnect
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Empty state with invitation */}
      {!mindMapData && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center p-8">
          {/* Enhanced background for empty state */}
          <div className="absolute inset-0 opacity-40">
            <div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/8 via-purple-500/8 to-pink-500/8 animate-pulse"
              style={{ animationDuration: "5s" }}
            />
            <div
              className="absolute inset-0 bg-gradient-to-tl from-pink-500/6 via-transparent to-blue-500/6 animate-pulse"
              style={{ animationDuration: "7s", animationDelay: "2s" }}
            />
          </div>

          <Card className="p-12 bg-gradient-to-br from-card/95 via-card/90 to-blue-500/5 backdrop-blur-2xl border border-border/30 shadow-2xl max-w-lg mx-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent animate-shimmer" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-pink-500/20 via-purple-500/15 to-blue-500/20 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />

            <div className="relative text-center space-y-8">
              <div className="w-28 h-28 mx-auto bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                <svg
                  className="w-14 h-14 text-blue-500 relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>

              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-foreground bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Mind Map Portal
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Enter a concept above to unlock an interactive universe of connected ideas
                </p>
              </div>

              <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground/60">
                {[
                  { label: "Neural", icon: "🧠", color: "blue" },
                  { label: "Dynamic", icon: "⚡", color: "purple" },
                  { label: "Infinite", icon: "∞", color: "pink" },
                ].map((feature) => (
                  <div key={feature.label} className="flex items-center space-x-2">
                    <span className="text-xl">{feature.icon}</span>
                    <span className="font-medium">{feature.label}</span>
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full animate-pulse ml-1",
                        feature.color === "blue" && "bg-blue-500/60",
                        feature.color === "purple" && "bg-purple-500/60",
                        feature.color === "pink" && "bg-pink-500/60"
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      <style jsx global>{`
        @keyframes gradient-shift {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(-5%, -5%) scale(1.1);
          }
          50% {
            transform: translate(5%, -5%) scale(0.95);
          }
          75% {
            transform: translate(0, 5%) scale(1.05);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-200%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }

        .animate-gradient-shift {
          animation: gradient-shift 20s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default function MindMapCanvas(props: MindMapCanvasProps) {
  return (
    <ReactFlowProvider>
      <MindMapContent {...props} />
    </ReactFlowProvider>
  );
}
