"use client";
import React, { useCallback, useEffect, useMemo, useState, useRef, memo } from "react";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import "reactflow/dist/style.css";

/* ------------------------------------------------------------------ */
/* 1. PARTICLE FIELD – memorize update interval para evitar jitter    */
/* ------------------------------------------------------------------ */
const ParticleField = memo(() => {
  const [particles, setParticles] = useState<
    {
      id: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      hue: number;
    }[]
  >([]);
  useEffect(() => {
    const COUNT = 40;
    setParticles(
      Array.from({ length: COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.4 + 0.3,
        hue: Math.random() * 60 + 200,
      }))
    );
    const t = setInterval(
      () =>
        setParticles((p) =>
          p.map((pt) => ({
            ...pt,
            x: (pt.x + pt.vx + 100) % 100,
            y: (pt.y + pt.vy + 100) % 100,
            opacity: Math.sin(Date.now() * 0.001 + pt.id) * 0.3 + 0.5,
          }))
        ),
      60
    );
    return () => clearInterval(t);
  }, []);
  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: `hsl(${p.hue} 70% 60%)`,
            opacity: p.opacity,
            filter: `blur(${p.size * 0.8}px)`,
            transform: "translate(-50%,-50%)",
          }}
        />
      ))}
    </>
  );
});
/* ------------------------------------------------------------------ */
/* 2. CUSTOM NODES                                                    */
/* ------------------------------------------------------------------ */
const CentralNode = ({ data, selected }: NodeProps) => {
  const [hover, setHover] = useState(false);
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p + 2) % 360), 60);
    return () => clearInterval(t);
  }, []);
  return (
    <div
      className={cn(
        "relative group cursor-pointer transition-transform duration-700 will-change-transform",
        hover && "scale-110"
      )}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* brilho orbital */}
      <div
        className="absolute -inset-14 rounded-full opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, hsl(${
            220 + Math.sin(phase * 0.02) * 20
          } 80% 60%) 0%, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />
      {/* container */}
      <div
        className={cn(
          "relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-3xl border-2 border-white/30 backdrop-blur-xl p-8 shadow-xl w-60 text-center",
          selected && "ring-4 ring-accent/60 ring-offset-4"
        )}
      >
        <div className="text-lg font-bold text-white break-words drop-shadow-lg">{data.label}</div>
        <div className="mt-1 text-xs text-white/70">Central Concept</div>
        <Handle type="source" position={Position.Top} className="!opacity-0" />
        <Handle type="source" position={Position.Right} className="!opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!opacity-0" />
        <Handle type="source" position={Position.Left} className="!opacity-0" />
      </div>
    </div>
  );
};

const RelatedNode = ({ data, selected }: NodeProps) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="group relative cursor-pointer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={cn(
          "absolute -inset-3 rounded-2xl opacity-0 group-hover:opacity-100 transition pointer-events-none",
          "bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-lg"
        )}
      />
      <div
        className={cn(
          "relative bg-gradient-to-br from-card via-card/90 to-card/80 backdrop-blur-xl border border-border/40 rounded-2xl p-4 w-44 text-center transition",
          hover && "shadow-2xl -translate-y-2 scale-[1.04]",
          selected && "ring-2 ring-primary/60 ring-offset-2"
        )}
      >
        <div className="text-sm font-medium break-words">{data.label}</div>
        {hover && <div className="mt-1 text-xs text-muted-foreground/70">Clique</div>}
        {["Top", "Right", "Bottom", "Left"].map((pos) => (
          <Handle key={pos} type="target" position={Position[pos as keyof typeof Position]} className="!opacity-0" />
        ))}
      </div>
    </div>
  );
};
/* ------------------------------------------------------------------ */
/* 3. EDGE COM ANIMAÇÃO                                               */
/* ------------------------------------------------------------------ */
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
      <path
        d={edgePath}
        style={{
          strokeWidth: 10,
          stroke: "url(#edgeGradientGlow)",
          filter: "blur(8px)",
          opacity: 0.3,
        }}
      />
      <BaseEdge path={edgePath} style={{ ...style, strokeWidth: 2, stroke: "url(#edgeGradient)" }} />
      <circle cx={targetX} cy={targetY} r="0" fill="url(#pulseGradient)">
        <animate attributeName="r" values="0;8;0" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
      </circle>
      <defs>
        <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
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

/* ------------------------------------------------------------------ */
const nodeTypes: NodeTypes = { central: CentralNode, related: RelatedNode };
const edgeTypes: EdgeTypes = { animated: AnimatedEdge };

/* ------------------------------------------------------------------ */
/* 4. LAYOUT GALÁXIA                                                  */
/* ------------------------------------------------------------------ */
const generateGalaxyLayout = (centralConcept: string, related: string[]): { nodes: Node[]; edges: Edge[] } => {
  const centerX = 0,
    centerY = 0,
    base = 220,
    tight = 0.12,
    vSpread = 50;
  const central: Node = {
    id: "central",
    type: "central",
    position: { x: centerX - 120, y: centerY - 40 },
    data: { label: centralConcept, concept: centralConcept },
    draggable: false,
  };
  const nodes: Node[] = related.map((c, i) => {
    const angle = (i / related.length) * Math.PI * 2;
    const r = base + i * tight * base;
    const h = Math.sin(i * 0.8) * vSpread;
    const x = centerX + r * Math.cos(angle + i * 0.18);
    const y = centerY + r * Math.sin(angle + i * 0.18) + h;
    return {
      id: `rel-${i}`,
      type: "related",
      position: { x: x - 80, y: y - 24 },
      data: { label: c, concept: c },
      draggable: false,
    };
  });
  const edges: Edge[] = nodes.map((n) => ({
    id: `e-${n.id}`,
    source: "central",
    target: n.id,
    type: "animated",
  }));
  return { nodes: [central, ...nodes], edges };
};

/* ------------------------------------------------------------------ */
/* 5. MAIN CANVAS                                                     */
/* ------------------------------------------------------------------ */
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

const MindMapContent = ({ mindMapData, onNodeClick, isLoading = false, error = null }: MindMapCanvasProps) => {
  /* estado ReactFlow ------------------------------------------------ */
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const rf = useReactFlow();

  /* histórico ------------------------------------------------------- */
  const [cache, setCache] = useState<Record<string, MindMapData>>({});
  const [history, setHistory] = useState<string[]>([]);
  const [index, setIndex] = useState(-1);
  const [visible, setVisible] = useState(false);

  /* navegação ------------------------------------------------------- */
  const renderMap = useCallback(
    (data: MindMapData) => {
      const { nodes: n, edges: e } = generateGalaxyLayout(data.centralConcept, data.relatedConcepts);
      setNodes(n);
      setEdges(e);
      setTimeout(() => rf.fitView({ padding: 0.2, duration: 800 }), 50);
    },
    [rf, setNodes, setEdges]
  );

  const goTo = useCallback(
    (concept: string) => {
      const dto = cache[concept];
      if (!dto) return;
      setVisible(false);
      setTimeout(() => {
        renderMap(dto);
        setVisible(true);
      }, 250);
    },
    [cache, renderMap]
  );

  const goBack = () => index > 0 && (setIndex(index - 1), goTo(history[index - 1]));
  const goFwd = () => index < history.length - 1 && (setIndex(index + 1), goTo(history[index + 1]));

  /* aplicação de dados vindos da prop ------------------------------- */
  useEffect(() => {
    if (!mindMapData) return;
    setCache((p) => ({ ...p, [mindMapData.centralConcept]: mindMapData }));
    if (history[index] !== mindMapData.centralConcept) {
      const newHist = history.slice(0, index + 1).concat(mindMapData.centralConcept);
      setHistory(newHist);
      setIndex(newHist.length - 1);
    }
    setVisible(false);
    setTimeout(() => {
      renderMap(mindMapData);
      setVisible(true);
    }, 250);
  }, [mindMapData]); // eslint-disable-line

  /* clique de nó ---------------------------------------------------- */
  const onNodeClickHandler = useCallback(
    (_: React.MouseEvent, node: Node) =>
      node.type === "related" && node.data?.concept && onNodeClick(node.data.concept),
    [onNodeClick]
  );

  /* keyboard -------------------------------------------------------- */
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "ArrowLeft") {
        e.preventDefault();
        goBack();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "ArrowRight") {
        e.preventDefault();
        goFwd();
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  /* props ReactFlow ------------------------------------------------- */
  const flowProps = useMemo(
    () => ({
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      onNodeClick: onNodeClickHandler,
      nodeTypes,
      edgeTypes,
      fitView: true,
      fitViewOptions: { padding: 0.3, duration: 1000 },
      minZoom: 0.4,
      maxZoom: 2.5,
      defaultViewport: { x: 0, y: 0, zoom: 1 },
      proOptions: { hideAttribution: true },
      panOnDrag: true,
      zoomOnScroll: true,
      nodesDraggable: false,
      nodesConnectable: false,
      edgesFocusable: false,
    }),
    [nodes, edges, onNodesChange, onEdgesChange, onNodeClickHandler]
  );

  /* breadcrumb ------------------------------------------------------ */
  const BreadcrumbNav = () =>
    history.length > 1 ? (
      <div className="absolute top-4 left-4 z-30">
        <Breadcrumb>
          <BreadcrumbList className="bg-card/90 backdrop-blur-xl rounded-xl px-4 py-2 border border-border/30 shadow-lg">
            {history.map((c, i) => (
              <React.Fragment key={c + i}>
                <BreadcrumbItem>
                  {i === index ? (
                    <BreadcrumbPage className="font-semibold text-primary">
                      {c.length > 18 ? c.slice(0, 18) + "…" : c}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      className="hover:text-primary cursor-pointer"
                      onClick={() => (setIndex(i), goTo(c))}
                    >
                      {c.length > 18 ? c.slice(0, 18) + "…" : c}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {i < history.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    ) : null;

  /* ---------------------------------------------------------------- */
  return (
    <>
      {/* fundo estático + partículas (não “anda” com o zoom) ---------- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ParticleField />
      </div>

      <BreadcrumbNav />

      {/* camada ReactFlow -------------------------------------------- */}
      <div className={cn("h-full transition-opacity duration-300", visible ? "opacity-100" : "opacity-0")}>
        <ReactFlow {...flowProps}>
          <Background size={1} gap={64} className="opacity-10" color="hsl(var(--muted-foreground))" />
        </ReactFlow>
      </div>

      {/* CONTROLES --------------------------------------------------- */}
      <div className="absolute bottom-8 right-8 z-40 flex flex-col items-end space-y-4">
        <div className="flex items-center space-x-4 bg-card/80 backdrop-blur-xl border border-border/30 rounded-3xl p-4 shadow-xl">
          <button
            onClick={goBack}
            disabled={index <= 0}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center font-bold transition",
              "bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10",
              "border border-border/40 hover:border-primary/40",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            title="Voltar (⌘/Ctrl+←)"
          >
            ←
          </button>
          <button
            onClick={goFwd}
            disabled={index >= history.length - 1}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center font-bold transition",
              "bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10",
              "border border-border/40 hover:border-primary/40",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            title="Avançar (⌘/Ctrl+→)"
          >
            →
          </button>
          <span className="text-xs text-muted-foreground">
            {index + 1}/{history.length}
          </span>
        </div>
        {/* Controls do ReactFlow NÃO sobrepõem navegação -------------- */}
        <Controls
          position="bottom-right"
          className="bg-card/80 backdrop-blur-xl border border-border/30 rounded-2xl shadow-lg"
        />
      </div>

      {/* estados de loading / erro ----------------------------------- */}
      {(isLoading || !visible) && (
        <div className="absolute inset-0 bg-background/70 backdrop-blur-md flex items-center justify-center z-50">
          <div className="animate-spin w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-50 p-8">
          <Card className="p-8 border border-destructive/30 shadow-xl bg-destructive/5">
            <h3 className="text-lg font-bold mb-2 text-destructive">Falha ao carregar</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 rounded-md bg-primary text-primary-foreground"
            >
              Tentar novamente
            </button>
          </Card>
        </div>
      )}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* 6. EXPORT DEFAULT                                                  */
/* ------------------------------------------------------------------ */
export default function MindMapCanvas(props: MindMapCanvasProps) {
  return (
    <ReactFlowProvider>
      <MindMapContent {...props} />
    </ReactFlowProvider>
  );
}
