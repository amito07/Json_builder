"use client";

import { BlockType, FormData, Group } from "@/types";
import { Edit3, Hash, Plus, Settings, Users, X } from "lucide-react";
import React, { useState } from "react";
import { Node } from "reactflow";

// Default terms and conditions content
const DEFAULT_TERMS = [
  "শর্তাবলী",
  "আমি নিশ্চিত করছি যে -",
  "",
  "১. আমার বয়স ১৮ বছরের অধিক এবং আমি স্বেচ্ছায়, সজ্ঞানে ও সুস্থ শরীরে, অন্যের বিনা প্ররোচনায় অত্র স্বাক্ষর প্রদান করিলাম",
  "২. আমি নিশ্চিত করিতেছি যে উল্লেখিত তথ্যগুলি সঠিক ও সত্য",
  "৩. আমি EU বা অন্য কোন বহিরাগত দেশের নাগরিক নই",
  "৪. আমি পরবর্তী তিন বছরের জন্য আমার তথ্য সংরক্ষণ/প্রক্রিয়া/স্থানান্তর করার জন্য অনুমোদন ও সম্মতি প্রদান করলাম",
  "৫. আমি স্ব-ইচ্ছায় তথ্যসমূহ প্রদান করলাম",
  "৬. আমি নিশ্চিত করিতেছি যে তথ্য প্রদানের ব্যাপারে আমাকে কোন ধরনের অর্থপ্রদান/অন্য কোনভাবে প্ররোচনা/প্রভাবিত করা হয়নি",
  "৭.  আমি নিশ্চিত করছি যে, প্রশিক্ষণ এবং ভবিষ্যৎ অনুসন্ধানের জন্য আমার কথোপকথন টি রেকর্ড করা যেতে পারে",
  "৮. আমি নিশ্চিত করিতেছি যে প্রদত্ত তথ্যের ব্যাপারে ভবিষ্যতে,  বাংলাদেশ আইন অনুযায়ী, কোনো আদালত বা কর্তৃপক্ষের সামনে কোন ধরনের আইনগত অভিযোগ মূলক কর্মকান্ড গ্রহণ করিব না",
  "৯. বর্তমান কথোপকথন বিষয়ে ভবিষ্যতে যোগাযোগের জন্য স্বেচ্ছায় অনুমতি প্রদান করছি।উপরোক্ত শর্তাবলী মেনে আমার তথ্য প্রদান করছি",
  "",
  "উপরোক্ত শর্তাবলী মেনে আমার তথ্য প্রদান করছি",
  "I Agree to Sign Digitally",
];

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

  const handleBlockTypeChange = (blockType: BlockType) => {
    const updatedFormData = { ...formData, blockType };

    // Auto-populate terms when 'terms' is selected
    if (blockType === "terms" && !formData.validationTerms?.length) {
      updatedFormData.validationTerms = [...DEFAULT_TERMS];
    }

    // Auto-populate OTP defaults when 'otp' is selected
    if (blockType === "otp") {
      updatedFormData.validationBypass = formData.validationBypass ?? false;
      updatedFormData.validationDevice = formData.validationDevice ?? false;
      updatedFormData.validationServer = formData.validationServer ?? true; // Default to true like in your example
    }

    // Auto-populate interactive_av with default app package when selected
    if (blockType === "interactive_av" && !formData.options?.length) {
      updatedFormData.options = ["com.batb.bhn_tog"]; // Default app package from your example
    }

    setFormData(updatedFormData);
  };

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
        validationMin: undefined,
        validationMax: undefined,
        validationTerms: [],
        validationBypass: false,
        validationDevice: false,
        validationServer: true,
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
      validationMin: undefined,
      validationMax: undefined,
      validationTerms: [],
      validationBypass: false,
      validationDevice: false,
      validationServer: true,
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
            onChange={(e) => handleBlockTypeChange(e.target.value as BlockType)}
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

        {/* Options for dropdown/multipleChoice/interactive_av */}
        {(formData.blockType === "dropdown" ||
          formData.blockType === "multipleChoice" ||
          formData.blockType === "radio" ||
          formData.blockType === "interactive_av") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.blockType === "interactive_av"
                ? "App Values"
                : "Options"}
            </label>
            <div className="space-y-2">
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    placeholder={
                      formData.blockType === "interactive_av"
                        ? `App Package ${index + 1} (e.g., com.example.app)`
                        : `Option ${index + 1}`
                    }
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
                {formData.blockType === "interactive_av"
                  ? "+ Add App Package"
                  : "+ Add Option"}
              </button>
              {formData.blockType === "interactive_av" && (
                <p className="text-xs text-gray-500 mt-2">
                  Enter app package names or identifiers for interactive AV
                  content. Example: com.batb.bhn_tog
                </p>
              )}
            </div>
          </div>
        )}

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

        {/* Terms & Conditions (only for terms block type) */}
        {formData.blockType === "terms" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms & Conditions
            </label>
            <div className="space-y-2">
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      validationTerms: [...DEFAULT_TERMS],
                    })
                  }
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  disabled={!selectedGroupId}
                >
                  Load Default Terms
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      validationTerms: [
                        ...(formData.validationTerms || []),
                        "",
                      ],
                    })
                  }
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  disabled={!selectedGroupId}
                >
                  Add Term
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {(formData.validationTerms || []).map((term, index) => (
                  <div key={index} className="flex gap-2">
                    <textarea
                      value={term}
                      onChange={(e) => {
                        const newTerms = [...(formData.validationTerms || [])];
                        newTerms[index] = e.target.value;
                        setFormData({ ...formData, validationTerms: newTerms });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 text-xs"
                      placeholder={`Term ${index + 1}`}
                      rows={term.length > 50 ? 3 : 1}
                      disabled={!selectedGroupId}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newTerms = (
                          formData.validationTerms || []
                        ).filter((_, i) => i !== index);
                        setFormData({ ...formData, validationTerms: newTerms });
                      }}
                      className="px-2 py-1 text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors text-xs"
                      disabled={!selectedGroupId}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              {(formData.validationTerms || []).length === 0 && (
                <p className="text-xs text-gray-500 italic">
                  No terms added yet. Click "Load Default Terms" to start.
                </p>
              )}
            </div>
          </div>
        )}

        {/* OTP Validations (only for otp block type) */}
        {formData.blockType === "otp" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OTP Validation Settings
            </label>
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              {/* Bypass Validation */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Bypass Validation
                  </label>
                  <p className="text-xs text-gray-500">
                    Allow skipping OTP verification
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.validationBypass}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        validationBypass: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                    disabled={!selectedGroupId}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Device Validation */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Device Validation
                  </label>
                  <p className="text-xs text-gray-500">
                    Verify OTP through device authentication
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.validationDevice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        validationDevice: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                    disabled={!selectedGroupId}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Server Validation */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Server Validation
                  </label>
                  <p className="text-xs text-gray-500">
                    Verify OTP through server-side validation
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.validationServer}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        validationServer: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                    disabled={!selectedGroupId}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Validation Status Summary */}
              <div className="pt-2 border-t border-gray-300">
                <p className="text-xs text-gray-600 font-medium">
                  Active Validations:
                </p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {formData.validationBypass && (
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                      Bypass Enabled
                    </span>
                  )}
                  {formData.validationDevice && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                      Device Auth
                    </span>
                  )}
                  {formData.validationServer && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                      Server Auth
                    </span>
                  )}
                  {!formData.validationBypass &&
                    !formData.validationDevice &&
                    !formData.validationServer && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                        No validation enabled
                      </span>
                    )}
                </div>
              </div>
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
