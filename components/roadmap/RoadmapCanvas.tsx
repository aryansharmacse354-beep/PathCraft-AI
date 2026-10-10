"use client";

import React, { useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeMouseHandler,
  BackgroundVariant
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { MilestoneNode } from "./MilestoneNode";
import { Milestone, RoadmapData } from "../../lib/types/roadmap";
import { getLayoutedElements } from "../../lib/utils/layout";

interface RoadmapCanvasProps {
  roadmap: RoadmapData;
  onSelectMilestone: (milestone: Milestone) => void;
}

export function RoadmapCanvas({
  roadmap,
  onSelectMilestone
}: RoadmapCanvasProps) {
  const nodeTypes = useMemo(() => ({ milestoneNode: MilestoneNode }), []);

  // Compute Dagre auto-layout
  const { initialNodes, initialEdges } = useMemo(() => {
    const rfEdges: Edge[] = roadmap.edges.map((edge) => {
      const targetNode = roadmap.nodes.find((n) => n.id === edge.target);
      const isTargetInProgress = targetNode?.status === "in_progress";
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: edge.animated ?? true,
        style: isTargetInProgress
          ? { stroke: "#F59E0B", strokeWidth: 2.5, filter: "drop-shadow(0 0 6px rgba(245,158,11,0.6))" }
          : { stroke: "#38bdf8", strokeWidth: 2 }
      };
    });

    const layouted = getLayoutedElements(roadmap.nodes, rfEdges, "TB");
    return { initialNodes: layouted.nodes, initialEdges: layouted.edges };
  }, [roadmap]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state whenever roadmap updates
  React.useEffect(() => {
    const rfEdges: Edge[] = roadmap.edges.map((edge) => {
      const targetNode = roadmap.nodes.find((n) => n.id === edge.target);
      const isTargetInProgress = targetNode?.status === "in_progress";
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: edge.animated ?? true,
        style: isTargetInProgress
          ? { stroke: "#F59E0B", strokeWidth: 2.5, filter: "drop-shadow(0 0 6px rgba(245,158,11,0.6))" }
          : { stroke: "#38bdf8", strokeWidth: 2 }
      };
    });

    const layouted = getLayoutedElements(roadmap.nodes, rfEdges, "TB");
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
  }, [roadmap, setNodes, setEdges]);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      const milestone = roadmap.nodes.find((m) => m.id === node.id);
      if (milestone) {
        onSelectMilestone(milestone);
      }
    },
    [roadmap.nodes, onSelectMilestone]
  );

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#0B0F19]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.8}
        defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#1e293b"
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => {
            const m = n.data as unknown as Milestone;
            if (m.status === "completed" || m.status === "known") return "#10B981";
            if (m.status === "available") return "#06B6D4";
            if (m.status === "in_progress") return "#F59E0B";
            return "#334155";
          }}
          maskColor="rgba(11, 15, 25, 0.7)"
          className="hidden md:block"
        />
      </ReactFlow>
    </div>
  );
}
