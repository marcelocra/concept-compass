import { Node } from "reactflow";

// Golden ratio for aesthetically pleasing layouts
const GOLDEN_RATIO = 1.618;

// Calculate organic radial layout positions
export const calculateRadialLayout = (
  centralConcept: string,
  relatedConcepts: string[],
  canvasWidth = 800,
  canvasHeight = 600
) => {
  const centerX = 0;
  const centerY = 0;
  
  // Dynamic radius based on number of nodes and canvas size
  const baseRadius = Math.min(canvasWidth, canvasHeight) * 0.25;
  const radius = Math.max(200, baseRadius);
  
  // Create central node
  const centralNode: Node = {
    id: "central",
    type: "central",
    position: { x: centerX, y: centerY },
    data: {
      label: centralConcept,
      concept: centralConcept,
    },
    draggable: false,
  };

  // Create related nodes with organic positioning
  const relatedNodes: Node[] = relatedConcepts.map((concept, index) => {
    // Use golden ratio for more natural spacing
    const angleStep = (2 * Math.PI) / relatedConcepts.length;
    const goldenAngle = angleStep * GOLDEN_RATIO;
    const angle = index * goldenAngle;
    
    // Add slight randomness for organic feel (but deterministic)
    const radiusVariation = 1 + (Math.sin(index * 2.3) * 0.2);
    const angleVariation = Math.sin(index * 1.7) * 0.3;
    
    const adjustedRadius = radius * radiusVariation;
    const adjustedAngle = angle + angleVariation;
    
    // Calculate position with slight spiral effect
    const spiralFactor = 1 + (index * 0.05);
    const x = centerX + (adjustedRadius * spiralFactor) * Math.cos(adjustedAngle);
    const y = centerY + (adjustedRadius * spiralFactor) * Math.sin(adjustedAngle);

    return {
      id: `related-${index}`,
      type: "related",
      position: { x, y },
      data: {
        label: concept,
        concept: concept,
      },
      draggable: false,
    };
  });

  return {
    nodes: [centralNode, ...relatedNodes],
    centralNode,
    relatedNodes,
  };
};

// Calculate smooth edges with enhanced styling
export const calculateEnhancedEdges = (relatedNodes: Node[]) => {
  return relatedNodes.map((node) => ({
    id: `edge-central-${node.id}`,
    source: "central",
    target: node.id,
    type: "smart",
    style: {
      stroke: "hsl(var(--primary))",
      strokeWidth: 3,
      strokeOpacity: 0.8,
    },
    animated: false,
  }));
};

// Animation utilities for smooth transitions
export const createNodeAnimation = (delay = 0) => ({
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      delay: delay * 0.1,
    }
  },
});

// Responsive layout adjustments
export const getResponsiveRadius = () => {
  if (typeof window === 'undefined') return 220;
  
  const width = window.innerWidth;
  if (width < 640) return 120; // Mobile
  if (width < 1024) return 160; // Tablet
  return 220; // Desktop
};