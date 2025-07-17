// src/components/NetworkVisualization.tsx

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// --- DEFINIÇÕES DE TIPO para segurança e clareza ---

// Estende a interface base de nó do D3 com nossas propriedades customizadas.
// O d3.SimulationNodeDatum adiciona propriedades como x, y, vx, vy, etc.
interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  leader?: string;
  type: string;
  color: string;
}

// Estende a interface de link do D3, especificando que a fonte e o alvo
// podem ser uma string (ID) ou um objeto NetworkNode completo.
interface NetworkLink extends d3.SimulationLinkDatum<NetworkNode> {
  source: string | NetworkNode;
  target: string | NetworkNode;
  type: string;
  strength: number;
}

// Define a estrutura esperada para o objeto de evento atual.
interface NetworkEvent {
  actions: {
    source: string;
    target: string;
    type: string;
    strength?: number;
  }[];
}

// Define a estrutura de uma única partícula para o sistema de canvas.
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

// Define as props que o componente espera receber do seu pai (e.g., App.tsx).
interface NetworkVisualizationProps {
  nodes: NetworkNode[];
  currentEvent: NetworkEvent | null;
  selectedNode: NetworkNode | null;
  onNodeSelect: (node: NetworkNode) => void;
}


// --- O COMPONENTE ---

const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({
  nodes,
  currentEvent,
  onNodeSelect,
  selectedNode,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    // Validação inicial para garantir que todos os elementos e dados necessários existam.
    if (!currentEvent || !nodes || !currentEvent.actions || !canvasRef.current || !svgRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const svg = d3.select(svgRef.current);

    svg.selectAll("*").remove(); // Limpa o SVG de renderizações anteriores.

    const width = 800;
    const height = 500;

    // Ajusta o tamanho do Canvas e do SVG.
    canvas.width = width;
    canvas.height = height;
    svg.attr("width", width).attr("height", height);

    if (!ctx) return; // Aborta se o contexto 2D do canvas não puder ser obtido.

    // --- PREPARAÇÃO DOS DADOS ---
    const linkData: NetworkLink[] = currentEvent.actions.map(action => ({
      source: action.source,
      target: action.target,
      type: action.type,
      strength: action.strength || 0.5,
    }));
    const nodeData: NetworkNode[] = nodes.map(d => ({ ...d }));

    // --- SISTEMA DE PARTÍCULAS ---
    let particles: Particle[] = [];

    const emitParticles = (node: NetworkNode) => {
      if (node.x === undefined || node.y === undefined) return;
      const particleCount = 2; // Número de partículas a serem emitidas por nó a cada "tick".
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const speed = Math.random() * 0.5 + 0.1;
        particles.push({
          x: node.x,
          y: node.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: Math.random() * 30 + 30, // Tempo de vida da partícula em frames.
          color: node.color,
        });
      }
    };

    // --- SIMULAÇÃO DE FORÇA D3 ---
    const simulation = d3.forceSimulation<NetworkNode>(nodeData)
      .force("link", d3.forceLink<NetworkNode, NetworkLink>(linkData).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    // --- RENDERIZAÇÃO SVG ---
    const g = svg.append("g");

    const link = g.append("g")
      .selectAll("line")
      .data(linkData)
      .join("line")
      .attr("stroke", d => {
        const colors = {
          'threat': '#ff4444', 'blockade': '#ff8800', 'alliance': '#4488ff',
          'agreement': '#44ff44', 'attack': '#ff0000', 'ultimatum': '#ff0044',
          'surveillance': '#9966ff', 'negotiation': '#66ffaa', 'support': '#ffaa66',
          'standoff': '#ff6666', 'guarantee': '#aaffaa'
        };
        return colors[d.type as keyof typeof colors] || '#888';
      })
      .attr("stroke-width", d => Math.max(2, d.strength * 4))
      .attr("stroke-opacity", 0.6);

    const node = g.append("g")
      .selectAll<SVGCircleElement, NetworkNode>("circle")
      .data(nodeData)
      .join("circle")
      .attr("r", d => (d.type === 'País' ? 25 : 20))
      .attr("fill", d => d.color || '#0066cc')
      .attr("stroke", d => (selectedNode?.id === d.id ? "#fff" : "#333"))
      .attr("stroke-width", d => (selectedNode?.id === d.id ? 3 : 2))
      .style("cursor", "pointer")
      .on("click", (event, d) => onNodeSelect(d));

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
      .style("pointer-events", "none");

    // --- LOOP DE ANIMAÇÃO DO CANVAS ---
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life--;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;

        ctx.globalAlpha = p.life / 60; // Desvanece a partícula conforme ela envelhece.
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Continua o loop de animação.
      animationFrameId.current = requestAnimationFrame(animate);
    };

    // --- MANIPULADOR DO "TICK" DA SIMULAÇÃO ---
    // Esta é a cola que une a simulação D3, o SVG e o Canvas.
    simulation.on("tick", () => {
      // 1. Atualiza a posição dos elementos SVG.
      link
        .attr("x1", d => (d.source as NetworkNode).x ?? 0)
        .attr("y1", d => (d.source as NetworkNode).y ?? 0)
        .attr("x2", d => (d.target as NetworkNode).x ?? 0)
        .attr("y2", d => (d.target as NetworkNode).y ?? 0);

      node
        .attr("cx", d => d.x ?? 0)
        .attr("cy", d => d.y ?? 0);

      labels
        .attr("x", d => d.x ?? 0)
        .attr("y", d => d.y ?? 0);

      // 2. Emite novas partículas a partir da posição atualizada de cada nó.
      nodeData.forEach(emitParticles);
    });

    // --- FUNCIONALIDADES DE DRAG E ZOOM ---
    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, NetworkNode, any>, d: NetworkNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, NetworkNode, any>, d: NetworkNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGCircleElement, NetworkNode, any>, d: NetworkNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    node.call(d3.drag<SVGCircleElement, NetworkNode>()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
    );
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString());
      });

    svg.call(zoom);

    // Inicia o loop de animação do canvas.
    animate();

    // --- LIMPEZA ---
    // Esta função é executada quando o componente é desmontado ou as dependências mudam.
    return () => {
      simulation.stop();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [currentEvent, nodes, selectedNode, onNodeSelect]);

  // --- JSX RENDER ---
  return (
    // Um container relativo para empilhar o canvas (fundo) e o svg (frente).
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 border border-blue-500/10 rounded bg-black/10"
      />
      <svg
        ref={svgRef}
        className="absolute top-0 left-0"
        style={{ maxWidth: '100%', height: '500px' }}
      />
    </div>
  );
};

export default NetworkVisualization;