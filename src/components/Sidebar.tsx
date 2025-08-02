"use client";

import { BlockType, FormData, Group } from "@/types";
import { Edit3, Hash, Plus, Settings, Users, X } from "lucide-react";
import React, { useState } from "react";
import { Node } from "reactflow";

interface SidebarProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onAddNode: (data: FormData) => void;
  onUpdateNode: (data: FormData, nodeId: string) => void;
  selectedGroupId?: number;
  selectedNode: Node | null;
  groups: Group[];
  onClearSelection: () => void;
}

export default function Sidebar({
  formData,
  setFormData,
  onAddNode,
  onUpdateNode,
  selectedGroupId,
  selectedNode,
  groups,
  onClearSelection,
}: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const selectedGroup = groups.find((g) => g.group === selectedGroupId);
  const isNumberValidation = selectedGroup?.type === "numbervalidation";
  const isEditing = !!selectedNode;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) {
      alert("Please select a group first");
      return;
    }
    if (!formData.questionSlug.trim() || !formData.questionAlias.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    if (isEditing && selectedNode) {
      onUpdateNode(formData, selectedNode.id);
    } else {
      onAddNode(formData);
      // Reset form only for new nodes
      setFormData({
        questionSlug: "",
        questionAlias: "",
        blockType: "textInput",
        groupId: selectedGroupId,
        required: false,
        options: [],
        validationRegex: "",
        validationMin: undefined,
        validationMax: undefined,
        enableSkip: false,
        skipToId: undefined,
        skipToGroup: undefined,
        enableReferTo: !isNumberValidation,
        referToId: undefined,
        referToGroup: undefined,
      });
    }
  };

  const handleReset = () => {
    setFormData({
      questionSlug: "",
      questionAlias: "",
      blockType: "textInput",
      groupId: selectedGroupId || 1,
      required: false,
      options: [],
      validationRegex: "",
      validationMin: undefined,
      validationMax: undefined,
      enableSkip: false,
      skipToId: undefined,
      skipToGroup: undefined,
      enableReferTo: !isNumberValidation,
      referToId: undefined,
      referToGroup: undefined,
    });
    onClearSelection();
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ""],
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const blockTypes: { value: BlockType; label: string; emoji: string }[] = [
    { value: "textInput", label: "Text Input", emoji: "📝" },
    { value: "dropdown", label: "Dropdown", emoji: "📋" },
    { value: "multipleChoice", label: "Multiple Choice", emoji: "✅" },
    { value: "date", label: "Date", emoji: "📅" },
    { value: "number", label: "Number", emoji: "🔢" },
    { value: "email", label: "Email", emoji: "📧" },
    { value: "phone", label: "Phone", emoji: "📞" },
    { value: "textarea", label: "Textarea", emoji: "📄" },
    { value: "checkbox", label: "Checkbox", emoji: "☑️" },
    { value: "radio", label: "Radio", emoji: "🔘" },
    { value: "file", label: "File Upload", emoji: "📎" },
    { value: "product", label: "Product", emoji: "🛍️" },
    { value: "contactNo", label: "Contact Number", emoji: "📲" },
    { value: "terms", label: "Terms & Conditions", emoji: "📋" },
    { value: "otp", label: "OTP", emoji: "🔐" },
    { value: "video", label: "Video", emoji: "🎥" },
    { value: "giveable", label: "Giveable", emoji: "🎁" },
    { value: "interactive_av", label: "Interactive AV", emoji: "🎮" },
    { value: "audio_start", label: "Audio Start", emoji: "🎤" },
    { value: "audio_end", label: "Audio End", emoji: "🔇" },
  ];

  if (!isExpanded) {
    return (
      <div className="w-12 bg-white border-r border-gray-200 p-2">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-8 h-8 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          {isEditing ? (
            <>
              <Edit3 className="w-5 h-5 text-orange-500" />
              Edit Block
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Add Block
            </>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              onClick={onClearSelection}
              className="text-gray-500 hover:text-gray-700 p-1 rounded"
              title="Cancel editing"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ←
          </button>
        </div>
      </div>

      {/* Editing info */}
      {isEditing && selectedNode && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Edit3 className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-900">
              Editing Block {selectedNode.data?.id}
            </span>
          </div>
          <div className="text-xs text-orange-700">
            Click outside or press the X to cancel editing
          </div>
        </div>
      )}

      {/* Group Info */}
      {selectedGroup && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            {selectedGroup.type === "referring" ? (
              <Users className="w-4 h-4 text-blue-500" />
            ) : (
              <Hash className="w-4 h-4 text-green-500" />
            )}
            <span className="text-sm font-medium text-gray-900">
              Group {selectedGroup.group}: {selectedGroup.title || "Untitled"}
            </span>
          </div>
          <div className="text-xs text-gray-600">
            Type: {selectedGroup.type}
          </div>
        </div>
      )}

      {!selectedGroupId && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Please select or create a group first to add blocks.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Question Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Slug *
          </label>
          <input
            type="text"
            value={formData.questionSlug}
            onChange={(e) =>
              setFormData({ ...formData, questionSlug: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            placeholder="Enter question text"
            required
            disabled={!selectedGroupId}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Alias *
          </label>
          <input
            type="text"
            value={formData.questionAlias}
            onChange={(e) =>
              setFormData({ ...formData, questionAlias: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            placeholder="Enter field alias"
            required
            disabled={!selectedGroupId}
          />
        </div>

        {/* Block Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Block Type
          </label>
          <select
            value={formData.blockType}
            onChange={(e) =>
              setFormData({
                ...formData,
                blockType: e.target.value as BlockType,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            disabled={!selectedGroupId}
          >
            {blockTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.emoji} {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Required Field */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={formData.required}
              onChange={(e) =>
                setFormData({ ...formData, required: e.target.checked })
              }
              className="rounded"
              disabled={!selectedGroupId}
            />
            Required Field
          </label>
        </div>

        {/* Options for dropdown/multipleChoice */}
        {(formData.blockType === "dropdown" ||
          formData.blockType === "multipleChoice" ||
          formData.blockType === "radio") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options
            </label>
            <div className="space-y-2">
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    placeholder={`Option ${index + 1}`}
                    disabled={!selectedGroupId}
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    disabled={!selectedGroupId}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addOption}
                className="w-full px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                disabled={!selectedGroupId}
              >
                + Add Option
              </button>
            </div>
          </div>
        )}

        {/* Validation Rules */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Validation Regex
          </label>
          <input
            type="text"
            value={formData.validationRegex || ""}
            onChange={(e) =>
              setFormData({ ...formData, validationRegex: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            placeholder="Enter regex pattern"
            disabled={!selectedGroupId}
          />
        </div>

        {(formData.blockType === "number" || formData.blockType === "date") && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Value
              </label>
              <input
                type="number"
                value={formData.validationMin || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    validationMin: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                disabled={!selectedGroupId}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Value
              </label>
              <input
                type="number"
                value={formData.validationMax || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    validationMax: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                disabled={!selectedGroupId}
              />
            </div>
          </div>
        )}

        {/* Skip Logic */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={formData.enableSkip}
              onChange={(e) =>
                setFormData({ ...formData, enableSkip: e.target.checked })
              }
              className="rounded"
              disabled={!selectedGroupId}
            />
            Enable Skip Logic
          </label>
        </div>

        {formData.enableSkip && (
          <div className="pl-6 space-y-3 border-l-2 border-orange-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skip to Block ID
              </label>
              <input
                type="number"
                value={formData.skipToId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    skipToId: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Block ID to skip to"
                disabled={!selectedGroupId}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skip to Group
              </label>
              <input
                type="number"
                value={formData.skipToGroup || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    skipToGroup: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Group number to skip to"
                disabled={!selectedGroupId}
              />
            </div>
          </div>
        )}

        {/* ReferTo Logic (only for referring groups) */}
        {selectedGroup?.type === "referring" && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={formData.enableReferTo}
                onChange={(e) =>
                  setFormData({ ...formData, enableReferTo: e.target.checked })
                }
                className="rounded"
                disabled={!selectedGroupId}
              />
              Enable ReferTo Logic
            </label>
          </div>
        )}

        {formData.enableReferTo && selectedGroup?.type === "referring" && (
          <div className="pl-6 space-y-3 border-l-2 border-blue-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ReferTo Block ID
              </label>
              <input
                type="number"
                value={formData.referToId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    referToId: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Block ID to refer to"
                disabled={!selectedGroupId}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ReferTo Group
              </label>
              <input
                type="number"
                value={formData.referToGroup || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    referToGroup: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Group number to refer to"
                disabled={!selectedGroupId}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            className={`flex-1 py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 ${
              isEditing
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            disabled={!selectedGroupId}
          >
            {isEditing ? "Update Block" : "Add Block"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100"
            disabled={!selectedGroupId}
          >
            {isEditing ? "Cancel" : "Reset"}
          </button>
        </div>
      </form>
    </div>
  );
}
