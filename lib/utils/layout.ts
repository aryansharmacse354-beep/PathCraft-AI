import dagre from "dagre";
import { Node, Edge } from "@xyflow/react";
import { Milestone } from "../types/roadmap";

const NODE_WIDTH = 280;
const NODE_HEIGHT = 140;

/**
 * Computes hierarchical Dagre layout coordinates for React Flow nodes and edges
 */
export function getLayoutedElements(
  milestones: Milestone[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB"
): { nodes: Node[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 60,
    ranksep: 80,
    marginx: 40,
    marginy: 40
  });

  milestones.forEach((milestone) => {
    dagreGraph.setNode(milestone.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes: Node[] = milestones.map((milestone) => {
    const nodeWithPosition = dagreGraph.node(milestone.id);
    return {
      id: milestone.id,
      type: "milestoneNode",
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2
      },
      data: {
        ...milestone
      }
    };
  });

  return { nodes: layoutedNodes, edges };
}
