import React, { useCallback, useMemo, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Upload, X, FileText, AlertCircle, CheckCircle } from "lucide-react";

/**
 * FileUpload
 *
 * Props:
 * - onFileSelect(files: File[]): void // called after validation
 * - onUploadComplete(file: File): Promise<void> // called per file during upload
 * - onError(message: string): void
 * - onProgress?(file: File, percent: number): void
 * - accept: string (".csv,.xlsx,.xls" by default)
 * - maxSize: number (bytes) (default 10MB)
 * - multiple: boolean (default false)
 * - autoUpload: boolean (default true)
 * - className: string
 */
const FileUpload = forwardRef(({
  onFileSelect,
  onUploadComplete,
  onError,
  onProgress,
  accept = ".csv,.xlsx,.xls",
  maxSize = 10 * 1024 * 1024,
  multiple = false,
  autoUpload = true,
  className = "",
}, ref) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState/** @type {File[]} */([]);
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);
  const liveRef = useRef(null);

  // expose reset() to parent if needed
  useImperativeHandle(ref, () => ({ reset }));

  const allowedExts = useMemo(
    () => accept.split(",").map((ext) => ext.trim().toLowerCase().replace(/^\./, "")),
    [accept]
  );

  const humanSize = (bytes) => {
    if (!bytes && bytes !== 0) return "";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let n = bytes;
    while (n >= 1024 && i < units.length - 1) { n /= 1024; i += 1; }
    return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
  };

  const announce = (text) => {
    setMessage(text);
    // allow screen readers to re-announce
    if (liveRef.current) {
      liveRef.current.textContent = "";
      // eslint-disable-next-line no-void
      void liveRef.current.offsetHeight;
      liveRef.current.textContent = text;
    }
  };

  const isValidType = (file) => {
    const nameExt = (file.name.split(".").pop() || "").toLowerCase();
    if (allowedExts.includes(nameExt)) return true;
    // Looser MIME fallback for CSV & common spreadsheet types
    const mime = (file.type || "").toLowerCase();
    const knownMimes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/csv",
      "text/plain",
    ];
    return knownMimes.some((m) => mime.includes(m));
  };

  const validateFile = (file) => {
    if (file.size > maxSize) {
      const msg = `“${file.name}” is too large (${humanSize(file.size)}). Max allowed is ${humanSize(maxSize)}.`;
      onError?.(msg);
      announce(msg);
      return false;
    }
    if (!isValidType(file)) {
      const msg = `“${file.name}” has an unsupported type. Allowed: ${accept.toUpperCase()}.`;
      onError?.(msg);
      announce(msg);
      return false;
    }
    return true;
  };

  const validateAndSet = (selected) => {
    const valid = selected.filter(validateFile);
    if (!valid.length) return;
    const next = multiple ? valid : [valid[0]];
    setFiles(next);
    setStatus("idle");
    announce(`${multiple ? `${next.length} files` : `File “${next[0].name}”`} ready to upload.`);
    onFileSelect?.(next);
    if (autoUpload) void upload(next);
  };

  const upload = async (toUpload = files) => {
    if (!toUpload.length || !onUploadComplete) return;
    try {
      setStatus("uploading");
      announce("Uploading…");

      // Run sequentially to simplify progress reporting
      for (const f of toUpload) {
        // Optional fake progress for UX; replace with real progress if your API supports it
        if (onProgress) {
          for (let p = 0; p <= 90; p += 10) {
            onProgress(f, p);
            // eslint-disable-next-line no-await-in-loop
            await new Promise((r) => setTimeout(r, 40));
          }
        }
        // Real upload handler provided by parent
        // eslint-disable-next-line no-await-in-loop
        await onUploadComplete(f);

        if (onProgress) onProgress(f, 100);
      }

      setStatus("success");
      announce("Upload complete.");
    } catch (e) {
      const msg = e?.message || "Upload failed.";
      setStatus("error");
      onError?.(msg);
      announce(msg);
    }
  };

  const reset = () => {
    setFiles([]);
    setStatus("idle");
    setMessage("");
    if (inputRef.current) inputRef.current.value = "";
    announce("Uploader reset.");
  };

  // Drag events
  const onDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(true); }, []);
  const onDragLeave = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(false); }, []);
  const onDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragActive(false);
    if (!e.dataTransfer?.files?.length) return;
    validateAndSet(Array.from(e.dataTransfer.files));
  }, []);

  // Click / keyboard to trigger file dialog
  const openPicker = () => inputRef.current?.click();
  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  };

  const statusIcon = (() => {
    switch (status) {
      case "uploading": return <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case "success": return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "error": return <AlertCircle className="w-6 h-6 text-red-600" />;
      default: return <Upload className="w-6 h-6 text-gray-400" />;
    }
  })();

  const statusText = (() => {
    switch (status) {
      case "uploading": return "Uploading & analyzing…";
      case "success": return "Upload completed successfully.";
      case "error": return "Upload failed.";
      default:
        return files.length ? "Ready to upload" : "Drag a file here, or click to browse";
    }
  })();

  return (
    <div className={`w-full ${className}`}>
      {/* Live region for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" ref={liveRef} />

      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="File upload dropzone"
        aria-describedby="uploader-help"
        className={[
          "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
          "cursor-pointer select-none outline-none",
          isDragActive ? "border-blue-500 bg-blue-50" :
          status === "success" ? "border-green-500 bg-green-50" :
          status === "error" ? "border-red-500 bg-red-50" :
          "border-gray-300 bg-gray-50 hover:bg-gray-100",
          status === "uploading" ? "pointer-events-none opacity-90" : "",
        ].join(" ")}
        onClick={openPicker}
        onKeyDown={onKeyDown}
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            const list = e.target.files ? Array.from(e.target.files) : [];
            if (!list.length) return;
            validateAndSet(list);
          }}
          className="hidden"
          disabled={status === "uploading"}
        />

        <div className="flex flex-col items-center space-y-4">
          {statusIcon}
          <div>
            <p className={`text-lg font-medium ${
              status === "success" ? "text-green-700" :
              status === "error" ? "text-red-700" :
              "text-gray-700"
            }`}>
              {statusText}
            </p>

            {status === "idle" && !files.length && (
              <p id="uploader-help" className="text-sm text-gray-500 mt-2">
                Supported: {accept.replace(/\./g, "").toUpperCase()} • Max size: {humanSize(maxSize)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Selected files */}
      {!!files.length && (
        <div className="mt-4 space-y-2">
          {files.map((f, i) => (
            <div key={`${f.name}-${i}`} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{f.name}</p>
                  <p className="text-xs text-gray-500">{humanSize(f.size)}</p>
                </div>
              </div>

              {status === "idle" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = files.filter((_, idx) => idx !== i);
                    setFiles(next);
                    if (!next.length) setStatus("idle");
                    announce(`Removed ${f.name} from selection.`);
                  }}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  aria-label={`Remove ${f.name}`}
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {!!files.length && status === "idle" && !autoUpload && (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => upload()}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Upload & Analyze
          </button>
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {(status === "success" || status === "error") && (
        <div className="mt-4">
          <button
            type="button"
            onClick={reset}
            className="w-full bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Upload Another File
          </button>
        </div>
      )}
    </div>
  );
});

export default FileUpload;
