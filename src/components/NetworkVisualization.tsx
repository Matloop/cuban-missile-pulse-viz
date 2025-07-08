
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const NetworkVisualization = ({ nodes, currentEvent, onNodeSelect, selectedNode }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!currentEvent || !nodes) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 500;
    
    svg.attr("width", width).attr("height", height);

    // Create links from current event actions
    const links = currentEvent.actions.map(action => ({
      source: action.source,
      target: action.target,
      type: action.type,
      strength: action.strength || 0.5
    }));

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    // Add glow filter
    const defs = svg.append("defs");
    const filter = defs.append("filter")
      .attr("id", "glow");
    
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");
    
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Create links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", d => {
        switch(d.type) {
          case 'threat': return '#ff4444';
          case 'blockade': return '#ff8800';
          case 'alliance': return '#4488ff';
          case 'agreement': return '#44ff44';
          case 'attack': return '#ff0000';
          case 'ultimatum': return '#ff0044';
          default: return '#888';
        }
      })
      .attr("stroke-width", d => Math.max(1, d.strength * 4))
      .attr("stroke-opacity", 0.8)
      .style("filter", "url(#glow)");

    // Create link labels
    const linkLabels = svg.append("g")
      .selectAll("text")
      .data(links)
      .join("text")
      .text(d => d.type.toUpperCase())
      .attr("font-size", "10px")
      .attr("fill", "#fff")
      .attr("text-anchor", "middle")
      .attr("dy", -5)
      .style("opacity", 0.8);

    // Create nodes
    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", d => d.type === 'País' ? 25 : 20)
      .attr("fill", d => d.color)
      .attr("stroke", d => selectedNode?.id === d.id ? "#fff" : "#333")
      .attr("stroke-width", d => selectedNode?.id === d.id ? 3 : 1)
      .style("filter", "url(#glow)")
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Add node labels
    const nodeLabels = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text(d => d.name)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#fff")
      .attr("text-anchor", "middle")
      .attr("dy", 35)
      .style("pointer-events", "none");

    // Add leader labels
    const leaderLabels = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text(d => d.leader)
      .attr("font-size", "10px")
      .attr("fill", "#ccc")
      .attr("text-anchor", "middle")
      .attr("dy", 48)
      .style("pointer-events", "none");

    // Node click handler
    node.on("click", (event, d) => {
      onNodeSelect(d);
    });

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      linkLabels
        .attr("x", d => (d.source.x + d.target.x) / 2)
        .attr("y", d => (d.source.y + d.target.y) / 2);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      nodeLabels
        .attr("x", d => d.x)
        .attr("y", d => d.y);

      leaderLabels
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };

  }, [currentEvent, nodes, selectedNode, onNodeSelect]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        ref={svgRef}
        className="border border-blue-500/20 rounded bg-black/10"
        style={{ maxWidth: '100%', height: '500px' }}
      />
    </div>
  );
};

export default NetworkVisualization;
