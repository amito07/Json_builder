"use client";

import { GroupJSON } from "@/types";
import { Copy, Download, X } from "lucide-react";
import { useState } from "react";

interface JSONPreviewProps {
  data: GroupJSON[];
  onClose: () => void;
}

export function JSONPreview({ data, onClose }: JSONPreviewProps) {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const downloadJSON = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "form-structure.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 max-w-4xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">JSON Preview</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              <Copy size={14} />
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
            <button
              onClick={downloadJSON}
              className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
            >
              <Download size={14} />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <pre className="text-sm text-gray-800 bg-gray-50 p-4 rounded border overflow-auto">
            {jsonString}
          </pre>
        </div>

        <div className="border-t p-4 text-sm text-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <strong>Total Groups:</strong> {data.length}
            </div>
            <div>
              <strong>Total Blocks:</strong>{" "}
              {data.reduce((acc, group) => acc + group.blocks.length, 0)}
            </div>
            <div>
              <strong>File Size:</strong> {new Blob([jsonString]).size} bytes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
