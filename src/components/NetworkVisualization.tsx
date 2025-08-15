// src/components/NetworkVisualization.tsx

import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import * as d3 from 'd3';

// --- TYPE DEFINITIONS (UNCHANGED) ---
interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  leader?: string;
  type: string;
  color: string;
}
interface NetworkLink extends d3.SimulationLinkDatum<NetworkNode> {
  source: string | NetworkNode;
  target: string | NetworkNode;
  type: string;
  strength: number;
}
interface NetworkEvent {
  actions: {
    source: string;
    target: string;
    type: string;
    strength?: number;
  }[];
}
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}
interface NetworkVisualizationProps {
  nodes: NetworkNode[];
  currentEvent: NetworkEvent | null;
  selectedNode: NetworkNode | null;
  onNodeSelect: (node: NetworkNode) => void;
}

// --- THE COMPONENT ---
const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({
  nodes,
  currentEvent,
  onNodeSelect,
  selectedNode,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // --- FIX 1: Create a ref to store the current D3 zoom transformation. ---
  // This allows the animation loop to access the latest zoom/pan state without causing re-renders.
  const zoomTransformRef = useRef(d3.zoomIdentity);

  useLayoutEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    }
  }, []);

  useEffect(() => {
    if (!currentEvent || !nodes || !currentEvent.actions || !canvasRef.current || !svgRef.current || dimensions.width === 0) {
      return;
    }

    const { width, height } = dimensions;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const svg = d3.select(svgRef.current);

    svg.selectAll("*").remove();

    canvas.width = width;
    canvas.height = height;
    svg.attr("width", width).attr("height", height);

    if (!ctx) return;

    const linkData: NetworkLink[] = currentEvent.actions.map(action => ({
      source: action.source,
      target: action.target,
      type: action.type,
      strength: action.strength || 0.5,
    }));
    const nodeData: NetworkNode[] = nodes.map(d => ({ ...d }));

    let particles: Particle[] = [];
    const emitParticles = (node: NetworkNode) => {
      if (node.x === undefined || node.y === undefined) return;
      const particleCount = 2;
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const speed = Math.random() * 0.5 + 0.1;
        particles.push({
          x: node.x, y: node.y,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          life: Math.random() * 30 + 30, color: node.color,
        });
      }
    };

    const simulation = d3.forceSimulation<NetworkNode>(nodeData)
      .force("link", d3.forceLink<NetworkNode, NetworkLink>(linkData).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    const g = svg.append("g");

    const link = g.append("g").selectAll("line").data(linkData).join("line")
      .attr("stroke", d => {
          const colors = { 'threat': '#ff4444', 'blockade': '#ff8800', 'agreement': '#44ff44', 'attack': '#ff0000', 'ultimatum': '#ff0044', 'surveillance': '#9966ff', 'standoff': '#ff6666' };
          return colors[d.type as keyof typeof colors] || '#888';
      })
      .attr("stroke-width", d => Math.max(2, d.strength * 4))
      .attr("stroke-opacity", 0.6);

    const node = g.append("g").selectAll<SVGCircleElement, NetworkNode>("circle").data(nodeData).join("circle")
      .attr("r", 30)
      .attr("fill", d => d.color || '#0066cc')
      .attr("stroke", d => (selectedNode?.id === d.id ? "#fff" : "#333"))
      .attr("stroke-width", d => (selectedNode?.id === d.id ? 3 : 2))
      .style("cursor", "pointer")
      .on("click", (event, d) => onNodeSelect(d));

    const labels = g.append("g").selectAll("text").data(nodeData).join("text")
      .text(d => d.name)
      .attr("font-size", "12px").attr("font-weight", "bold").attr("fill", "#fff")
      .attr("text-anchor", "middle").attr("dy", 45).style("pointer-events", "none");

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // --- FIX 2: Get the current transform from our ref. ---
      const currentTransform = zoomTransformRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life--;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        p.x += p.vx; p.y += p.vy;
        
        // --- FIX 3: Transform the particle's coordinates before drawing. ---
        // The .apply() method converts simulation coordinates to screen coordinates.
        const [screenX, screenY] = currentTransform.apply([p.x, p.y]);

        ctx.globalAlpha = p.life / 60;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        // Use the new screen-aware coordinates to draw the particle
        ctx.arc(screenX, screenY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      animationFrameId.current = requestAnimationFrame(animate);
    };

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as NetworkNode).x ?? 0).attr("y1", d => (d.source as NetworkNode).y ?? 0)
        .attr("x2", d => (d.target as NetworkNode).x ?? 0).attr("y2", d => (d.target as NetworkNode).y ?? 0);
      node.attr("cx", d => d.x ?? 0).attr("cy", d => d.y ?? 0);
      labels.attr("x", d => d.x ?? 0).attr("y", d => d.y ?? 0);
      nodeData.forEach(emitParticles);
    });

    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, NetworkNode, any>, d: NetworkNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x; d.fy = d.y;
    }
    function dragged(event: d3.D3DragEvent<SVGCircleElement, NetworkNode, any>, d: NetworkNode) {
      d.fx = event.x; d.fy = event.y;
    }
    function dragended(event: d3.D3DragEvent<SVGCircleElement, NetworkNode, any>, d: NetworkNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null; d.fy = null;
    }
    node.call(d3.drag<SVGCircleElement, NetworkNode>().on("start", dragstarted).on("drag", dragged).on("end", dragended));
    
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.5, 2]).on("zoom", (event) => {
        // This moves the SVG elements
        g.attr("transform", event.transform.toString());
        // --- FIX 4: Update our ref with the latest transform object. ---
        zoomTransformRef.current = event.transform;
    });
    svg.call(zoom);

    animate();

    return () => {
      simulation.stop();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [currentEvent, nodes, selectedNode, onNodeSelect, dimensions]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute top-0 left-0" />
      <svg ref={svgRef} className="absolute top-0 left-0" />
    </div>
  );
};

export default NetworkVisualization;