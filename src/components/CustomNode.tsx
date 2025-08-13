"use client";

import { Block, GroupType } from "@/types";
import {
  ArrowRight,
  CheckCircle,
  Hash,
  SkipForward,
  Star,
  Users,
} from "lucide-react";
import { memo } from "react";
import { Handle, Position } from "reactflow";

interface CustomNodeProps {
  data: Block & {
    groupId: number;
    groupType: GroupType;
    position: { x: number; y: number };
  };
  selected?: boolean;
}

export const CustomNode = memo(({ data, selected }: CustomNodeProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "textInput":
        return "📝";
      case "dropdown":
        return "📋";
      case "multipleChoice":
        return "☑️";
      case "contactNo":
        return "📞";
      case "date":
        return "📅";
      case "product":
        return "📦";
      case "terms":
        return "📜";
      case "otp":
        return "🔐";
      case "video":
        return "🎥";
      case "giveable":
        return "🎁";
      case "interactive_av":
        return "📱";
      case "audio_start":
        return "🎤";
      case "audio_end":
        return "🔇";
      case "number":
        return "🔢";
      case "email":
        return "📧";
      case "phone":
        return "📞";
      case "textarea":
        return "📄";
      case "checkbox":
        return "☑️";
      case "radio":
        return "🔘";
      case "file":
        return "📎";
      default:
        return "❓";
    }
  };

  const getGroupTypeColor = (groupType: GroupType) => {
    return groupType === "referring"
      ? "bg-blue-50 border-blue-300"
      : "bg-green-50 border-green-300";
  };

  const getGroupIcon = (groupType: GroupType) => {
    return groupType === "referring" ? (
      <Users className="w-3 h-3 text-blue-600" />
    ) : (
      <Hash className="w-3 h-3 text-green-600" />
    );
  };

  return (
    <div
      className={`min-w-48 rounded-lg border-2 shadow-md ${getGroupTypeColor(
        data.groupType
      )} ${selected ? "ring-2 ring-blue-500" : ""}`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="p-3">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xl">{getIcon(data.type)}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-800 truncate">
              {data.question.slug}
            </h3>
            <p className="text-xs text-gray-600 truncate">
              {data.question.alias}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span className="bg-white px-2 py-1 rounded border">
            Block {data.id}
          </span>
          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border">
            {getGroupIcon(data.groupType)}
            <span>Group {data.groupId}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mb-2">
          {data.required && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
              <Star className="w-3 h-3" />
              Required
            </span>
          )}

          {data.validations && Object.keys(data.validations).length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
              <CheckCircle className="w-3 h-3" />
              Validation
            </span>
          )}

          {data.skip && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
              <SkipForward className="w-3 h-3" />
              Skip
            </span>
          )}

          {data.referTo && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              <ArrowRight className="w-3 h-3" />
              ReferTo
            </span>
          )}
        </div>

        {data.options && data.options.length > 0 && (
          <div className="mb-2">
            <p className="text-xs text-gray-600 mb-1">Options:</p>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {data.options.slice(0, 3).map((option, index) => (
                <div
                  key={index}
                  className="text-xs bg-white px-2 py-1 rounded border truncate"
                >
                  {option.value}
                </div>
              ))}
              {data.options.length > 3 && (
                <div className="text-xs text-gray-500 px-2">
                  +{data.options.length - 3} more...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reference info */}
        {data.referTo && (
          <div className="text-xs text-blue-600 mt-2">
            → Block {data.referTo.id} (Group {data.referTo.group_no})
          </div>
        )}

        {data.skip && (
          <div className="text-xs text-orange-600 mt-1">
            Skip → Block {data.skip.id} (Group {data.skip.group_no})
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
