"use client";

import { ConnectionType } from "@/types";
import React from "react";
import { EdgeLabelRenderer, EdgeProps, getBezierPath } from "reactflow";

interface CustomEdgeData {
  type: ConnectionType;
  sourceBlockId: number;
  targetBlockId: number;
  sourceGroupId: number;
  targetGroupId: number;
  onDelete?: (edgeId: string) => void;
  onToggleType?: (edgeId: string) => void;
}

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}: EdgeProps<CustomEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = () => {
    const shouldDelete = window.confirm(
      `Delete this ${data?.type || "connection"}?\n\nFrom Block ${
        data?.sourceBlockId
      } (Group ${data?.sourceGroupId})\nTo Block ${
        data?.targetBlockId
      } (Group ${data?.targetGroupId})`
    );

    if (shouldDelete && data?.onDelete) {
      data.onDelete(id);
    }
  };

  const toggleConnectionType = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data?.onToggleType) {
      data.onToggleType(id);
    }
  };

  const connectionColor = data?.type === "referTo" ? "#3b82f6" : "#f97316";
  const connectionLabel = data?.type === "referTo" ? "Refer" : "Skip";

  return (
    <>
      <path
        id={id}
        style={{ ...style, stroke: connectionColor }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 10,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg px-2 py-1 shadow-sm">
            <button
              className={`text-xs px-2 py-1 rounded ${
                data?.type === "referTo"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-orange-100 text-orange-700"
              } hover:opacity-80 transition-opacity`}
              onClick={toggleConnectionType}
              title={`Click to change to ${
                data?.type === "referTo" ? "Skip" : "ReferTo"
              }`}
            >
              {connectionLabel}
            </button>
            <button
              className="text-xs px-1 py-1 text-red-600 hover:bg-red-50 rounded"
              onClick={onEdgeClick}
              title="Delete connection"
            >
              ✕
            </button>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
