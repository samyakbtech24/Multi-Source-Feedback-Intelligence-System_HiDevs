import React, { useState, useRef } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function FileUpload({ onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      uploadFile(file);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      uploadFile(file);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const uploadFile = async (file) => {
    if (!file.name.endsWith(".csv")) {
      setError("Only CSV files are supported.");
      setSuccess(null);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/feedback/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to upload file.");
      }

      setSuccess(data.message || "Upload completed successfully!");
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      setError(err.message || "An error occurred during file upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative flex flex-col items-center justify-center w-full h-52 border border-dashed rounded-none transition-all duration-200 p-6 ${
          dragActive
            ? "border-violet-400 bg-violet-50/50"
            : "border-slate-300 bg-white hover:border-violet-300 hover:bg-violet-50/20"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv"
          onChange={handleChange}
          disabled={loading}
        />

        <div className="flex flex-col items-center justify-center text-center space-y-3">
          {loading ? (
            <>
              <div className="p-3 bg-violet-100 rounded-full text-violet-600 animate-spin">
                <Loader2 size={24} />
              </div>
              <p className="text-slate-700 font-semibold text-sm">Uploading and processing CSV...</p>
              <p className="text-xs text-slate-400 font-medium">Gemini is analyzing reviews in the background...</p>
            </>
          ) : (
            <>
              <div className="p-3 bg-slate-100 rounded-full text-slate-400">
                <Upload size={24} />
              </div>
              <div className="text-sm font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={onButtonClick}
                  className="text-violet-600 font-bold hover:underline focus:outline-none"
                >
                  Click to upload
                </button>{" "}
                <span className="font-normal text-slate-400">or drag and drop your CSV file here</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Requires column: <strong>feedback_text</strong>. Optional: <strong>customer_name, rating</strong>.
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-none text-xs font-semibold">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="mt-4 flex items-start gap-3 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-none text-xs font-semibold">
          <CheckCircle2 className="shrink-0 mt-0.5" size={16} />
          <div>{success}</div>
        </div>
      )}
    </div>
  );
}
