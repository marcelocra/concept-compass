# Design Document

## Overview

The Ultimate Mind Map Canvas combines the best features from multiple canvas iterations into a single, high-performance component. The design emphasizes visual excellence through quantum particle effects and divine styling while maintaining smooth performance through intelligent quality management and optimization techniques.

## Architecture

### Component Structure

```
UltimateMindMapCanvas/
├── mind-map-canvas-ultimate.tsx     # Main canvas component
├── hooks/
│   ├── usePerformanceMonitor.ts     # FPS monitoring and quality management
│   ├── useParticleSystem.ts         # Quantum particle field management
│   ├── useCanvasNavigation.ts       # Navigation with history management
│   └── useQualityMode.ts            # Dynamic quality adjustment
├── components/
│   ├── QuantumParticleField.tsx     # Canvas-based particle system
│   ├── CSSParticleField.tsx         # Fallback CSS particle system
│   ├── DivineNode.tsx               # Central node with all effects
│   ├── CrystallineNode.tsx          # Related nodes with prismatic effects
│   ├── PlasmaEdge.tsx               # Quantum entangled edges
│   ├── BreadcrumbNavigation.tsx     # Enhanced navigation breadcrumbs
│   └── PerformanceDashboard.tsx     # Optional performance metrics display
├── utils/
│   ├── geometryCalculations.ts      # Sacred geometry and golden ratio math
│   ├── performanceUtils.ts          # Performance optimization utilities
│   └── animationUtils.ts            # Animation timing and easing functions
└── types/
    ├── canvas.types.ts              # Canvas-specific type definitions
    └── performance.types.ts         # Performance monitoring types
```

### State Management Architecture

The component uses a layered state management approach:

1. **Performance State**: Managed by `usePerformanceMonitor` hook
2. **Navigation State**: Managed by `useCanvasNavigation` with `isNavigatingRef` to prevent history pollution
3. **Particle State**: Managed by `useParticleSystem` with quality-based rendering
4. **Quality State**: Managed by `useQualityMode` with automatic adjustment

### Quality Mode System

Four quality levels with progressive feature degradation:

-   **Ultra**: All effects enabled, 60+ FPS target
-   **High**: Reduced particle count, simplified shaders, 45+ FPS target
-   **Medium**: Basic effects only, CSS animations, 30+ FPS target
-   **Performance**: Minimal effects, CSS particles, 24+ FPS target

## Components and Interfaces

### Core Canvas Component

```typescript
interface UltimateMindMapCanvasProps {
    concepts: ConceptNode[];
    centralConcept: ConceptNode;
    onConceptClick: (concept: ConceptNode) => void;
    onNavigate?: (concept: ConceptNode) => void;
    qualityMode?: QualityMode;
    enablePerformanceMonitoring?: boolean;
    enableTouchGestures?: boolean;
}

interface QualityMode {
    level: "ultra" | "high" | "medium" | "performance";
    particleCount: number;
    enableShaders: boolean;
    enableComplexAnimations: boolean;
    useCanvasParticles: boolean;
}
```

### Performance Monitoring

```typescript
interface PerformanceMetrics {
    fps: number;
    frameTime: number;
    qualityLevel: string;
    particleCount: number;
    renderTime: number;
}

interface PerformanceThresholds {
    degradeBelow: number; // FPS threshold to reduce quality
    upgradeAbove: number; // FPS threshold to increase quality
    measurementWindow: number; // Frames to average over
}
```

### Particle System

```typescript
interface ParticleSystemConfig {
    count: number;
    mouseGravity: number;
    connectionDistance: number;
    speed: number;
    size: number;
    opacity: number;
    enableTrails: boolean;
    enableQuantumEffects: boolean;
}
```

### Navigation System

```typescript
interface NavigationState {
    currentConcept: ConceptNode;
    breadcrumbs: ConceptNode[];
    history: ConceptNode[];
    isNavigating: boolean;
    transitionDuration: number;
}
```

## Data Models

### Enhanced Concept Node

```typescript
interface ConceptNode {
    id: string;
    text: string;
    x: number;
    y: number;
    level: number;
    connections: string[];
    visualProperties: {
        size: number;
        color: string;
        glowIntensity: number;
        particleCount: number;
        effectsEnabled: boolean;
    };
    geometryProperties: {
        angle: number;
        radius: number;
        depth: number;
        goldenRatioPosition: number;
    };
}
```

### Visual Effect Configurations

```typescript
interface DivineNodeEffects {
    auroraField: boolean;
    shimmerEffect: boolean;
    orbitalRings: boolean;
    sacredGeometry: boolean;
    holographicShimmer: boolean;
    energyOrbs: boolean;
    morphingGradient: boolean;
}

interface CrystallineNodeEffects {
    prismaticEffects: boolean;
    hoverGlow: boolean;
    glassMorphism: boolean;
    floatingSparkles: boolean;
    diamondLattice: boolean;
    gradientAccents: boolean;
}

interface PlasmaEdgeEffects {
    plasmaFlow: boolean;
    quantumParticles: boolean;
    particleTrails: boolean;
    gradientAnimation: boolean;
    energyPulse: boolean;
    quantumEntanglement: boolean;
}
```

## Layout Algorithm

### Sacred Geometry Positioning

The layout algorithm combines multiple mathematical principles:

1. **Golden Angle Spiral**: Primary positioning using φ = 1.618033988749
2. **Sacred Geometry**: Hexagonal and pentagonal arrangements for harmony
3. **Elliptical Depth**: Z-axis positioning for 3D effect
4. **Vertical Spread**: Variation to prevent overlapping

```typescript
interface GeometryCalculation {
    calculateGoldenAnglePosition(index: number, radius: number): Point2D;
    applySacredGeometryConstraints(positions: Point2D[]): Point2D[];
    calculateEllipticalDepth(level: number, maxLevels: number): number;
    applyVerticalSpread(positions: Point2D[], spreadFactor: number): Point2D[];
}
```

### Positioning Algorithm

```typescript
function calculateNodePositions(
    concepts: ConceptNode[],
    centralConcept: ConceptNode,
    canvasSize: Size
): ConceptNode[] {
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians
    const baseRadius = Math.min(canvasSize.width, canvasSize.height) * 0.3;

    return concepts.map((concept, index) => {
        const angle = index * goldenAngle;
        const radius =
            (baseRadius * Math.sqrt(index + 1)) / Math.sqrt(concepts.length);
        const depth = calculateEllipticalDepth(concept.level, 3);

        return {
            ...concept,
            x: centralConcept.x + radius * Math.cos(angle),
            y: centralConcept.y + radius * Math.sin(angle) * (1 + depth * 0.3),
            geometryProperties: {
                angle,
                radius,
                depth,
                goldenRatioPosition: (index + 1) / concepts.length,
            },
        };
    });
}
```

## Error Handling

### Performance Degradation Recovery

```typescript
interface ErrorRecoveryStrategy {
    performanceDegradation: {
        detection: "fps-monitoring" | "frame-time-analysis";
        response: "quality-reduction" | "effect-disabling" | "fallback-mode";
        recovery: "gradual-upgrade" | "user-prompt" | "automatic";
    };

    renderingErrors: {
        canvasErrors: "fallback-to-css";
        shaderErrors: "disable-webgl-effects";
        memoryErrors: "reduce-particle-count";
    };

    navigationErrors: {
        stateCorruption: "reset-to-last-known-good";
        historyOverflow: "trim-oldest-entries";
        transitionFailure: "immediate-snap-to-target";
    };
}
```

### Graceful Degradation Levels

1. **Level 1**: Disable complex shaders, reduce particle count by 50%
2. **Level 2**: Switch to CSS particles, disable 3D effects
3. **Level 3**: Minimal animations, basic node styling only
4. **Level 4**: Static layout with hover effects only

## Testing Strategy

### Performance Testing

1. **FPS Benchmarking**: Test on various devices with different quality modes
2. **Memory Usage**: Monitor memory consumption during extended use
3. **Battery Impact**: Test power consumption on mobile devices
4. **Thermal Throttling**: Verify behavior under CPU/GPU thermal limits

### Visual Testing

1. **Cross-Browser Compatibility**: Test WebGL and Canvas API support
2. **Device Testing**: Verify on desktop, tablet, and mobile form factors
3. **Accessibility**: Ensure effects don't interfere with screen readers
4. **Color Blindness**: Test particle and node color schemes

### Interaction Testing

1. **Touch Gestures**: Verify pinch, pan, and tap on touch devices
2. **Keyboard Navigation**: Test all keyboard shortcuts and accessibility
3. **Mouse Interactions**: Verify hover states and click responsiveness
4. **Navigation Flow**: Test breadcrumb navigation and history management

### Integration Testing

1. **State Management**: Verify state consistency across navigation
2. **Cache Integration**: Test with existing caching mechanisms
3. **API Integration**: Ensure compatibility with concept generation APIs
4. **Session Persistence**: Verify state restoration after page reload

## Implementation Phases

### Phase 1: Core Architecture

-   Set up component structure and base canvas
-   Implement quality mode system
-   Create performance monitoring foundation

### Phase 2: Visual Effects System

-   Implement quantum particle field
-   Create divine and crystalline node components
-   Add plasma edge effects

### Phase 3: Layout and Navigation

-   Implement sacred geometry positioning
-   Add smooth navigation transitions
-   Create breadcrumb system

### Phase 4: Performance Optimization

-   Add automatic quality adjustment
-   Implement lazy loading and memoization
-   Optimize animation performance

### Phase 5: Touch and Accessibility

-   Add touch gesture support
-   Implement keyboard navigation
-   Ensure accessibility compliance

### Phase 6: Polish and Testing

-   Fine-tune animation timings
-   Add error recovery mechanisms
-   Comprehensive device testing
