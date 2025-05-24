import React from "react";
import { ConnectKitButton } from "connectkit";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabIndicatorRef: React.RefObject<HTMLDivElement>;
}

export default function Sidebar({ activeTab, onTabChange, tabIndicatorRef }: SidebarProps) {
  return (
    <div className="w-64 flex-shrink-0 flex flex-col h-full">
      {/* Header with Brand */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">1hoodlabs</h1>
        <div className="px-3 py-1 bg-gray-100 rounded-lg">
          <span className="text-sm font-medium text-gray-600">Bridge</span>
        </div>
      </div>
      {/* Tabs */}
      <div className="relative bg-white border border-gray-200 rounded-xl p-2 mb-4">
        {/* Tab Indicator */}
        <div
          ref={tabIndicatorRef}
          className="absolute left-2 w-[calc(100%-16px)] h-10 bg-purple-100 rounded-lg transition-all duration-300"
        />
        {/* Tab Buttons */}
        <div className="relative space-y-1">
          <button
            data-tab="transfer"
            onClick={() => onTabChange("transfer")}
            className={`w-full h-10 px-4 text-left font-medium rounded-lg transition-all duration-200 ${
              activeTab === "transfer"
                ? "text-purple-700 bg-transparent"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Transfer
          </button>
          <button
            data-tab="add-token"
            onClick={() => onTabChange("add-token")}
            className={`w-full h-10 px-4 text-left font-medium rounded-lg transition-all duration-200 ${
              activeTab === "add-token"
                ? "text-purple-700 bg-transparent"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Add Supported Token
          </button>
        </div>
      </div>
      {/* ConnectKitButton ở cuối sidebar */}
      <div className="mt-auto">
        {/* <ConnectKitButton /> */}
      </div>
    </div>
  );
} 