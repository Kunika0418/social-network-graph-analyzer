import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { User, Friendship, D3Node, D3Link, Community } from '@/types/graph';

interface GraphVisualizationProps {
  users: User[];
  friendships: Friendship[];
  communities?: Community[];
  highlightedPath?: string[];
  onNodeClick?: (userId: string) => void;
  width?: number;
  height?: number;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  users,
  friendships,
  communities = [],
  highlightedPath = [],
  onNodeClick,
  width = 800,
  height = 600
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || users.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create community color map
    const communityColorMap = new Map<string, string>();
    communities.forEach(community => {
      community.users.forEach(userId => {
        communityColorMap.set(userId, community.color);
      });
    });

    // Prepare data
    const nodes: D3Node[] = users.map(user => ({
      ...user,
      x: user.x || Math.random() * width,
      y: user.y || Math.random() * height
    }));

    const links: D3Link[] = friendships.map(friendship => ({
      source: friendship.source,
      target: friendship.target
    }));

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Create container group
    const container = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create links
    const link = container.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', (d) => {
        const sourceId = typeof d.source === 'string' ? d.source : d.source.id;
        const targetId = typeof d.target === 'string' ? d.target : d.target.id;
        
        // Highlight path edges
        if (highlightedPath.length > 1) {
          for (let i = 0; i < highlightedPath.length - 1; i++) {
            if ((highlightedPath[i] === sourceId && highlightedPath[i + 1] === targetId) ||
                (highlightedPath[i] === targetId && highlightedPath[i + 1] === sourceId)) {
              return '#FF6B6B';
            }
          }
        }
        return '#999';
      })
      .attr('stroke-width', (d) => {
        const sourceId = typeof d.source === 'string' ? d.source : d.source.id;
        const targetId = typeof d.target === 'string' ? d.target : d.target.id;
        
        // Thicker lines for highlighted path
        if (highlightedPath.length > 1) {
          for (let i = 0; i < highlightedPath.length - 1; i++) {
            if ((highlightedPath[i] === sourceId && highlightedPath[i + 1] === targetId) ||
                (highlightedPath[i] === targetId && highlightedPath[i + 1] === sourceId)) {
              return 4;
            }
          }
        }
        return 2;
      })
      .attr('opacity', 0.8);

    // Create nodes
    const node = container.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', (d) => highlightedPath.includes(d.id) ? 12 : 8)
      .attr('fill', (d) => {
        if (highlightedPath.includes(d.id)) {
          return '#FF6B6B';
        }
        return communityColorMap.get(d.id) || '#4ECDC4';
      })
      .attr('stroke', (d) => selectedNode === d.id ? '#000' : '#fff')
      .attr('stroke-width', (d) => selectedNode === d.id ? 3 : 2)
      .style('cursor', 'pointer')
      .call(d3.drag<SVGCircleElement, D3Node>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d.id);
        onNodeClick?.(d.id);
      });

    // Add labels
    const labels = container.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text(d => d.name)
      .attr('font-size', 12)
      .attr('font-weight', (d) => highlightedPath.includes(d.id) ? 'bold' : 'normal')
      .attr('text-anchor', 'middle')
      .attr('dy', -15)
      .attr('fill', '#333')
      .style('pointer-events', 'none');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      labels
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    // Clear selection on background click
    svg.on('click', () => {
      setSelectedNode(null);
    });

    return () => {
      simulation.stop();
    };
  }, [users, friendships, communities, highlightedPath, selectedNode, width, height]);

  return (
    <div className="relative bg-white rounded-lg border shadow-sm">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border rounded-lg"
      />
      {users.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          No users to display. Add some users to get started!
        </div>
      )}
    </div>
  );
};

export default GraphVisualization;