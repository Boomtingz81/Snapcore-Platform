// src/components/ui/ButtonStyles.js
export const baseStyles =
  "relative inline-flex items-center justify-center font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all overflow-hidden";

export const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2 text-base",
  lg: "px-6 py-3 text-lg",
  xl: "px-8 py-4 text-xl",
};

export const iconButtonSizeStyles = {
  sm: "p-2 w-8 h-8 text-sm",
  md: "p-3 w-10 h-10 text-base",
  lg: "p-4 w-12 h-12 text-lg",
  xl: "p-5 w-14 h-14 text-xl",
};

export const variantStyles = {
  primary: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  secondary: "bg-gray-700 text-white hover:bg-gray-800 focus:ring-gray-500",
  outline:
    "border border-gray-400 text-gray-200 hover:bg-gray-800 focus:ring-gray-500",
  gradient:
    "bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white hover:opacity-90 focus:ring-red-400",
  glass:
    "backdrop-blur-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 focus:ring-white/40",
  neon:
    "bg-black text-red-500 border border-red-500 shadow-[0_0_10px_#f00] hover:shadow-[0_0_20px_#f00] focus:ring-red-400",
  ghost:
    "bg-transparent text-red-500 border border-transparent hover:border-red-500 focus:ring-red-400",
  danger:
    "bg-red-700 text-white hover:bg-red-800 focus:ring-red-700 border border-red-800",
};
