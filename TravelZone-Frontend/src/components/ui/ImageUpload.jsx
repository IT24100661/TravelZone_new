import { useRef } from "react";
import { ImageIcon, X } from "lucide-react";

/**
 * Reusable image picker that converts to Base64.
 * Props:
 *   preview  - current Base64 preview string (or null)
 *   onChange - called with Base64 string when file selected
 *   onClear  - called when user removes the photo
 *   label    - optional label text
 *   maxMB    - max file size in MB (default 2)
 *   error    - optional external error setter (setError)
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
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
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

      {/* Click zone */}
      <div
        onClick={() => fileInputRef.current.click()}
        className={`relative border-2 border-dashed rounded-2xl p-5 cursor-pointer transition-all
          hover:border-blue-400 hover:bg-blue-50
          ${preview ? "border-blue-400 bg-blue-50" : "border-slate-300 bg-slate-50"}`}
      >
        {preview ? (
          <div className="flex items-center gap-4">
            <img
              src={preview}
              alt="Preview"
              className="w-16 h-16 rounded-xl object-cover border-2 border-blue-200 shadow-sm flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-blue-700 font-semibold text-sm">Photo selected ✓</p>
              <p className="text-slate-400 text-xs mt-0.5">Click to change photo</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current.value = "";
                onClear();
              }}
              className="w-8 h-8 flex-shrink-0 bg-red-100 hover:bg-red-200 text-red-500 rounded-full flex items-center justify-center transition"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="text-center py-2">
            <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center mx-auto mb-2">
              <ImageIcon size={22} className="text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium text-sm">Click to select a photo</p>
            <p className="text-slate-400 text-xs mt-0.5">JPG, PNG, WEBP · max {maxMB}MB</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageUpload;
