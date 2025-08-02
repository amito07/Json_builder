"use client";

import { GroupFormData, GroupType } from "@/types";
import { Folder, Hash, Users } from "lucide-react";
import React, { useState } from "react";

interface GroupSidebarProps {
  onCreateGroup: (groupData: GroupFormData) => void;
  onClose: () => void;
}

export default function GroupSidebar({
  onCreateGroup,
  onClose,
}: GroupSidebarProps) {
  const [formData, setFormData] = useState<GroupFormData>({
    type: "referring",
    title: "",
    enableJumpingLogic: false,
    jumpingLogicId: undefined,
    jumpingLogicGroup: undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Please provide a group title");
      return;
    }
    onCreateGroup(formData);
    setFormData({
      type: "referring",
      title: "",
      enableJumpingLogic: false,
      jumpingLogicId: undefined,
      jumpingLogicGroup: undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setFormData({
      type: "referring",
      title: "",
      enableJumpingLogic: false,
      jumpingLogicId: undefined,
      jumpingLogicGroup: undefined,
    });
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Folder className="w-5 h-5" />
          Create Group
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Group Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Group Type *
          </label>
          <div className="grid grid-cols-1 gap-2">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="groupType"
                value="referring"
                checked={formData.type === "referring"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as GroupType,
                  })
                }
                className="mr-3"
              />
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="font-medium text-gray-900">Referring</div>
                  <div className="text-sm text-gray-500">
                    Blocks with referTo connections
                  </div>
                </div>
              </div>
            </label>

            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="groupType"
                value="numbervalidation"
                checked={formData.type === "numbervalidation"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as GroupType,
                  })
                }
                className="mr-3"
              />
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-green-500" />
                <div>
                  <div className="font-medium text-gray-900">
                    Number Validation
                  </div>
                  <div className="text-sm text-gray-500">
                    Sequential blocks without referTo
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Group Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Group Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            placeholder="Enter group title"
            required
          />
        </div>

        {/* Jumping Logic */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={formData.enableJumpingLogic}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  enableJumpingLogic: e.target.checked,
                })
              }
              className="rounded"
            />
            Enable Jumping Logic
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Allow this group to jump to another group
          </p>
        </div>

        {formData.enableJumpingLogic && (
          <div className="pl-6 space-y-3 border-l-2 border-blue-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jump to Block ID
              </label>
              <input
                type="number"
                value={formData.jumpingLogicId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jumpingLogicId: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Block ID to jump to"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jump to Group Number
              </label>
              <input
                type="number"
                value={formData.jumpingLogicGroup || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jumpingLogicGroup: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Group number to jump to"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Group
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Type Information */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Group Types:</h3>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-start gap-2">
            <Users className="w-3 h-3 text-blue-500 mt-0.5" />
            <div>
              <strong>Referring:</strong> Blocks can reference other blocks
              using referTo property. Allows complex flow control.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Hash className="w-3 h-3 text-green-500 mt-0.5" />
            <div>
              <strong>Number Validation:</strong> Sequential blocks without
              referTo. Purely linear flow.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
