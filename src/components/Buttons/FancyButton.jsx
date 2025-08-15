// ✅ src/components/FancyButton.jsx – Multi-purpose Button with Variants, Loading & Icons
import { useState } from "react";

// ✅ SVG Logos
const Logos = {
  google: (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path
        fill="#EA4335"
        d="M12 12v4.8h6.8c-.3 1.8-2.05 5.2-6.8 5.2a8 8 0 1 1 0-16c2.3 0 3.85.95 4.75 1.8l3.3-3.2C18.75 2.3 15.65 1 12 1 5.95 1 1 5.95 1 12s4.95 11 11 11c6.35 0 10.5-4.45 10.5-10.7 0-.7-.05-1.2-.15-1.8H12z"
      />
    </svg>
  ),
  amazon: (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <path
        fill="#FF9900"
        d="M20.4 18.4c-1.6 1.2-4 2.5-8.4 2.5-3.6 0-6.8-1.2-8.9-3.2-.3-.3 0-.6.3-.4 2.5 1.4 5.6 2.2 8.9 2.2 3.5 0 6.3-1 8-2.2.4-.2.7.2.1.6zM21.6 17.2c-.3-.4-2-2-5.9-2-3.8 0-6.9 1.3-8.9 3.2-.3.3 0 .6.3.4 2.5-1.4 5.6-2.2 8.9-2.2 3.5 0 6.3 1 8 2.2.4.2.7-.2.1-.6z"
      />
    </svg>
  ),
  ebay: (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <text x="0" y="18" fontSize="14" fontWeight="bold" fill="#86B817">
        eBay
      </text>
    </svg>
  ),
  euro: (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
      <rect width="24" height="24" rx="4" fill="#cc0000" />
      <text x="4" y="16" fontSize="10" fontWeight="bold" fill="white">
        EURO
      </text>
    </svg>
  ),
};

// ✅ Loading Spinner
const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    ></path>
  </svg>
);

export function FancyButton({
  type,
  label,
  size = "medium",
  variant = "solid",
  loading = false,
  rightIcon = null,
}) {
  const openSearch = (baseUrl) => {
    const query = encodeURIComponent(label || "car parts");
    window.open(`${baseUrl}${query}`, "_blank");
  };

  const baseSize =
    size === "large"
      ? "px-6 py-3 text-lg"
      : size === "small"
      ? "px-3 py-2 text-sm"
      : "px-5 py-3";

  const baseVariant =
    variant === "outline"
      ? "bg-transparent border-2 text-white hover:bg-white hover:text-black"
      : "text-white";

  const btnBase = `flex items-center justify-center gap-3 ${baseSize} font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#0d1117] disabled:opacity-60 disabled:cursor-not-allowed`;

  const getButton = (bgColor, text, logo, url) => (
    <button
      className={`${btnBase} ${baseVariant} ${
        variant === "solid" ? bgColor : "border-white"
      }`}
      onClick={() => !loading && openSearch(url)}
      disabled={loading}
      aria-label={`Search ${text} for ${label}`}
    >
      {loading ? <Spinner /> : logo}
      <span>{text}</span>
      {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );

  const buttons = {
    search: getButton(
      "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-400",
      "Google",
      Logos.google,
      "https://www.google.com/search?q="
    ),
    amazon: getButton(
      "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600",
      "Amazon",
      Logos.amazon,
      "https://www.amazon.co.uk/s?k="
    ),
    ebay: getButton(
      "bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-400",
      "eBay",
      Logos.ebay,
      "https://www.ebay.co.uk/sch/i.html?_nkw="
    ),
    euro: getButton(
      "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-400",
      "EuroCarParts",
      Logos.euro,
      "https://www.eurocarparts.com/search/"
    ),
  };

  return buttons[type] || null;
}

/* --------------------------------------------
📦 Demo – Responsive Layout
---------------------------------------------*/
export default function DemoButtons() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <FancyButton
          type="search"
          label="Brake Pads BMW"
          size="large"
          loading={false}
          rightIcon={<span>🔍</span>}
        />
        <FancyButton
          type="amazon"
          label="Brake Pads BMW"
          variant="outline"
          rightIcon={<span>🛒</span>}
        />
        <FancyButton type="ebay" label="Brake Pads BMW" loading={true} />
        <FancyButton type="euro" label="Brake Pads BMW" size="small" />
      </div>
    </div>
  );
}
