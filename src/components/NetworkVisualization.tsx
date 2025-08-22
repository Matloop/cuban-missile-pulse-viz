import React, { useEffect, useRef, useState, useLayoutEffect, useCallback } from 'react';
import * as d3 from 'd3';
import { Button } from './ui/button';
import { RotateCcw, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NetworkNode } from '../types/crisisDataTypes'; // Adjust the path as needed

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

interface NetworkVisualizationProps {
  nodes: NetworkNode[];
  currentEvent: NetworkEvent | null;
  selectedNode: NetworkNode | null;
  onNodeSelect: (node: NetworkNode | null) => void;
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
  const gRef = useRef<SVGGElement | null>(null);
  const simulationRef = useRef<d3.Simulation<NetworkNode, NetworkLink>>();
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>();

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Effect for handling container resizing
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
        
        // Update simulation center on resize
        if (simulationRef.current) {
          simulationRef.current.force("center", d3.forceCenter(width / 2, height / 2));
          simulationRef.current.alpha(0.3).restart();
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleResetView = useCallback(() => {
    if (simulationRef.current) {
      simulationRef.current.alpha(1).restart();
    }
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(750).call(zoomRef.current.transform, d3.zoomIdentity);
    }
  }, []);

  // Effect for one-time initialization of SVG structure and D3 simulation
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || simulationRef.current) {
      return; // Only run once
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous renders

    // Add filters for visual effects
    const defs = svg.append("defs");
    defs.append("filter").attr("id", "glow")
      .append("feGaussianBlur").attr("stdDeviation", "3.5");
      
    const energyFilter = defs.append("filter").attr("id", "energy-filter");
    energyFilter.append("feTurbulence")
      .attr("type", "fractalNoise").attr("baseFrequency", "0.05 0.5")
      .attr("numOctaves", "2").attr("result", "turbulence");
    energyFilter.append("feDisplacementMap")
      .attr("in2", "turbulence").attr("in", "SourceGraphic").attr("scale", "10");

    gRef.current = svg.append("g").node();
    const g = d3.select(gRef.current);

    g.append("g").attr("class", "links");
    g.append("g").attr("class", "nodes");
    g.append("g").attr("class", "labels");
    g.append("g").attr("class", "selection");
    
    // Create the simulation
    simulationRef.current = d3.forceSimulation<NetworkNode>()
      .force("link", d3.forceLink<NetworkNode, NetworkLink>().id(d => d.id).distance(200).strength(0.5))
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force("collision", d3.forceCollide().radius(50));
      
    const simulation = simulationRef.current;
    
    // Define the tick function
    simulation.on("tick", () => {
      g.select<SVGGElement>('.links').selectAll<SVGLineElement, NetworkLink>('line')
        .attr("x1", d => (d.source as NetworkNode).x ?? 0)
        .attr("y1", d => (d.source as NetworkNode).y ?? 0)
        .attr("x2", d => (d.target as NetworkNode).x ?? 0)
        .attr("y2", d => (d.target as NetworkNode).y ?? 0);
        
      g.select<SVGGElement>('.nodes').selectAll<SVGCircleElement, NetworkNode>('circle')
        .attr("cx", d => d.x ?? 0).attr("cy", d => d.y ?? 0);
        
      g.select<SVGGElement>('.labels').selectAll<SVGTextElement, NetworkNode>('text')
        .attr("x", d => d.x ?? 0).attr("y", d => d.y ?? 0);
    });

    // Setup zoom behavior
    zoomRef.current = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.5, 4]).on("zoom", (event) => {
      g.attr("transform", event.transform.toString());
    });
    svg.call(zoomRef.current);
    
    // Cleanup function to stop the simulation
    return () => {
      simulation.stop();
    };

  }, [dimensions.width, dimensions.height]);
  
  // Effect to update nodes and links together
  useEffect(() => {
    if (!simulationRef.current || !gRef.current || !currentEvent) return;
    
    const simulation = simulationRef.current;
    const g = d3.select(gRef.current);
    const nodeData: NetworkNode[] = nodes.map(d => ({ ...d }));
    const linkData: NetworkLink[] = currentEvent.actions.map(action => ({ 
      source: action.source, 
      target: action.target, 
      type: action.type, 
      strength: action.strength || 0.5 
    }));

    // Update simulation nodes
    simulation.nodes(nodeData);
    
    // IMPORTANT: Update links AFTER nodes are set
    (simulation.force("link") as d3.ForceLink<NetworkNode, NetworkLink>).links(linkData);

    const drag = d3.drag<SVGCircleElement, NetworkNode>()
      .on("start", (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
      .on("end", (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; });
    
    // D3 data binding and enter/update/exit pattern for node circles
    const nodeCircles = g.select<SVGGElement>('.nodes')
      .selectAll<SVGCircleElement, NetworkNode>('circle')
      .data(nodeData, d => d.id);

    // Remove old circles
    nodeCircles.exit().remove();
    
    // Add new circles
    const enterCircles = nodeCircles.enter().append('circle');
    
    // Update all circles (new + existing)
    nodeCircles.merge(enterCircles)
      .attr("r", 30)
      .attr("fill", d => d.color || '#0066cc')
      .attr("stroke", "#333")
      .attr("stroke-width", 2)
      .style("filter", "url(#glow)")
      .style("cursor", "pointer")
      .on("click", (event, d) => onNodeSelect(d))
      .call(drag);
        
    // D3 data binding and enter/update/exit pattern for labels
    const nodeLabels = g.select<SVGGElement>('.labels')
      .selectAll<SVGTextElement, NetworkNode>('text')
      .data(nodeData, d => d.id);

    // Remove old labels
    nodeLabels.exit().remove();
    
    // Add new labels
    const enterLabels = nodeLabels.enter().append("text");
    
    // Update all labels (new + existing)
    nodeLabels.merge(enterLabels)
      .text(d => d.name)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#fff")
      .attr("text-anchor", "middle")
      .attr("dy", 45)
      .style("pointer-events", "none")
      .style("filter", "drop-shadow(0px 0px 3px rgba(0,0,0,0.8))");

    // D3 data binding and enter/update/exit pattern for links
    const linkLines = g.select<SVGGElement>('.links')
      .selectAll<SVGLineElement, NetworkLink>("line")
      .data(linkData, d => `${(typeof d.source === 'string' ? d.source : d.source.id)}-${(typeof d.target === 'string' ? d.target : d.target.id)}`);

    // Remove old links
    linkLines.exit().remove();
    
    // Add new links
    const enterLinks = linkLines.enter().append("line");
    
    // Update all links (new + existing)
    linkLines.merge(enterLinks)
      .attr("stroke", d => ({
        'threat': '#ff4444', 
        'blockade': '#ff8800', 
        'agreement': '#44ff44', 
        'attack': '#ff0000', 
        'ultimatum': '#ff0044', 
        'surveillance': '#9966ff', 
        'standoff': '#ff6666', 
        'negotiation': '#66aaff'
      }[d.type] || '#888'))
      .attr("stroke-width", d => Math.max(1.5, d.strength * 3))
      .attr("stroke-opacity", 0.8)
      .style("filter", "url(#energy-filter) url(#glow)");

    simulation.alpha(0.3).restart();

  }, [nodes, currentEvent, onNodeSelect]);

  // Effect to manage the selected node's visual indicator
  useEffect(() => {
    if (!gRef.current) return;
    
    const g = d3.select(gRef.current);
    const selectionData = selectedNode ? [nodes.find(n => n.id === selectedNode.id)].filter(Boolean) as NetworkNode[] : [];

    const selectionCircles = g.select<SVGGElement>('.selection')
      .selectAll<SVGCircleElement, NetworkNode>('circle')
      .data(selectionData, d => d.id);

    // Remove old selection circles
    selectionCircles.exit().remove();
    
    // Add new selection circles
    const enterSelection = selectionCircles.enter().append('circle');
    
    // Update all selection circles (new + existing)
    selectionCircles.merge(enterSelection)
      .attr('r', 35)
      .attr('stroke', '#fff')
      .attr('stroke-width', 4)
      .attr('fill', 'none')
      .style('filter', 'url(#glow)')
      .style('pointer-events', 'none')
      .attr('cx', d => d?.x ?? 0)
      .attr('cy', d => d?.y ?? 0);

    simulationRef.current?.on('tick.selection', () => {
      g.select<SVGGElement>('.selection').selectAll<SVGCircleElement, NetworkNode>('circle')
        .attr('cx', d => d?.x ?? 0)
        .attr('cy', d => d?.y ?? 0);
    });
  }, [selectedNode, nodes]);


  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
      <div className="absolute top-2 left-2 flex gap-2">
        <Button onClick={handleResetView} variant="outline" size="sm" className="bg-slate-800/50 backdrop-blur-sm border-slate-600 hover:bg-slate-700">
          <RotateCcw className="w-4 h-4 mr-2" /> Resetar Posições
        </Button>
      </div>
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="absolute top-12 left-2 w-80 max-h-[calc(100%-4rem)] bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 text-white overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-cyan-200">{selectedNode.name}</h3>
              <Button onClick={() => onNodeSelect(null)} variant="ghost" size="icon" className="h-7 w-7">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-sm text-gray-300 mb-3">{selectedNode.description}</p>
            <div className="space-y-2 text-xs border-t border-cyan-700/50 pt-3">
              <p><strong className="text-cyan-400">Líder:</strong> {selectedNode.leader}</p>
              <p><strong className="text-cyan-400">Objetivo:</strong> {selectedNode.objective}</p>
              <p><strong className="text-cyan-400">Figuras-Chave:</strong> {selectedNode.key_figures}</p>
              <p><strong className="text-cyan-400">Recursos:</strong> {selectedNode.key_assets}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NetworkVisualization;