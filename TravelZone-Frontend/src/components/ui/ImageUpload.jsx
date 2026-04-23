import { useRef } from "react";
import { ImageIcon, X, Upload } from "lucide-react";

/**
 * Reusable image picker that converts to Base64.
 * Props:
 *   preview  - current Base64 preview string (or null)
 *   onChange - called with Base64 string when file selected
 *   onClear  - called when user removes the photo
 *   label    - optional label text
 *   maxMB    - max file size in MB (default 2)
 *   setError - optional external error setter
 */
function ImageUpload({ preview, onChange, onClear, label = "Photo", maxMB = 2, setError }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError?.("Please select a valid image file (JPG, PNG, WEBP, etc.)");
      return;
    }
    if (file.size > maxMB * 1024 * 1024) {
      setError?.(`Image size must be less than ${maxMB}MB`);
      return;
    }
    setError?.("");
    const reader = new FileReader();
    reader.onloadend = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {label && (
        <label
          className="block text-sm font-semibold mb-1.5"
          style={{ color: "var(--tz-text)" }}
        >
          {label}
        </label>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current.click()}
        className="relative rounded-2xl cursor-pointer transition-all duration-200"
        style={{
          border:     preview
            ? "2px dashed rgba(59,130,246,0.4)"
            : "2px dashed var(--tz-border)",
          background: preview
            ? "rgba(59,130,246,0.05)"
            : "var(--tz-surface-2)",
          padding:    "1.25rem",
          boxShadow:  preview
            ? "0 2px 0px rgba(59,130,246,0.08), inset 0 2px 8px rgba(59,130,246,0.04)"
            : "inset 0 2px 6px rgba(0,0,0,0.04)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)";
          e.currentTarget.style.background  = "rgba(59,130,246,0.06)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = preview ? "rgba(59,130,246,0.4)" : "var(--tz-border)";
          e.currentTarget.style.background  = preview ? "rgba(59,130,246,0.05)" : "var(--tz-surface-2)";
        }}
      >
        {preview ? (
          <div className="flex items-center gap-4">
            {/* Preview thumbnail */}
            <div
              className="flex-shrink-0"
              style={{
                borderRadius: "0.75rem",
                overflow: "hidden",
                border: "2px solid rgba(59,130,246,0.25)",
                boxShadow: "0 3px 0px rgba(59,130,246,0.12), 0 6px 14px rgba(59,130,246,0.1)",
              }}
            >
              <img
                src={preview}
                alt="Preview"
                className="w-16 h-16 object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4l1.5 1.5 3.5-3.5" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-sm font-bold" style={{ color: "#3b82f6" }}>Photo selected</p>
              </div>
              <p className="text-xs" style={{ color: "var(--tz-text-faint)" }}>Click to change photo</p>
            </div>
            {/* Remove button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current.value = "";
                onClear();
              }}
              className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center transition-all"
              style={{
                background: "rgba(239,68,68,0.1)",
                border:     "1px solid rgba(239,68,68,0.2)",
                color:      "#ef4444",
                boxShadow:  "0 2px 0px rgba(239,68,68,0.12)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.18)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <div className="text-center py-3">
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{
                background: "var(--tz-surface-offset)",
                border:     "1px solid var(--tz-border-soft)",
                boxShadow:  "0 3px 0px rgba(0,0,0,0.06)",
              }}
            >
              <ImageIcon size={22} style={{ color: "var(--tz-text-faint)" }} />
            </div>
            <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--tz-text)" }}>
              Click to select a photo
            </p>
            <p className="text-xs" style={{ color: "var(--tz-text-faint)" }}>
              JPG, PNG, WEBP · max {maxMB}MB
            </p>
            {/* Upload pill */}
            <div
              className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background:  "rgba(59,130,246,0.08)",
                border:      "1px solid rgba(59,130,246,0.18)",
                color:       "#3b82f6",
                boxShadow:   "0 2px 0px rgba(59,130,246,0.08)",
              }}
            >
              <Upload size={11} />
              Browse files
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageUpload;