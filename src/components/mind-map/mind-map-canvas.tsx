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
import { Card } from "@/components/ui/card";

// -------------------------
// Custom Nodes (visuais premium)
// -------------------------
const CentralNode = ({ data, selected }: NodeProps) => {
  return (
    <div
      className={[
        "relative w-56 text-center rounded-2xl px-5 py-4",
        "bg-primary text-primary-foreground border-2 border-primary-foreground/40",
        "shadow-[0_10px_30px_-5px_rgba(0,0,0,0.35)]",
        "before:absolute before:inset-0 before:rounded-2xl before:bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.2),transparent_60%)]",
        selected ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : "",
      ].join(" ")}
    >
      <div className="text-sm font-semibold leading-snug break-words font-geist-sans">{data.label}</div>
      <Handle type="source" position={Position.Top} className="!opacity-0" />
      <Handle type="source" position={Position.Right} className="!opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
      <Handle type="source" position={Position.Left} className="!opacity-0" />
      {/* Halo animado */}
      <div className="pointer-events-none absolute -inset-1 rounded-3xl opacity-30 blur-md bg-[conic-gradient(from_90deg,theme(colors.primary.DEFAULT)_0%,transparent_25%,theme(colors.accent.DEFAULT)_50%,transparent_75%,theme(colors.primary.DEFAULT)_100%)] animate-[spin_8s_linear_infinite]" />
    </div>
  );
};

const RelatedNode = ({ data, selected }: NodeProps) => {
  return (
    <div
      className={[
        "relative w-44 text-center rounded-xl px-4 py-3 cursor-pointer",
        "bg-card text-card-foreground border border-border/70",
        "shadow-[0_8px_24px_-8px_rgba(0,0,0,0.3)]",
        "transition-all duration-200",
        "hover:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.35)] hover:scale-[1.045] hover:border-primary/70",
        selected ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : "",
      ].join(" ")}
    >
      <div className="text-xs font-medium leading-snug break-words font-geist-sans">{data.label}</div>
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <Handle type="target" position={Position.Right} className="!opacity-0" />
      <Handle type="target" position={Position.Bottom} className="!opacity-0" />
      <Handle type="target" position={Position.Left} className="!opacity-0" />
      {/* Glow sutil ao hover */}
      <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 hover:opacity-30 transition-opacity duration-200 bg-[radial-gradient(ellipse_at_center,theme(colors.primary.DEFAULT)/30_0%,transparent_70%)]" />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  central: CentralNode,
  related: RelatedNode,
};

// -------------------------
// Tipagens
// -------------------------
export interface MindMapData {
  centralConcept: string;
  relatedConcepts: string[];
}

export interface MindMapCanvasProps {
  concept?: string; // mantido para compatibilidade opcional
  mindMapData?: MindMapData | null;
  onNodeClick: (concept: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

// -------------------------
// Util: layout radial responsivo e edges com “vida”
// -------------------------
function getResponsiveRadius(count: number) {
  // Baseia no número de nós e heurística de viewport sem acessar window diretamente
  // Raio mais largo para mais nós, mas com limites saudáveis
  const base = 200;
  const step = 14;
  const radius = base + Math.min(count, 24) * step;
  return radius;
}

function generateRadial(data: MindMapData) {
  const centerX = 0;
  const centerY = 0;
  const count = data.relatedConcepts.length || 1;
  const radius = getResponsiveRadius(count);

  const centralNode: Node = {
    id: "central",
    type: "central",
    position: { x: centerX, y: centerY },
    data: { label: data.centralConcept, concept: data.centralConcept },
    draggable: false,
    selectable: false,
  };

  const relatedNodes: Node[] = data.relatedConcepts.map((concept, i) => {
    const angle = (i * 2 * Math.PI) / count;
    // leve variação trig para organicidade
    const wobble = Math.sin(i * 1.7) * 10;
    const x = centerX + (radius + wobble) * Math.cos(angle);
    const y = centerY + (radius - wobble) * Math.sin(angle);
    return {
      id: `related-${i}`,
      type: "related",
      position: { x, y },
      data: { label: concept, concept },
      draggable: false,
    };
  });

  // Edges com stroke “duplo” e animação suave
  const edges: Edge[] = relatedNodes.map((n, i) => ({
    id: `e-central-${n.id}`,
    source: "central",
    target: n.id,
    type: "smoothstep",
    animated: true,
    style: {
      stroke: "hsl(var(--border))",
      strokeWidth: 1.75,
    },
    markerEnd: {
      type: "arrowclosed",
      color: "hsl(var(--border))",
      width: 16,
      height: 16,
    } as any,
    // data-driven animation offset (React Flow usa CSS; variedade via index)
    data: { animationOffset: (i % 5) * 0.15 },
  }));

  return { nodes: [centralNode, ...relatedNodes], edges };
}

// -------------------------
// Componente principal
// -------------------------
export default function MindMapCanvas({
  mindMapData,
  onNodeClick,
  isLoading = false,
  error = null,
}: MindMapCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const build = useCallback((data: MindMapData) => generateRadial(data), []);

  useEffect(() => {
    if (mindMapData) {
      const { nodes: n, edges: e } = build(mindMapData);
      setNodes(n);
      setEdges(e);
    }
  }, [mindMapData, build, setNodes, setEdges]);

  const onNodeClickHandler = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (node.type === "related" && node.data?.concept) {
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
      fitView: true,
      fitViewOptions: {
        padding: 0.22,
        includeHiddenNodes: false,
        duration: 800,
      },
      minZoom: 0.45,
      maxZoom: 2.2,
      defaultViewport: { x: 0, y: 0, zoom: 1.1 },
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
    <div className="relative w-full h-full min-h-[560px] sm:min-h-[640px] bg-gradient-to-br from-background via-background/95 to-muted/20 border border-border/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
      {/* Background de impacto com layers suaves */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(ellipse_at_top_left,theme(colors.primary.DEFAULT)/12_0%,transparent_45%)]" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_bottom_right,theme(colors.accent.DEFAULT)/12_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 animate-pulse opacity-20" />
      </div>

      <ReactFlow {...reactFlowProps}>
        <Background color="hsl(var(--muted-foreground))" gap={28} size={1.25} className="opacity-25" />
        <Controls
          className="bg-card/90 backdrop-blur-md border border-border/60 rounded-xl shadow-xl m-4 sm:m-6 transition-all duration-300 hover:bg-card"
          showZoom
          showFitView
          showInteractive={false}
        />
      </ReactFlow>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-10 w-10">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary/30 border-t-primary" />
              <div className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
            </div>
            <p className="text-sm text-muted-foreground font-geist-sans">Generating ideas…</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 bg-background/90 flex items-center justify-center z-10 p-4">
          <div className="max-w-md w-full p-6 bg-card/95 backdrop-blur-sm border border-destructive/50 rounded-xl shadow-xl text-center">
            <h3 className="font-semibold text-destructive">An Error Occurred</h3>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!mindMapData && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <Card className="p-8 bg-card/90 backdrop-blur-sm border-border/50 rounded-2xl shadow-xl max-w-md mx-4">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground font-geist-sans">Ready to explore</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-geist-sans">
                  Enter a concept above to generate your interactive mind map and discover new connections
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/70">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 bg-primary/60 rounded-full" /> AI-powered
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 bg-accent/60 rounded-full" /> Interactive
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 bg-secondary/60 rounded-full" /> Explorable
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* CSS de animação para edges (escopo local) */}
      <style jsx global>{`
        .react-flow__edge-path {
          filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.08));
        }
        .react-flow__edge.animated path {
          stroke-dasharray: 6 6;
          animation: dash 1.8s linear infinite;
          opacity: 0.9;
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -60;
          }
        }
      `}</style>
    </div>
  );
}
