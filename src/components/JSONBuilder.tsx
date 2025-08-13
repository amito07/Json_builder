"use client";

import React, { useCallback, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";

import {
  Block,
  ConnectionData,
  ConnectionType,
  FormData,
  Group,
  GroupFormData,
  GroupJSON,
  IDCounters,
  Option,
} from "@/types";
import { Download, Eye, EyeOff, Folder, Plus } from "lucide-react";
import { CustomEdge } from "./CustomEdge";
import { CustomNode } from "./CustomNode";
import GroupSidebar from "./GroupSidebar";
import { JSONPreview } from "./JSONPreview";
import Sidebar from "./Sidebar";

const nodeTypes = {
  customNode: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

export function JSONBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showGroupSidebar, setShowGroupSidebar] = useState(false);
  const [showJSONPreview, setShowJSONPreview] = useState(false);
  const [idCounters, setIdCounters] = useState<IDCounters>({
    blockId: 1,
    groupId: 1,
  });
  const [connections, setConnections] = useState<ConnectionData[]>([]);

  const [formData, setFormData] = useState<FormData>({
    questionSlug: "",
    questionAlias: "",
    blockType: "textInput",
    groupId: selectedGroupId || 1,
    required: false,
    options: [],
    validationMin: undefined,
    validationMax: undefined,
    validationTerms: [],
    enableSkip: false,
    skipToId: undefined,
    skipToGroup: undefined,
    enableReferTo: true,
    referToId: undefined,
    referToGroup: undefined,
  });

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      // Extract block IDs from node IDs
      const sourceBlockId = parseInt(params.source.replace("block-", ""));
      const targetBlockId = parseInt(params.target.replace("block-", ""));

      // Find source and target nodes to get group information
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      if (!sourceNode || !targetNode) return;

      const sourceGroupId = sourceNode.data?.groupId;
      const targetGroupId = targetNode.data?.groupId;

      // Check for circular reference (prevent A -> B -> A)
      const wouldCreateCircular = (
        sourceId: number,
        targetId: number
      ): boolean => {
        // Check if target already connects back to source through any chain
        const findPath = (currentId: number, visited: Set<number>): boolean => {
          if (visited.has(currentId)) return false;
          if (currentId === sourceId) return true;

          visited.add(currentId);

          // Check all connections from current node
          for (const conn of connections) {
            if (conn.sourceBlockId === currentId) {
              if (findPath(conn.targetBlockId, new Set(visited))) {
                return true;
              }
            }
          }
          return false;
        };

        return findPath(targetId, new Set());
      };

      if (wouldCreateCircular(sourceBlockId, targetBlockId)) {
        alert(
          "Cannot create connection: This would create a circular reference!"
        );
        return;
      }

      // Create visual edge
      const newEdge: Edge = {
        id: `${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        type: "custom",
        data: {
          type: "referTo" as ConnectionType,
          sourceBlockId,
          targetBlockId,
          sourceGroupId,
          targetGroupId,
          onDelete: handleEdgeDelete,
          onToggleType: handleEdgeToggle,
        },
        style: { stroke: "#3b82f6", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" },
      };

      setEdges((eds) => [...eds, newEdge]);

      // Add to connections state
      const newConnection: ConnectionData = {
        type: "referTo",
        sourceBlockId,
        targetBlockId,
        sourceGroupId,
        targetGroupId,
      };

      setConnections((prev) => [...prev, newConnection]);

      // Update the source block with referTo relationship
      setGroups((prev) =>
        prev.map((group) => ({
          ...group,
          blocks: group.blocks.map((block) =>
            block.id === sourceBlockId
              ? {
                  ...block,
                  referTo: {
                    id: targetBlockId,
                    group_no: targetGroupId,
                  },
                }
              : block
          ),
        }))
      );

      // Update the visual node
      setNodes((prev) =>
        prev.map((node) =>
          node.id === params.source
            ? {
                ...node,
                data: {
                  ...node.data,
                  referTo: {
                    id: targetBlockId,
                    group_no: targetGroupId,
                  },
                },
              }
            : node
        )
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setEdges, nodes, connections, setGroups, setNodes]
  );

  const createGroup = useCallback(
    (groupData: GroupFormData) => {
      const newGroup: Group = {
        type: groupData.type,
        group: idCounters.groupId,
        title: groupData.title,
        blocks: [],
        jumping_logic:
          groupData.enableJumpingLogic &&
          groupData.jumpingLogicId &&
          groupData.jumpingLogicGroup
            ? [
                {
                  id: groupData.jumpingLogicId,
                  group_no: groupData.jumpingLogicGroup,
                  conditions: [],
                },
              ]
            : [],
      };

      setGroups((prev) => [...prev, newGroup]);
      setSelectedGroupId(newGroup.group);
      setIdCounters((prev) => ({ ...prev, groupId: prev.groupId + 1 }));

      // Update form data group ID
      setFormData((prev) => ({
        ...prev,
        groupId: newGroup.group,
        enableReferTo: newGroup.type === "referring",
      }));
    },
    [idCounters.groupId]
  );

  const handleEdgeDelete = useCallback(
    (edgeId: string) => {
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge?.data) return;

      // Remove from edges
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));

      // Remove from connections state
      const edgeData = edge.data;
      setConnections((prev) =>
        prev.filter(
          (conn) =>
            !(
              conn.sourceBlockId === edgeData.sourceBlockId &&
              conn.targetBlockId === edgeData.targetBlockId
            )
        )
      );

      // Remove referTo/skip from the source block
      setGroups((prev) =>
        prev.map((group) => ({
          ...group,
          blocks: group.blocks.map((block) => {
            if (block.id === edgeData.sourceBlockId) {
              const updatedBlock = { ...block };
              if (edgeData.type === "referTo") {
                delete updatedBlock.referTo;
              } else if (edgeData.type === "skip") {
                delete updatedBlock.skip;
              }
              return updatedBlock;
            }
            return block;
          }),
        }))
      );

      // Update visual node
      setNodes((prev) =>
        prev.map((node) => {
          if (node.data?.id === edgeData.sourceBlockId) {
            const updatedData = { ...node.data };
            if (edgeData.type === "referTo") {
              delete updatedData.referTo;
            } else if (edgeData.type === "skip") {
              delete updatedData.skip;
            }
            return { ...node, data: updatedData };
          }
          return node;
        })
      );
    },
    [edges, setEdges, setConnections, setGroups, setNodes]
  );

  const handleEdgeToggle = useCallback(
    (edgeId: string) => {
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge?.data) return;

      const edgeData = edge.data;
      const newType: ConnectionType =
        edgeData.type === "referTo" ? "skip" : "referTo";
      const newColor = newType === "referTo" ? "#3b82f6" : "#f97316";

      // Update edge visuals
      setEdges((eds) =>
        eds.map((e) =>
          e.id === edgeId
            ? {
                ...e,
                style: { stroke: newColor, strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: newColor },
                data: { ...e.data, type: newType },
              }
            : e
        )
      );

      // Update connections state
      setConnections((prev) =>
        prev.map((conn) =>
          conn.sourceBlockId === edgeData.sourceBlockId &&
          conn.targetBlockId === edgeData.targetBlockId
            ? { ...conn, type: newType }
            : conn
        )
      );

      // Update the source block
      setGroups((prev) =>
        prev.map((group) => ({
          ...group,
          blocks: group.blocks.map((block) => {
            if (block.id === edgeData.sourceBlockId) {
              const updatedBlock = { ...block };

              // Remove old reference
              if (edgeData.type === "referTo") {
                delete updatedBlock.referTo;
              } else {
                delete updatedBlock.skip;
              }

              // Add new reference
              if (newType === "referTo") {
                updatedBlock.referTo = {
                  id: edgeData.targetBlockId,
                  group_no: edgeData.targetGroupId,
                };
              } else {
                updatedBlock.skip = {
                  id: edgeData.targetBlockId,
                  group_no: edgeData.targetGroupId,
                };
              }

              return updatedBlock;
            }
            return block;
          }),
        }))
      );

      // Update visual node
      setNodes((prev) =>
        prev.map((node) => {
          if (node.data?.id === edgeData.sourceBlockId) {
            const updatedData = { ...node.data };

            // Remove old reference
            if (edgeData.type === "referTo") {
              delete updatedData.referTo;
            } else {
              delete updatedData.skip;
            }

            // Add new reference
            if (newType === "referTo") {
              updatedData.referTo = {
                id: edgeData.targetBlockId,
                group_no: edgeData.targetGroupId,
              };
            } else {
              updatedData.skip = {
                id: edgeData.targetBlockId,
                group_no: edgeData.targetGroupId,
              };
            }

            return { ...node, data: updatedData };
          }
          return node;
        })
      );
    },
    [edges, setEdges, setConnections, setGroups, setNodes]
  );

  const createNode = useCallback(
    (data: FormData) => {
      const selectedGroup = groups.find((g) => g.group === data.groupId);
      if (!selectedGroup) {
        alert("Please select a valid group");
        return;
      }

      const newBlock: Block = {
        id: idCounters.blockId,
        type: data.blockType,
        question: {
          slug: data.questionSlug,
          alias: data.questionAlias,
        },
        options:
          data.options.length > 0 && data.options[0] !== ""
            ? data.options.map((opt) => ({ value: opt }))
            : null,
        required: data.required ? "true" : undefined,
        validations: {
          ...(data.validationMin !== undefined && { min: data.validationMin }),
          ...(data.validationMax !== undefined && { max: data.validationMax }),
          ...(data.validationTerms &&
            data.validationTerms.length > 0 && { terms: data.validationTerms }),
          ...(data.blockType === "otp" && {
            bypass: data.validationBypass,
            device: data.validationDevice,
            server: data.validationServer,
          }),
        },
        ...(data.enableSkip &&
          data.skipToId !== undefined &&
          data.skipToGroup !== undefined && {
            skip: {
              id: data.skipToId,
              group_no: data.skipToGroup,
            },
          }),
        ...(data.enableReferTo &&
          data.referToId !== undefined &&
          data.referToGroup !== undefined && {
            referTo: {
              id: data.referToId,
              group_no: data.referToGroup,
            },
          }),
      };

      // Clean up validations if empty
      if (Object.keys(newBlock.validations || {}).length === 0) {
        delete newBlock.validations;
      }

      const position = {
        x: Math.random() * 300 + 50,
        y: Math.random() * 300 + 50,
      };

      const newNode: Node = {
        id: `block-${newBlock.id}`,
        type: "customNode",
        position,
        data: {
          ...newBlock,
          groupId: data.groupId,
          groupType: selectedGroup.type,
          position,
        },
      };

      setNodes((nds) => nds.concat(newNode));

      // Update the group with the new block
      setGroups((prev) =>
        prev.map((group) =>
          group.group === data.groupId
            ? { ...group, blocks: [...group.blocks, newBlock] }
            : group
        )
      );

      setIdCounters((prev) => ({ ...prev, blockId: prev.blockId + 1 }));

      // Create visual edges for existing referTo/skip relationships
      setTimeout(() => {
        if (newBlock.referTo) {
          const targetNodeId = `block-${newBlock.referTo.id}`;
          const targetNode = nodes.find((n) => n.id === targetNodeId);
          if (targetNode) {
            const edge: Edge = {
              id: `${newNode.id}-${targetNodeId}`,
              source: newNode.id,
              target: targetNodeId,
              type: "custom",
              data: {
                type: "referTo" as ConnectionType,
                sourceBlockId: newBlock.id,
                targetBlockId: newBlock.referTo.id,
                sourceGroupId: data.groupId,
                targetGroupId: newBlock.referTo.group_no,
                onDelete: handleEdgeDelete,
                onToggleType: handleEdgeToggle,
              },
              style: { stroke: "#3b82f6", strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" },
            };
            setEdges((prev) => [...prev, edge]);
          }
        }

        if (newBlock.skip) {
          const targetNodeId = `block-${newBlock.skip.id}`;
          const targetNode = nodes.find((n) => n.id === targetNodeId);
          if (targetNode) {
            const edge: Edge = {
              id: `${newNode.id}-${targetNodeId}-skip`,
              source: newNode.id,
              target: targetNodeId,
              type: "custom",
              data: {
                type: "skip" as ConnectionType,
                sourceBlockId: newBlock.id,
                targetBlockId: newBlock.skip.id,
                sourceGroupId: data.groupId,
                targetGroupId: newBlock.skip.group_no,
                onDelete: handleEdgeDelete,
                onToggleType: handleEdgeToggle,
              },
              style: { stroke: "#f97316", strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#f97316" },
            };
            setEdges((prev) => [...prev, edge]);
          }
        }
      }, 100);
    },
    [
      groups,
      idCounters.blockId,
      setNodes,
      nodes,
      handleEdgeDelete,
      handleEdgeToggle,
      setEdges,
    ]
  );

  const updateNode = useCallback(
    (data: FormData, nodeId: string) => {
      const blockId = parseInt(nodeId.replace("block-", ""));
      const selectedGroup = groups.find((g) => g.group === data.groupId);
      if (!selectedGroup) {
        alert("Please select a valid group");
        return;
      }

      const updatedBlock: Block = {
        id: blockId,
        type: data.blockType,
        question: {
          slug: data.questionSlug,
          alias: data.questionAlias,
        },
        options:
          data.options.length > 0 && data.options[0] !== ""
            ? data.options.map((opt) => ({ value: opt }))
            : null,
        required: data.required ? "true" : undefined,
        validations: {
          ...(data.validationMin !== undefined && { min: data.validationMin }),
          ...(data.validationMax !== undefined && { max: data.validationMax }),
          ...(data.validationTerms &&
            data.validationTerms.length > 0 && { terms: data.validationTerms }),
          ...(data.blockType === "otp" && {
            bypass: data.validationBypass,
            device: data.validationDevice,
            server: data.validationServer,
          }),
        },
        ...(data.enableSkip &&
          data.skipToId !== undefined &&
          data.skipToGroup !== undefined && {
            skip: {
              id: data.skipToId,
              group_no: data.skipToGroup,
            },
          }),
        ...(data.enableReferTo &&
          data.referToId !== undefined &&
          data.referToGroup !== undefined && {
            referTo: {
              id: data.referToId,
              group_no: data.referToGroup,
            },
          }),
      };

      // Clean up validations if empty
      if (Object.keys(updatedBlock.validations || {}).length === 0) {
        delete updatedBlock.validations;
      }

      // Update the node
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...updatedBlock,
                  groupId: data.groupId,
                  groupType: selectedGroup.type,
                  position: node.position,
                },
              }
            : node
        )
      );

      // Update the group with the updated block
      setGroups((prev) =>
        prev.map((group) => ({
          ...group,
          blocks: group.blocks.map((block) =>
            block.id === blockId ? updatedBlock : block
          ),
        }))
      );

      // Clear selection after update
      setSelectedNode(null);
    },
    [groups, setNodes]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);

      // Populate form with node data
      const blockData = node.data;
      setFormData({
        questionSlug: blockData.question?.slug || "",
        questionAlias: blockData.question?.alias || "",
        blockType: blockData.type || "textInput",
        groupId: blockData.groupId || selectedGroupId || 1,
        required: blockData.required === "true",
        options: blockData.options
          ? blockData.options.map((opt: Option) => opt.value)
          : [],
        validationMin: blockData.validations?.min,
        validationMax: blockData.validations?.max,
        validationTerms: blockData.validations?.terms || [],
        validationBypass: blockData.validations?.bypass || false,
        validationDevice: blockData.validations?.device || false,
        validationServer: blockData.validations?.server || true,
        enableSkip: !!blockData.skip,
        skipToId: blockData.skip?.id,
        skipToGroup: blockData.skip?.group_no,
        enableReferTo: !!blockData.referTo,
        referToId: blockData.referTo?.id,
        referToGroup: blockData.referTo?.group_no,
      });

      setSelectedGroupId(blockData.groupId);
    },
    [selectedGroupId]
  );

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation();
      const shouldDelete = window.confirm(
        "Do you want to delete this connection?"
      );

      if (shouldDelete) {
        // Remove from edges
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));

        // Remove from connections state
        const edgeData = edge.data;
        if (edgeData) {
          setConnections((prev) =>
            prev.filter(
              (conn) =>
                !(
                  conn.sourceBlockId === edgeData.sourceBlockId &&
                  conn.targetBlockId === edgeData.targetBlockId
                )
            )
          );

          // Remove referTo/skip from the source block
          setGroups((prev) =>
            prev.map((group) => ({
              ...group,
              blocks: group.blocks.map((block) => {
                if (block.id === edgeData.sourceBlockId) {
                  const updatedBlock = { ...block };
                  if (edgeData.type === "referTo") {
                    delete updatedBlock.referTo;
                  } else if (edgeData.type === "skip") {
                    delete updatedBlock.skip;
                  }
                  return updatedBlock;
                }
                return block;
              }),
            }))
          );

          // Update visual node
          setNodes((prev) =>
            prev.map((node) => {
              if (node.data?.id === edgeData.sourceBlockId) {
                const updatedData = { ...node.data };
                if (edgeData.type === "referTo") {
                  delete updatedData.referTo;
                } else if (edgeData.type === "skip") {
                  delete updatedData.skip;
                }
                return { ...node, data: updatedData };
              }
              return node;
            })
          );
        }
      }
    },
    [setEdges, setConnections, setGroups, setNodes]
  );

  // const deleteNode = useCallback(
  //   (nodeId: string) => {
  //     // Extract block ID from node ID
  //     const blockId = parseInt(nodeId.replace("block-", ""));

  //     // Remove node and its edges
  //     setNodes((nds) => nds.filter((node) => node.id !== nodeId));
  //     setEdges((eds) =>
  //       eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
  //     );

  //     // Remove connections involving this block
  //     setConnections((prev) =>
  //       prev.filter(
  //         (conn) =>
  //           conn.sourceBlockId !== blockId && conn.targetBlockId !== blockId
  //       )
  //     );

  //     // Remove block from groups
  //     setGroups((prev) =>
  //       prev.map((group) => ({
  //         ...group,
  //         blocks: group.blocks.filter((block) => block.id !== blockId),
  //       }))
  //     );
  //   },
  //   [setNodes, setEdges, setConnections]
  // );

  const generateJSON = useCallback((): GroupJSON[] => {
    return groups.map((group) => ({
      type: group.type,
      group: group.group.toString(),
      blocks: group.blocks,
      jumping_logic: group.jumping_logic,
    }));
  }, [groups]);

  const downloadJSON = useCallback(() => {
    const json = generateJSON();
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "form-structure.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generateJSON]);

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Main Sidebar */}
      <Sidebar
        formData={formData}
        setFormData={setFormData}
        onAddNode={createNode}
        onUpdateNode={updateNode}
        selectedGroupId={selectedGroupId}
        selectedNode={selectedNode}
        groups={groups}
        onClearSelection={() => {
          setSelectedNode(null);
          setFormData({
            questionSlug: "",
            questionAlias: "",
            blockType: "textInput",
            groupId: selectedGroupId || 1,
            required: false,
            options: [],
            validationMin: undefined,
            validationMax: undefined,
            validationTerms: [],
            validationBypass: false,
            validationDevice: false,
            validationServer: true,
            enableSkip: false,
            skipToId: undefined,
            skipToGroup: undefined,
            enableReferTo: true,
            referToId: undefined,
            referToGroup: undefined,
          });
        }}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">
              JSON Form Builder
            </h1>

            {/* Group Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Active Group:
              </label>
              <select
                value={selectedGroupId || ""}
                onChange={(e) => {
                  const groupId = e.target.value
                    ? parseInt(e.target.value)
                    : undefined;
                  setSelectedGroupId(groupId);
                  setFormData((prev) => ({
                    ...prev,
                    groupId: groupId || 1,
                    enableReferTo:
                      groups.find((g) => g.group === groupId)?.type ===
                      "referring",
                  }));
                }}
                className="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900"
              >
                <option value="">Select Group</option>
                {groups.map((group) => (
                  <option key={group.group} value={group.group}>
                    Group {group.group}: {group.title} ({group.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGroupSidebar(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Folder className="w-4 h-4" />
              Create Group
            </button>

            <button
              onClick={() => setShowJSONPreview(!showJSONPreview)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showJSONPreview ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {showJSONPreview ? "Hide" : "Show"} JSON
            </button>

            <button
              onClick={downloadJSON}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>

        {/* Groups Overview */}
        {groups.length > 0 && (
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex flex-wrap gap-2">
              {groups.map((group) => (
                <div
                  key={group.group}
                  onClick={() => {
                    setSelectedGroupId(group.group);
                    setFormData((prev) => ({
                      ...prev,
                      groupId: group.group,
                      enableReferTo: group.type === "referring",
                    }));
                  }}
                  className={`px-3 py-1 rounded-lg text-sm cursor-pointer transition-colors ${
                    selectedGroupId === group.group
                      ? "bg-blue-100 text-blue-800 border-2 border-blue-300"
                      : group.type === "referring"
                      ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                      : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {group.type === "referring" ? "👥" : "#"}
                    <span className="font-medium">Group {group.group}</span>
                  </div>
                  <div className="text-xs opacity-75">
                    {group.title} ({group.blocks.length} blocks)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* React Flow Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>

          {groups.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90">
              <div className="text-center">
                <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Groups Created
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first group to start building your form
                </p>
                <button
                  onClick={() => setShowGroupSidebar(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Create Group
                </button>
              </div>
            </div>
          )}

          {groups.length > 0 && nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90">
              <div className="text-center max-w-md">
                <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to Add Blocks
                </h3>
                <p className="text-gray-600 mb-4">
                  Select a group and use the sidebar to add blocks. Then drag
                  from block handles to create connections.
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    • <strong>Drag</strong> from block handles to create
                    connections
                  </p>
                  <p>
                    • <strong>Click</strong> blocks to edit them
                  </p>
                  <p>
                    • <strong>Click</strong> connection labels to edit or delete
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Group Sidebar */}
      {showGroupSidebar && (
        <GroupSidebar
          onCreateGroup={createGroup}
          onClose={() => setShowGroupSidebar(false)}
        />
      )}

      {/* JSON Preview */}
      {showJSONPreview && (
        <JSONPreview
          data={generateJSON()}
          onClose={() => setShowJSONPreview(false)}
        />
      )}
    </div>
  );
}
