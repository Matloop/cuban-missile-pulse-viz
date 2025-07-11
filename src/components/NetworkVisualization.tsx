
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const NetworkVisualization = ({ nodes, currentEvent, onNodeSelect, selectedNode }) => {
  const svgRef = useRef();
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Helper function to get connected nodes
  const getConnectedNodes = (nodeId, links) => {
    const connected = new Set([nodeId]);
    links.forEach(link => {
      if (link.source.id === nodeId) connected.add(link.target.id);
      if (link.target.id === nodeId) connected.add(link.source.id);
    });
    return connected;
  };

  // Helper function to get link details
  const getLinkDetails = (linkType) => {
    const details = {
      threat: "Ameaça militar direta com possibilidade de escalada para conflito armado",
      blockade: "Bloqueio naval impedindo entrada de navios soviéticos em Cuba",
      alliance: "Aliança militar estratégica para apoio mútuo durante a crise",
      agreement: "Acordo diplomático para resolução pacífica da crise",
      attack: "Ataque militar direto resultando em vítimas",
      ultimatum: "Ultimato exigindo ação imediata sob pena de consequências militares",
      surveillance: "Operações de reconhecimento e espionagem",
      negotiation: "Conversações diplomáticas secretas para resolver a crise",
      support: "Apoio logístico e militar a aliados",
      standoff: "Confronto direto sem escalada militar imediata",
      guarantee: "Garantia formal de não agressão"
    };
    return details[linkType] || "Interação diplomática ou militar durante a crise";
  };

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
      strength: action.strength || 0.5,
      details: getLinkDetails(action.type)
    }));

    // Setup zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        setZoomLevel(event.transform.k);
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create main group for zoomable content
    const g = svg.append("g");

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
    const link = g.append("g")
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
          case 'surveillance': return '#9966ff';
          case 'negotiation': return '#66ffaa';
          case 'support': return '#ffaa66';
          case 'standoff': return '#ff6666';
          case 'guarantee': return '#aaffaa';
          default: return '#888';
        }
      })
      .attr("stroke-width", d => Math.max(2, d.strength * 5))
      .attr("stroke-opacity", d => hoveredNode ? 
        (hoveredNode === d.source.id || hoveredNode === d.target.id ? 1 : 0.3) : 0.8)
      .style("filter", "url(#glow)")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        setSelectedLink(d);
        onNodeSelect({
          id: 'link',
          name: `${d.type.toUpperCase()}: ${d.source.id} → ${d.target.id}`,
          description: d.details,
          type: 'Ação',
          leader: `Força: ${Math.round(d.strength * 100)}%`
        });
      })
      .on("mouseover", (event, d) => {
        d3.select(event.target)
          .attr("stroke-width", Math.max(4, d.strength * 8))
          .attr("stroke-opacity", 1);
      })
      .on("mouseout", (event, d) => {
        d3.select(event.target)
          .attr("stroke-width", Math.max(2, d.strength * 5))
          .attr("stroke-opacity", hoveredNode ? 
            (hoveredNode === d.source.id || hoveredNode === d.target.id ? 1 : 0.3) : 0.8);
      });

    // Create link labels
    const linkLabels = g.append("g")
      .selectAll("text")
      .data(links)
      .join("text")
      .text(d => d.type.toUpperCase())
      .attr("font-size", d => Math.max(8, 10 * zoomLevel))
      .attr("fill", "#fff")
      .attr("text-anchor", "middle")
      .attr("dy", -5)
      .style("opacity", d => hoveredNode ? 
        (hoveredNode === d.source.id || hoveredNode === d.target.id ? 1 : 0.3) : 0.8)
      .style("pointer-events", "none");

    // Create nodes
    const node = g.append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", d => {
        const baseRadius = d.type === 'País' ? 25 : 20;
        return Math.max(baseRadius, baseRadius * zoomLevel * 0.8);
      })
      .attr("fill", d => d.color)
      .attr("stroke", d => {
        if (selectedNode?.id === d.id) return "#fff";
        if (hoveredNode === d.id) return "#ffff00";
        return "#333";
      })
      .attr("stroke-width", d => {
        if (selectedNode?.id === d.id) return 3;
        if (hoveredNode === d.id) return 4;
        return 1;
      })
      .style("filter", "url(#glow)")
      .style("cursor", "pointer")
      .style("opacity", d => hoveredNode ? 
        (getConnectedNodes(hoveredNode, links).has(d.id) ? 1 : 0.4) : 1)
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
        setSelectedLink(null);
      });

    // Add node labels
    const nodeLabels = g.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text(d => d.name)
      .attr("font-size", d => Math.max(10, 12 * zoomLevel))
      .attr("font-weight", "bold")
      .attr("fill", "#fff")
      .attr("text-anchor", "middle")
      .attr("dy", 35)
      .style("opacity", d => hoveredNode ? 
        (getConnectedNodes(hoveredNode, links).has(d.id) ? 1 : 0.4) : 1)
      .style("pointer-events", "none");

    // Add leader labels (only show at higher zoom levels)
    const leaderLabels = g.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text(d => d.leader)
      .attr("font-size", d => Math.max(8, 10 * zoomLevel))
      .attr("fill", "#ccc")
      .attr("text-anchor", "middle")
      .attr("dy", 48)
      .style("opacity", d => {
        const baseOpacity = zoomLevel > 1.2 ? 0.8 : 0.3;
        return hoveredNode ? 
          (getConnectedNodes(hoveredNode, links).has(d.id) ? baseOpacity : baseOpacity * 0.5) : baseOpacity;
      })
      .style("pointer-events", "none");

    // Add additional info at high zoom levels
    const detailLabels = g.append("g")
      .selectAll("text")
      .data(nodes.filter(d => d.type === 'País'))
      .join("text")
      .text(d => `Risco: ${zoomLevel > 2 ? 'Alto' : ''}`)
      .attr("font-size", "8px")
      .attr("fill", "#ff6666")
      .attr("text-anchor", "middle")
      .attr("dy", 60)
      .style("opacity", zoomLevel > 2 ? 0.7 : 0)
      .style("pointer-events", "none");

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

      detailLabels
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

  }, [currentEvent, nodes, selectedNode, onNodeSelect, hoveredNode, zoomLevel]);

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
