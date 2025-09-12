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

// Quantum Particle Field with Advanced Physics
const QuantumParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<
    Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      life: number;
      color: string;
      connections: number[];
    }>
  >([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize quantum particles
    const particleCount = 60;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 0.5,
      life: Math.random(),
      color: `hsl(${Math.random() * 60 + 220}, 70%, 60%)`,
      connections: [],
    }));

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.02)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, i) => {
        // Quantum uncertainty principle simulation
        particle.x += particle.vx + (Math.random() - 0.5) * 0.2;
        particle.y += particle.vy + (Math.random() - 0.5) * 0.2;
        particle.life = (particle.life + 0.01) % 1;

        // Boundary quantum tunneling
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -0.98;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -0.98;

        // Mouse gravity field
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 200) {
          particle.vx += dx * 0.00001;
          particle.vy += dy * 0.00001;
        }

        // Quantum entanglement connections
        particle.connections = [];
        particlesRef.current.forEach((other, j) => {
          if (i === j) return;
          const dist = Math.hypot(other.x - particle.x, other.y - particle.y);
          if (dist < 120) {
            particle.connections.push(j);

            // Draw quantum connection
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });

        // Render quantum particle with glow
        const opacity = Math.sin(particle.life * Math.PI) * 0.8 + 0.2;
        ctx.shadowBlur = 20;
        ctx.shadowColor = particle.color;
        ctx.fillStyle = `${particle.color.replace("60%", "80%")}${Math.floor(opacity * 255)
          .toString(16)
          .padStart(2, "0")}`;
        ctx.beginPath();
        ctx.arc(
          particle.x,
          particle.y,
          particle.size * (1 + Math.sin(particle.life * Math.PI * 2) * 0.2),
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
      style={{ mixBlendMode: "screen" }}
    />
  );
};

// Divine Central Node with Ethereal Effects
const CentralNode = ({ data, selected }: NodeProps) => {
  const [hover, setHover] = useState(false);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [morphPhase, setMorphPhase] = useState(0);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase((prev) => (prev + 2) % 360);
      setMorphPhase((prev) => prev + 0.02);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const auroraGradient = useMemo(() => {
    const h1 = 220 + Math.sin(morphPhase) * 30;
    const h2 = 280 + Math.cos(morphPhase * 1.3) * 30;
    const h3 = 320 + Math.sin(morphPhase * 0.7) * 30;
    return `conic-gradient(from ${pulsePhase}deg at 50% 50%,
      hsl(${h1}, 80%, 60%) 0deg,
      hsl(${h2}, 70%, 55%) 120deg,
      hsl(${h3}, 75%, 60%) 240deg,
      hsl(${h1}, 80%, 60%) 360deg)`;
  }, [pulsePhase, morphPhase]);

  return (
    <div
      ref={nodeRef}
      className="relative group cursor-pointer select-none"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        transform: hover ? "scale(1.05) translateZ(50px)" : "scale(1) translateZ(0)",
        transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {/* Ethereal Aurora Field */}
      <div
        className="absolute -inset-24 opacity-0 group-hover:opacity-100 transition-all duration-2000 pointer-events-none"
        style={{
          background: auroraGradient,
          filter: "blur(40px)",
          transform: `rotate(${pulsePhase * 0.5}deg) scale(${1 + Math.sin(morphPhase) * 0.15})`,
          animation: "breathe 4s ease-in-out infinite",
        }}
      />

      {/* Sacred Geometry Rings */}
      {[0, 1, 2, 3].map((ring) => (
        <div
          key={ring}
          className="absolute rounded-full border opacity-0 group-hover:opacity-100 pointer-events-none"
          style={{
            inset: `${-16 - ring * 12}px`,
            borderColor: `hsl(${260 + ring * 20}, 70%, ${60 - ring * 10}%)`,
            borderWidth: "1px",
            borderStyle: ring % 2 === 0 ? "solid" : "dashed",
            transform: `rotate(${pulsePhase * (ring % 2 === 0 ? 1 : -1) * (0.5 + ring * 0.2)}deg)`,
            transition: "all 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
            transitionDelay: `${ring * 100}ms`,
            boxShadow: `0 0 ${20 + ring * 10}px hsl(${260 + ring * 20}, 70%, ${60 - ring * 10}%)`,
          }}
        />
      ))}

      {/* Levitating Energy Orbs */}
      {hover &&
        [0, 60, 120, 180, 240, 300].map((angle, i) => (
          <div
            key={angle}
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: `radial-gradient(circle, hsl(${220 + i * 20}, 100%, 70%), transparent)`,
              boxShadow: `0 0 15px hsl(${220 + i * 20}, 100%, 70%)`,
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) rotate(${pulsePhase + angle}deg) translateX(80px)`,
              opacity: Math.sin(morphPhase + i) * 0.5 + 0.5,
              animation: `float-orbit 3s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}

      {/* Main Divine Container */}
      <div
        className={cn(
          "relative w-72 h-36 rounded-3xl overflow-hidden",
          "bg-gradient-to-br from-primary via-primary/90 to-primary/80",
          "backdrop-blur-3xl border-2 border-white/30",
          "shadow-[0_20px_70px_-15px_rgba(139,92,246,0.5)]",
          "before:absolute before:inset-0 before:bg-gradient-to-tr",
          "before:from-white/30 before:via-white/10 before:to-transparent",
          "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-1000",
          "after:absolute after:inset-0 after:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]",
          "after:opacity-50",
          selected && "ring-4 ring-accent/60 ring-offset-8 ring-offset-background"
        )}
      >
        {/* Holographic Shimmer */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
          style={{
            background: `linear-gradient(105deg,
              transparent 40%,
              rgba(255, 255, 255, 0.7) 45%,
              rgba(255, 255, 255, 0.9) 50%,
              rgba(255, 255, 255, 0.7) 55%,
              transparent 60%)`,
            transform: hover ? "translateX(200%)" : "translateX(-200%)",
            transition: "transform 1.2s cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        />

        {/* Divine Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-6">
          <div className="text-2xl font-bold text-white drop-shadow-2xl tracking-wide text-center leading-tight">
            {data.label}
          </div>
          <div className="mt-3 text-xs text-white/80 font-medium uppercase tracking-widest">Core Nexus</div>

          {/* Quantum Status Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white/80"
                style={{
                  animation: `quantum-pulse 2s ease-in-out ${i * 0.2}s infinite`,
                  boxShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Energy Vortex Corners */}
        <div className="absolute top-0 left-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-all duration-700">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-br-2xl" />
        </div>
        <div className="absolute bottom-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-all duration-700">
          <div className="absolute inset-0 bg-gradient-to-tl from-white/40 to-transparent rounded-tl-2xl" />
        </div>

        <Handle type="source" position={Position.Top} className="!opacity-0 !pointer-events-none" />
        <Handle type="source" position={Position.Right} className="!opacity-0 !pointer-events-none" />
        <Handle type="source" position={Position.Bottom} className="!opacity-0 !pointer-events-none" />
        <Handle type="source" position={Position.Left} className="!opacity-0 !pointer-events-none" />
      </div>
    </div>
  );
};

// Crystalline Related Node with Prismatic Effects
const RelatedNode = ({ data, selected }: NodeProps) => {
  const [hover, setHover] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hover) return;

    const interval = setInterval(() => {
      setSparkles((prev) => [
        ...prev.slice(-8),
        {
          x: Math.random() * 100,
          y: Math.random() * 100,
          id: Date.now(),
        },
      ]);
    }, 200);

    return () => clearInterval(interval);
  }, [hover]);

  return (
    <div
      ref={nodeRef}
      className="relative group cursor-pointer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        transform: hover ? "translateY(-8px) scale(1.08) rotateX(5deg)" : "translateY(0) scale(1) rotateX(0)",
        transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Prismatic Aura */}
      <div
        className={cn(
          "absolute -inset-6 rounded-3xl opacity-0 group-hover:opacity-100",
          "transition-all duration-700 pointer-events-none"
        )}
        style={{
          background: `linear-gradient(135deg,
            rgba(59, 130, 246, 0.2) 0%,
            rgba(139, 92, 246, 0.2) 25%,
            rgba(236, 72, 153, 0.2) 50%,
            rgba(251, 146, 60, 0.2) 75%,
            rgba(59, 130, 246, 0.2) 100%)`,
          filter: "blur(20px)",
          animation: hover ? "prism-shift 3s ease-in-out infinite" : "none",
        }}
      />

      {/* Crystalline Container */}
      <div
        className={cn(
          "relative w-52 h-24 rounded-2xl overflow-hidden",
          "bg-gradient-to-br from-card/95 via-card/90 to-card/85",
          "backdrop-blur-2xl border border-border/30",
          "shadow-lg hover:shadow-2xl transition-all duration-500",
          "before:absolute before:inset-0 before:rounded-2xl",
          "before:bg-gradient-to-br before:from-white/10 before:via-transparent before:to-transparent",
          "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-700",
          selected && "ring-2 ring-primary/50 ring-offset-4 ring-offset-background"
        )}
      >
        {/* Diamond Lattice Pattern */}
        <div
          className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500"
          style={{
            backgroundImage: `repeating-linear-gradient(
              60deg,
              transparent,
              transparent 10px,
              rgba(139, 92, 246, 0.1) 10px,
              rgba(139, 92, 246, 0.1) 11px
            ), repeating-linear-gradient(
              -60deg,
              transparent,
              transparent 10px,
              rgba(59, 130, 246, 0.1) 10px,
              rgba(59, 130, 246, 0.1) 11px
            )`,
          }}
        />

        {/* Floating Sparkles */}
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="absolute w-1 h-1 bg-white rounded-full pointer-events-none"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              animation: "sparkle-rise 2s ease-out forwards",
              boxShadow: "0 0 6px rgba(255, 255, 255, 0.8)",
            }}
          />
        ))}

        {/* Holographic Sweep */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100"
          style={{
            background: `linear-gradient(90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.2) 45%,
              rgba(255, 255, 255, 0.4) 50%,
              rgba(255, 255, 255, 0.2) 55%,
              transparent 100%)`,
            transform: hover ? "translateX(100%)" : "translateX(-100%)",
            transition: "transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
          <div className="text-sm font-semibold text-foreground text-center leading-relaxed">{data.label}</div>

          {/* Quantum State Indicator */}
          <div className="absolute top-2 right-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                "bg-gradient-to-br from-primary to-accent",
                "opacity-0 group-hover:opacity-100 transition-all duration-500",
                hover && "animate-pulse"
              )}
              style={{
                boxShadow: "0 0 10px rgba(139, 92, 246, 0.6)",
              }}
            />
          </div>

          {/* Energy Level Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <Handle type="target" position={Position.Top} className="!opacity-0 !pointer-events-none" />
        <Handle type="target" position={Position.Right} className="!opacity-0 !pointer-events-none" />
        <Handle type="target" position={Position.Bottom} className="!opacity-0 !pointer-events-none" />
        <Handle type="target" position={Position.Left} className="!opacity-0 !pointer-events-none" />
      </div>
    </div>
  );
};

// Plasma Flow Edge with Quantum Entanglement
const PlasmaEdge = ({ id, sourceX, sourceY, targetX, targetY, style }: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    curvature: 0.3,
  });

  return (
    <g>
      {/* Plasma Field */}
      <path
        d={edgePath}
        className="stroke-primary/20"
        strokeWidth="16"
        fill="none"
        style={{
          filter: "blur(12px)",
          animation: "plasma-flow 4s ease-in-out infinite",
        }}
      />

      {/* Energy Core */}
      <path
        d={edgePath}
        className="stroke-primary/40"
        strokeWidth="8"
        fill="none"
        style={{
          filter: "blur(4px)",
          strokeDasharray: "20 10",
          animation: "dash-flow 2s linear infinite",
        }}
      />

      {/* Main Quantum Stream */}
      <BaseEdge
        path={edgePath}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: "url(#plasma-gradient)",
          strokeDasharray: "0 8",
          animation: "quantum-dash 3s linear infinite",
        }}
      />

      {/* Quantum Particles */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <circle r="0" fill="url(#particle-gradient)">
            <animateMotion dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" path={edgePath} begin={`${i * 0.4}s`} />
            <animate
              attributeName="r"
              values="0;3;5;3;0"
              dur={`${2.5 + i * 0.3}s`}
              repeatCount="indefinite"
              begin={`${i * 0.4}s`}
            />
            <animate
              attributeName="opacity"
              values="0;1;1;1;0"
              dur={`${2.5 + i * 0.3}s`}
              repeatCount="indefinite"
              begin={`${i * 0.4}s`}
            />
          </circle>

          {/* Particle Trail */}
          <circle r="0" fill="rgba(139, 92, 246, 0.3)">
            <animateMotion
              dur={`${2.5 + i * 0.3}s`}
              repeatCount="indefinite"
              path={edgePath}
              begin={`${i * 0.4 + 0.1}s`}
            />
            <animate
              attributeName="r"
              values="0;8;12;8;0"
              dur={`${2.5 + i * 0.3}s`}
              repeatCount="indefinite"
              begin={`${i * 0.4 + 0.1}s`}
            />
            <animate
              attributeName="opacity"
              values="0;0.3;0.1;0;0"
              dur={`${2.5 + i * 0.3}s`}
              repeatCount="indefinite"
              begin={`${i * 0.4 + 0.1}s`}
            />
          </circle>
        </g>
      ))}

      {/* Quantum Entanglement Pulse */}
      <circle cx={targetX} cy={targetY} r="0" fill="none" stroke="url(#pulse-gradient)" strokeWidth="2">
        <animate attributeName="r" values="0;15;0" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.6;0" dur="3s" repeatCount="indefinite" />
      </circle>

      <defs>
        <linearGradient id="plasma-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6">
            <animate
              attributeName="stop-color"
              values="#3b82f6;#8b5cf6;#ec4899;#3b82f6"
              dur="4s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="50%" stopColor="#8b5cf6">
            <animate
              attributeName="stop-color"
              values="#8b5cf6;#ec4899;#f59e0b;#8b5cf6"
              dur="4s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="#ec4899">
            <animate
              attributeName="stop-color"
              values="#ec4899;#f59e0b;#3b82f6;#ec4899"
              dur="4s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>

        <radialGradient id="particle-gradient">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="30%" stopColor="#8b5cf6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="pulse-gradient">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#ec4899" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
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
  animated: PlasmaEdge,
};

// Sacred Geometry Layout Algorithm
const generateCosmicLayout = (centralConcept: string, relatedConcepts: string[]) => {
  const centerX = 0;
  const centerY = 0;
  const goldenRatio = 1.618;
  const baseRadius = 280;

  const centralNode: Node = {
    id: "central",
    type: "central",
    position: { x: centerX - 144, y: centerY - 72 },
    data: { label: centralConcept, concept: centralConcept },
    draggable: false,
  };

  const relatedNodes: Node[] = relatedConcepts.map((concept, index) => {
    const angleStep = (Math.PI * 2) / relatedConcepts.length;
    const angle = angleStep * index - Math.PI / 2;
    const radiusVariation = Math.sin(index * goldenRatio) * 40;
    const radius = baseRadius + radiusVariation;

    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle) * 0.8; // Elliptical for depth

    return {
      id: `related-${index}`,
      type: "related",
      position: { x: x - 104, y: y - 48 },
      data: { label: concept, concept },
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

  const generateNodesAndEdges = useCallback((data: MindMapData) => {
    return generateCosmicLayout(data.centralConcept, data.relatedConcepts);
  }, []);

  const navigateToConceptFromCache = useCallback(
    (concept: string) => {
      const cachedData = mindMapCache[concept];
      if (cachedData) {
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
              reactFlowInstance.fitView({
                padding: 0.25,
                duration: 1200,
                maxZoom: 1.2,
              });
            }
          }, 100);
        }, 400);
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

      if (currentConcept !== mindMapData.centralConcept) {
        setNavigationHistory((prev) => [...prev, mindMapData.centralConcept]);
        setHistoryIndex((prev) => prev + 1);
      }

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
            reactFlowInstance.fitView({
              padding: 0.25,
              duration: 1200,
              maxZoom: 1.2,
            });
          }
        }, 100);
      }, 400);
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

    const maxVisible = 4;
    const startIndex = Math.max(0, historyIndex - maxVisible + 1);
    const visibleHistory = navigationHistory.slice(startIndex, historyIndex + 1);

    return (
      <div className="absolute top-6 left-6 z-30 animate-fade-in">
        <Breadcrumb>
          <BreadcrumbList className="bg-card/80 backdrop-blur-3xl rounded-2xl px-5 py-3 shadow-2xl border border-border/20">
            {visibleHistory.map((concept, idx) => {
              const actualIndex = startIndex + idx;
              const isLast = actualIndex === historyIndex;
              const displayText = concept.length > 18 ? `${concept.substring(0, 18)}...` : concept;

              return (
                <React.Fragment key={`${concept}-${actualIndex}`}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="font-semibold text-primary animate-pulse">
                        {displayText}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        className="hover:text-primary transition-all duration-300 cursor-pointer hover:scale-105"
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
        duration: 1200,
        maxZoom: 1.2,
      },
      minZoom: 0.3,
      maxZoom: 3,
      defaultViewport: {
        x: 0,
        y: 0,
        zoom: 0.9,
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
    <div className="relative w-full h-full min-h-[700px] sm:min-h-[900px] bg-gradient-to-br from-background via-background/98 to-background/95 rounded-3xl overflow-hidden shadow-[0_20px_80px_-20px_rgba(0,0,0,0.3)] border border-border/10">
      {/* Cosmic Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse at top right, rgba(139, 92, 246, 0.1), transparent 50%),
                        radial-gradient(ellipse at bottom left, rgba(59, 130, 246, 0.1), transparent 50%),
                        radial-gradient(circle at center, rgba(236, 72, 153, 0.05), transparent 70%)`,
          }}
        />
      </div>

      {/* Quantum Particle Field */}
      <QuantumParticleField />

      <NavigationBreadcrumb />

      <div
        className={cn(
          "transition-all duration-1200 ease-out h-full relative z-10",
          isVisible && !isTransitioning ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        <ReactFlow {...reactFlowProps}>
          <Background
            color="hsl(var(--muted-foreground))"
            gap={80}
            size={1}
            className="opacity-[0.03]"
            variant="dots"
          />
        </ReactFlow>
      </div>

      {/* Divine Navigation Controls */}
      <div className="absolute bottom-8 right-8 z-30">
        <div className="flex items-center gap-3 bg-card/70 backdrop-blur-3xl border border-border/20 rounded-3xl p-5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)]">
          <button
            onClick={goBack}
            disabled={historyIndex <= 0}
            className={cn(
              "group relative w-14 h-14 rounded-2xl transition-all duration-500",
              "bg-gradient-to-br from-primary/20 via-primary/10 to-transparent",
              "hover:from-primary/30 hover:via-primary/20 hover:to-primary/10",
              "border border-primary/20 hover:border-primary/40",
              "shadow-lg hover:shadow-2xl hover:shadow-primary/20",
              "disabled:opacity-20 disabled:cursor-not-allowed",
              "hover:scale-110 active:scale-95",
              "flex items-center justify-center"
            )}
            title="Navigate Back (⌘/Ctrl + ←)"
          >
            <span className="text-xl font-bold text-primary group-hover:scale-110 transition-transform">←</span>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
          </button>

          <button
            onClick={goForward}
            disabled={historyIndex >= navigationHistory.length - 1}
            className={cn(
              "group relative w-14 h-14 rounded-2xl transition-all duration-500",
              "bg-gradient-to-br from-primary/20 via-primary/10 to-transparent",
              "hover:from-primary/30 hover:via-primary/20 hover:to-primary/10",
              "border border-primary/20 hover:border-primary/40",
              "shadow-lg hover:shadow-2xl hover:shadow-primary/20",
              "disabled:opacity-20 disabled:cursor-not-allowed",
              "hover:scale-110 active:scale-95",
              "flex items-center justify-center"
            )}
            title="Navigate Forward (⌘/Ctrl + →)"
          >
            <span className="text-xl font-bold text-primary group-hover:scale-110 transition-transform">→</span>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
          </button>

          <div className="px-5 py-3 bg-background/40 rounded-2xl border border-border/10 backdrop-blur-xl">
            <span className="text-sm font-medium text-muted-foreground">
              {historyIndex + 1} <span className="text-primary/60 mx-1">/</span> {navigationHistory.length}
            </span>
          </div>
        </div>

        <Controls
          className="mt-4 bg-card/70 backdrop-blur-3xl border-border/20 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] hover:shadow-2xl transition-all duration-500"
          showZoom={true}
          showFitView={true}
          showInteractive={false}
        />
      </div>

      {/* Quantum Loading State */}
      {(isLoading || isTransitioning) && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-3xl flex items-center justify-center z-20">
          <div className="relative">
            <div className="flex flex-col items-center gap-10">
              {/* Sacred Geometry Loader */}
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-spin" />
                <div className="absolute inset-2 border-4 border-accent/20 rounded-full animate-spin-reverse" />
                <div
                  className="absolute inset-4 border-4 border-secondary/20 rounded-full animate-spin"
                  style={{ animationDuration: "3s" }}
                />
                <div className="absolute inset-6 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full animate-pulse blur-xl" />
                <div className="absolute inset-8 bg-gradient-to-tr from-accent/40 to-primary/40 rounded-full animate-pulse-slow" />
              </div>

              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient-x">
                  {isTransitioning ? "Quantum Leap" : "Neural Genesis"}
                </h3>
                <p className="text-sm text-muted-foreground/80 max-w-xs">
                  {isTransitioning ? "Traversing conceptual dimensions..." : "Crystallizing thought patterns..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ethereal Error State */}
      {error && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl flex items-center justify-center z-20 p-8">
          <Card className="relative p-10 max-w-md mx-auto overflow-hidden border-destructive/20 shadow-[0_20px_60px_-15px_rgba(239,68,68,0.3)]">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-destructive/5" />

            <div className="relative text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-destructive/30 to-destructive/10 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-10 h-10 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">Dimension Breach</h3>
                <p className="text-muted-foreground leading-relaxed">{error}</p>
              </div>

              <button
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-2xl font-semibold transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-primary/30"
              >
                Restore Connection
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Celestial Empty State */}
      {!mindMapData && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <Card className="relative p-14 max-w-lg mx-auto overflow-hidden border-border/10 bg-card/50 backdrop-blur-3xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.3)]">
            <div className="absolute inset-0">
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-float" />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-full blur-3xl animate-float-delayed" />
            </div>

            <div className="relative text-center space-y-10">
              <div className="w-36 h-36 mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/30 to-secondary/30 rounded-full animate-pulse blur-2xl" />
                <div className="absolute inset-4 bg-gradient-to-tr from-primary/40 to-accent/40 rounded-full animate-pulse-slow blur-xl" />
                <div className="absolute inset-8 flex items-center justify-center">
                  <svg
                    className="w-20 h-20 text-primary animate-float"
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
              </div>

              <div className="space-y-5">
                <h3 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient-x">
                  Mind Nexus
                </h3>
                <p className="text-lg text-muted-foreground/90 leading-relaxed max-w-sm mx-auto">
                  Begin your journey through infinite conceptual realms
                </p>
              </div>

              <div className="flex items-center justify-center gap-8 text-sm">
                {[
                  { label: "Quantum", icon: "⚛️" },
                  { label: "Neural", icon: "🧬" },
                  { label: "Infinite", icon: "♾️" },
                ].map((feature) => (
                  <div key={feature.label} className="flex flex-col items-center gap-2 group">
                    <span className="text-3xl group-hover:scale-125 transition-transform duration-300">
                      {feature.icon}
                    </span>
                    <span className="font-medium text-muted-foreground/70 group-hover:text-primary transition-colors">
                      {feature.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      <style jsx global>{`
        @keyframes breathe {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-orbit {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) translateX(80px) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) translateX(80px) rotate(-360deg);
          }
        }

        @keyframes quantum-pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.5);
            opacity: 1;
          }
        }

        @keyframes sparkle-rise {
          0% {
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translateY(-20px) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-40px) scale(0);
            opacity: 0;
          }
        }

        @keyframes prism-shift {
          0%,
          100% {
            filter: hue-rotate(0deg);
          }
          50% {
            filter: hue-rotate(30deg);
          }
        }

        @keyframes plasma-flow {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes dash-flow {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -60;
          }
        }

        @keyframes quantum-dash {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -16;
          }
        }

        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
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

        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 6s ease-in-out 3s infinite;
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
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
