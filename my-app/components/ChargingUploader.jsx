import React, { useCallback, useId, useMemo, useRef, useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, X } from "lucide-react";

/**
 * ChargingUploader
 *
 * Props:
 * - onFileUpload?(file: File): void
 * - onAnalysisComplete?(report: any): void
 * - onUploadStart?(): void
 * - onError?(message: string): void
 * - uploadUrl?: string // default: /api/charging/upload
 * - analysisParams?: { include_recommendations?: boolean; rate_structure?: string; location_filter?: string[]; date_range_start?: string; date_range_end?: string }
 */
const ChargingUploader = ({
  onFileUpload,
  onAnalysisComplete,
  onUploadStart,
  onError,
  uploadUrl = "/api/charging/upload",
  analysisParams = {},
}) => {
  // ---- constants ----
  const MAX_BYTES = 10 * 1024 * 1024; // 10MB
  // Backend expects CSV. Keep this strict to avoid server 400s.
  const ACCEPT_EXT = ".csv";
  const ACCEPT_MIME = ["text/csv", "application/vnd.ms-excel"]; // browsers vary on csv mime

  // ---- state ----
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [errorMessage, setErrorMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const [serverSummary, setServerSummary] = useState(null);

  const inputId = useId();
  const abortRef = useRef(null);

  const helpText = useMemo(
    () =>
      status === "idle"
        ? "Supports CSV files up to 10MB. Expected columns include Date/Time, Energy (kWh), Cost."
        : "",
    [status]
  );

  // ---- validators ----
  const validateFile = useCallback(
    (file) => {
      if (!file) throw new Error("No file selected.");
      const nameOk = file.name.toLowerCase().endsWith(".csv");
      const typeOk = ACCEPT_MIME.includes(file.type) || nameOk; // some browsers set empty type
      if (!nameOk || !typeOk) {
        throw new Error("Please upload a CSV file (.csv).");
      }
      if (file.size > MAX_BYTES) {
        throw new Error("File size must be less than 10MB.");
      }
      return true;
    },
    [MAX_BYTES]
  );

  // ---- core upload ----
  const uploadToServer = useCallback(
    async (file) => {
      // Build FormData for FastAPI endpoint that uses Depends() for query/body params
      const form = new FormData();
      form.append("file", file, file.name);

      // FastAPI will read AnalysisRequest via query/body; easiest is query params.
      const qs = new URLSearchParams();
      if (analysisParams?.include_recommendations !== undefined)
        qs.set("include_recommendations", String(analysisParams.include_recommendations));
      if (analysisParams?.rate_structure) qs.set("rate_structure", analysisParams.rate_structure);
      if (Array.isArray(analysisParams?.location_filter)) {
        // multiple values: ?location_filter=loc1&location_filter=loc2
        analysisParams.location_filter.forEach((loc) => qs.append("location_filter", loc));
      }
      if (analysisParams?.date_range_start) qs.set("date_range_start", analysisParams.date_range_start);
      if (analysisParams?.date_range_end) qs.set("date_range_end", analysisParams.date_range_end);

      const url = qs.toString() ? `${uploadUrl}?${qs.toString()}` : uploadUrl;

      abortRef.current = new AbortController();

      const res = await fetch(url, {
        method: "POST",
        body: form,
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        // try to parse server error shape
        let detail = "Upload failed.";
        try {
          const payload = await res.json();
          if (payload?.detail) {
            detail = typeof payload.detail === "string" ? payload.detail : JSON.stringify(payload.detail);
          }
        } catch {
          // ignore
        }
        throw new Error(detail);
      }

      const data = await res.json();
      return data;
    },
    [uploadUrl, analysisParams]
  );

  // ---- processing wrapper ----
  const processFile = useCallback(
    async (file) => {
      setStatus("uploading");
      setFileName(file?.name || "");
      setErrorMessage("");
      setServerSummary(null);
      onUploadStart?.();

      try {
        validateFile(file);
        onFileUpload?.(file);

        // Send to backend (preferred). If you want to keep local mock analysis,
        // replace the call below with your mock block.
        const result = await uploadToServer(file);

        setStatus("success");
        setServerSummary(result?.analysis?.summary ?? null);
        onAnalysisComplete?.(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setStatus("error");
        setErrorMessage(message);
        onError?.(message);
      } finally {
        abortRef.current = null;
      }
    },
    [onUploadStart, onFileUpload, onAnalysisComplete, onError, validateFile, uploadToServer]
  );

  // ---- drag & drop ----
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const cancelUpload = useCallback(() => {
    abortRef.current?.abort();
    setStatus("idle");
    setErrorMessage("");
    setFileName("");
    setServerSummary(null);
  }, []);

  // ---- ui helpers ----
  const StatusIcon = () => {
    switch (status) {
      case "uploading":
        return <Loader2 className="w-8 h-8 text-blue-500 animate-spin" aria-hidden />;
      case "success":
        return <CheckCircle className="w-8 h-8 text-green-600" aria-hidden />;
      case "error":
        return <AlertCircle className="w-8 h-8 text-red-600" aria-hidden />;
      default:
        return <Upload className="w-8 h-8 text-gray-400" aria-hidden />;
    }
  };

  const statusMessage =
    status === "uploading"
      ? "Uploading & analyzing…"
      : status === "success"
      ? (serverSummary
          ? `Analyzed ${fileName} — ${serverSummary.efficiency_rating} efficiency`
          : `Successfully analyzed ${fileName}`)
      : status === "error"
      ? errorMessage
      : "Drop your Tesla charging CSV here or click to browse";

  const panelClass =
    dragActive
      ? "border-blue-500 bg-blue-50"
      : status === "success"
      ? "border-green-500 bg-green-50"
      : status === "error"
      ? "border-red-500 bg-red-50"
      : "border-gray-300 bg-gray-50 hover:bg-gray-100";

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Charging Station Efficiency Analyzer</h2>
        <p className="text-gray-600">Upload your Tesla charging history CSV to analyze efficiency and costs.</p>
      </div>

      <div
        role="region"
        aria-labelledby={`${inputId}-label`}
        aria-describedby={`${inputId}-help`}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${panelClass}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id={inputId}
          type="file"
          accept={ACCEPT_EXT}
          onChange={handleChange}
          disabled={status === "uploading"}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          aria-disabled={status === "uploading"}
          aria-label="Upload Tesla charging CSV"
        />

        <div className="flex flex-col items-center gap-4">
          <StatusIcon />

          <div>
            <p id={`${inputId}-label`} className={`text-lg font-medium ${
              status === "success" ? "text-green-700" : status === "error" ? "text-red-700" : "text-gray-800"
            }`}>
              {statusMessage}
            </p>

            {status === "idle" && (
              <p id={`${inputId}-help`} className="mt-2 text-sm text-gray-500">
                CSV only, up to 10MB. Columns: Date/Time, Energy Added (kWh), Cost, and optional Location/Charger Type.
              </p>
            )}
          </div>

          {status === "uploading" && (
            <button
              type="button"
              onClick={cancelUpload}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm text-gray-700 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </div>

      {status === "success" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-700" aria-hidden />
            <span className="text-sm font-medium text-green-800">File processed successfully</span>
          </div>
          {serverSummary && (
            <ul className="mt-2 text-sm text-green-700 list-disc list-inside">
              <li>Overall cost per kWh: ${serverSummary.overall_cost_per_kwh?.toFixed?.(3) ?? "—"}</li>
              <li>kWh per dollar: {serverSummary.overall_kwh_per_dollar ?? "—"}</li>
              <li>Rating: {serverSummary.efficiency_rating ?? "—"}</li>
              <li>Potential annual savings: ${serverSummary.potential_annual_savings ?? "—"}</li>
            </ul>
          )}
        </div>
      )}

      {status === "error" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-700" aria-hidden />
            <span className="text-sm font-medium text-red-800">Upload failed</span>
          </div>
          <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setErrorMessage("");
              setFileName("");
              setServerSummary(null);
            }}
            className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
};

export default ChargingUploader;
