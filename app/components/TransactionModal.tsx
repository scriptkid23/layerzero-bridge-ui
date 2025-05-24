"use client";
import { X, Check, Loader2, AlertCircle } from "lucide-react";
import { useTxModalStore } from "../store/txModalStore";

export default function TransactionModal() {
  const { isOpen, steps, close, reset } = useTxModalStore();

  const isCompleted = steps.every((step) => step.status === "completed");
  const hasError = steps.some((step) => step.status === "error");
  const errorStep = steps.find((step) => step.status === "error");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-auto text-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Bridge Transaction</h2>
          <button
            onClick={() => { close(); reset(); }}
            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        {/* Steps */}
        <div className="space-y-6 mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Progress Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200">
                  <div
                    className={`w-full transition-all duration-500 ${
                      step.status === "completed" ? "h-full bg-green-400" : "h-0"
                    }`}
                  />
                </div>
              )}
              {/* Step Content */}
              <div className="flex items-start gap-4">
                {/* Step Icon */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    step.status === "completed"
                      ? "bg-green-400"
                      : step.status === "in-progress"
                      ? "bg-blue-400"
                      : step.status === "error"
                      ? "bg-red-400"
                      : "bg-gray-300"
                  }`}
                >
                  {step.status === "completed" ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : step.status === "in-progress" ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : step.status === "error" ? (
                    <AlertCircle className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-white font-medium">{step.id}</span>
                  )}
                </div>
                {/* Step Info */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-500">STEP {step.id}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        step.status === "completed"
                          ? "bg-green-400/20 text-green-600"
                          : step.status === "in-progress"
                          ? "bg-blue-400/20 text-blue-600"
                          : step.status === "error"
                          ? "bg-red-400/20 text-red-600"
                          : "bg-gray-300/20 text-gray-400"
                      }`}
                    >
                      {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                    </span>
                  </div>
                  <h3 className={`font-semibold mb-1 ${
                    step.status === "completed"
                      ? "text-green-600"
                      : step.status === "in-progress"
                      ? "text-blue-600"
                      : step.status === "error"
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}>{step.title}</h3>
                  {step.error && <p className="text-sm text-red-500">{step.error}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Error Message */}
        {hasError && errorStep?.error && (
          <div className="bg-red-100 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Transaction Failed</span>
            </div>
            <p className="text-sm mt-1">{errorStep.error}</p>
          </div>
        )}
        {/* Success Message */}
        {isCompleted && (
          <div className="bg-green-100 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <Check className="w-5 h-5" />
              <span className="font-medium">Transaction Successful!</span>
            </div>
          </div>
        )}
        {/* Action Buttons */}
        <div className="flex gap-3">
          {hasError && (
            <button
              onClick={() => {
                reset();
              }}
              className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
            >
              Retry
            </button>
          )}
          <button
            onClick={() => { close(); reset(); }}
            className={`${hasError ? "flex-1" : "w-full"} h-12 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-xl transition-colors`}
          >
            {isCompleted ? "Close" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
} 