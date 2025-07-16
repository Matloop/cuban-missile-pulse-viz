import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const NetworkVisualization = ({ nodes, currentEvent, onNodeSelect, selectedNode }) => {
  const svgRef = useRef();
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    if (!currentEvent || !nodes || !currentEvent.actions) return;

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

    // Create copies of data for D3
    const nodeData = nodes.map(d => ({ ...d }));
    const linkData = links.map(d => ({ ...d }));

    // Create force simulation
    const simulation = d3.forceSimulation(nodeData)
      .force("link", d3.forceLink(linkData).id(d => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(35));

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

    // Create container group
    const g = svg.append("g");

    // Create links
    const link = g.append("g")
      .selectAll("line")
      .data(linkData)
      .join("line")
      .attr("stroke", d => {
        const colors = {
          'threat': '#ff4444',
          'blockade': '#ff8800',
          'alliance': '#4488ff',
          'agreement': '#44ff44',
          'attack': '#ff0000',
          'ultimatum': '#ff0044',
          'surveillance': '#9966ff',
          'negotiation': '#66ffaa',
          'support': '#ffaa66',
          'standoff': '#ff6666',
          'guarantee': '#aaffaa'
        };
        return colors[d.type] || '#888';
      })
      .attr("stroke-width", d => Math.max(2, d.strength * 4))
      .attr("stroke-opacity", 0.8)
      .style("filter", "url(#glow)");

    // Create nodes
    const node = g.append("g")
      .selectAll("circle")
      .data(nodeData)
      .join("circle")
      .attr("r", d => d.type === 'País' ? 25 : 20)
      .attr("fill", d => d.color || '#0066cc')
      .attr("stroke", d => {
        if (selectedNode?.id === d.id) return "#fff";
        if (hoveredNode === d.id) return "#ffff00";
        return "#333";
      })
      .attr("stroke-width", d => {
        if (selectedNode?.id === d.id) return 3;
        if (hoveredNode === d.id) return 4;
        return 2;
      })
      .style("filter", "url(#glow)")
      .style("cursor", "pointer")
      .style("opacity", d => {
        if (!hoveredNode) return 1;
        // Show hovered node and connected nodes
        const isConnected = linkData.some(link => 
          (link.source.id === hoveredNode && link.target.id === d.id) ||
          (link.target.id === hoveredNode && link.source.id === d.id) ||
          d.id === hoveredNode
        );
        return isConnected ? 1 : 0.3;
      })
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .on("mouseover", (event, d) => {
        setHoveredNode(d.id);
      })
      .on("mouseout", () => {
        setHoveredNode(null);
      })
      .on("click", (event, d) => {
        onNodeSelect(d);
      });

    // Add node labels
    const labels = g.append("g")
      .selectAll("text")
      .data(nodeData)
      .join("text")
      .text(d => d.name)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#fff")
      .attr("text-anchor", "middle")
      .attr("dy", 35)
      .style("pointer-events", "none")
      .style("opacity", d => {
        if (!hoveredNode) return 1;
        const isConnected = linkData.some(link => 
          (link.source.id === hoveredNode && link.target.id === d.id) ||
          (link.target.id === hoveredNode && link.source.id === d.id) ||
          d.id === hoveredNode
        );
        return isConnected ? 1 : 0.3;
      });

    // Add leader labels
    const leaderLabels = g.append("g")
      .selectAll("text")
      .data(nodeData)
      .join("text")
      .text(d => d.leader || '')
      .attr("font-size", "10px")
      .attr("fill", "#ccc")
      .attr("text-anchor", "middle")
      .attr("dy", 50)
      .style("pointer-events", "none")
      .style("opacity", 0.7);

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      labels
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

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 2])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    return () => {
      simulation.stop();
    };

  }, [currentEvent, nodes, selectedNode, hoveredNode]);

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