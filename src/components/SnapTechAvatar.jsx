import React, { useMemo, useId } from "react";

export const SNAPTECH_STATES = [
  "idle",
  "listening",
  "processing",
  "speaking",
  "error",
  "success",
];

/** Map logical state -> visual parameters (in seconds) */
function getStateConfig(state) {
  switch (state) {
    case "listening":
      return {
        particleColor: "#00ddff",
        particleGlow: "rgba(0, 221, 255, 0.8)",
        gearSpeedSec: 12,
        quantumSpeedSec: 4,
        pulseOpacity: 0.8,
        pulseColor: "#00ddff",
      };
    case "processing":
      return {
        particleColor: "#ffff44",
        particleGlow: "rgba(255, 255, 68, 0.8)",
        gearSpeedSec: 3,
        quantumSpeedSec: 1,
        pulseOpacity: 1.0,
        pulseColor: "#ffff44",
      };
    case "speaking":
      return {
        particleColor: "#00ffaa",
        particleGlow: "rgba(0, 255, 170, 0.8)",
        gearSpeedSec: 8,
        quantumSpeedSec: 3,
        pulseOpacity: 0.9,
        pulseColor: "#00ffaa",
      };
    case "error":
      return {
        particleColor: "#ff4444",
        particleGlow: "rgba(255, 68, 68, 0.8)",
        gearSpeedSec: 15,
        quantumSpeedSec: 6,
        pulseOpacity: 0.7,
        pulseColor: "#ff4444",
      };
    case "success":
      return {
        particleColor: "#00ff66",
        particleGlow: "rgba(0, 255, 102, 0.9)",
        gearSpeedSec: 6,
        quantumSpeedSec: 2,
        pulseOpacity: 1.0,
        pulseColor: "#00ff66",
      };
    case "idle":
    default:
      return {
        particleColor: "#00ffaa",
        particleGlow: "rgba(0, 255, 170, 0.6)",
        gearSpeedSec: 12,
        quantumSpeedSec: 6,
        pulseOpacity: 0.4,
        pulseColor: "#00ffaa",
      };
  }
}

const SnapTechAvatar = ({
  state = "idle", // idle | listening | processing | speaking | error | success
  size = 80, // px
  className = "",
  title = "SnapTech Avatar",
  ariaLabel = "SnapTech animated avatar",
  onClick,
  paused = false,
  reduceMotion, // undefined = follow OS; boolean to override
}) => {
  // unique suffix per instance to avoid <defs> id collisions
  const uid = useId().replace(/:/g, "-");
  const cfg = useMemo(() => getStateConfig(state), [state]);

  // honor prefers-reduced-motion unless prop overrides
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const shouldReduce = typeof reduceMotion === "boolean" ? reduceMotion : prefersReduced;

  // Build durations as CSS strings
  const gearDur = `${shouldReduce || paused ? 0 : cfg.gearSpeedSec}s`;
  const quantumDur = `${shouldReduce || paused ? 0 : cfg.quantumSpeedSec}s`;
  const counterDur = `${shouldReduce || paused ? 0 : cfg.quantumSpeedSec + 1}s`;

  // id helpers
  const quantumGradId = `quantumGrad-${state}-${uid}`;
  const gearGradId = `gearGrad-${state}-${uid}`;
  const binaryGradId = `binaryGrad-${state}-${uid}`;
  const quantumGlowId = `quantumGlow-${state}-${uid}`;
  const gearGlowId = `gearGlow-${state}-${uid}`;
  const binaryGlowId = `binaryGlow-${state}-${uid}`;

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      title={title}
      className={`snaptech-avatar ${className}`}
      style={{ width: size, height: size, lineHeight: 0 }}
      onClick={onClick}
    >
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          {/* Dynamic gradients */}
          <linearGradient id={quantumGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg.particleColor} stopOpacity="1" />
            <stop offset="33%" stopColor="#aa44ff" stopOpacity="1" />
            <stop offset="66%" stopColor="#00ddff" stopOpacity="1" />
            <stop offset="100%" stopColor={cfg.particleColor} stopOpacity="1" />
          </linearGradient>

          <linearGradient id={gearGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4444" stopOpacity="1" />
            <stop offset="50%" stopColor={cfg.particleColor} stopOpacity="1" />
            <stop offset="100%" stopColor="#00ddff" stopOpacity="1" />
          </linearGradient>

          <linearGradient id={binaryGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg.particleColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#00cc88" stopOpacity="0.9" />
          </linearGradient>

          {/* Glows */}
          <filter id={quantumGlowId}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feFlood floodColor={cfg.particleGlow} floodOpacity={cfg.pulseOpacity} result="glowColor" />
            <feComposite in="glowColor" in2="coloredBlur" operator="in" result="softGlow" />
            <feMerge>
              <feMergeNode in="softGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id={gearGlowId}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id={binaryGlowId}>
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer quantum field */}
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke={`url(#${quantumGradId})`}
          strokeWidth="2"
          opacity={cfg.pulseOpacity}
          filter={`url(#${quantumGlowId})`}
        >
          {!shouldReduce && !paused && state === "listening" && (
            <animate attributeName="stroke-width" values="2;4;2" dur="2s" repeatCount="indefinite" />
          )}
          {!shouldReduce && !paused && state === "processing" && (
            <animate attributeName="opacity" values="0.4;1;0.4" dur="0.5s" repeatCount="indefinite" />
          )}
        </circle>

        <circle
          cx="100"
          cy="100"
          r="70"
          fill="none"
          stroke={`url(#${quantumGradId})`}
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Main gear */}
        <g>
          {!shouldReduce && !paused && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 100 100;360 100 100"
              dur={gearDur}
              repeatCount="indefinite"
            />
          )}

          <circle
            cx="100"
            cy="100"
            r="55"
            fill="none"
            stroke={`url(#${gearGradId})`}
            strokeWidth="3"
            filter={`url(#${gearGlowId})`}
          />

          {/* Gear teeth */}
          {([0, 45, 90, 135, 180, 225, 270, 315]).map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x = 100 + Math.cos(rad) * 55;
            const y = 100 + Math.sin(rad) * 55;
            const cardinal = angle % 90 === 0;
            const width = cardinal ? 12 : 4;
            const height = cardinal ? 4 : 12;
            return (
              <rect
                key={i}
                x={x - width / 2}
                y={y - height / 2}
                width={width}
                height={height}
                fill={`url(#${gearGradId})`}
                filter={`url(#${gearGlowId})`}
              />
            );
          })}

          {/* Gear spokes */}
          <line x1="100" y1="70" x2="100" y2="85" stroke={`url(#${gearGradId})`} strokeWidth="3" opacity="0.8" />
          <line x1="130" y1="100" x2="115" y2="100" stroke={`url(#${gearGradId})`} strokeWidth="3" opacity="0.8" />
          <line x1="100" y1="130" x2="100" y2="115" stroke={`url(#${gearGradId})`} strokeWidth="3" opacity="0.8" />
          <line x1="70" y1="100" x2="85" y2="100" stroke={`url(#${gearGradId})`} strokeWidth="3" opacity="0.8" />
        </g>

        {/* Core */}
        <circle
          cx="100"
          cy="100"
          r="25"
          fill={`url(#${quantumGradId})`}
          filter={`url(#${quantumGlowId})`}
          opacity="0.7"
        />
        <circle cx="100" cy="100" r="15" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />

        {/* Orbiting particles */}
        <g>
          {!shouldReduce && !paused && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 100 100;360 100 100"
              dur={quantumDur}
              repeatCount="indefinite"
            />
          )}
          <circle cx="100" cy="65" r="3" fill={cfg.particleColor} filter={`url(#${quantumGlowId})`} />
          <circle cx="135" cy="100" r="2" fill="#aa44ff" filter={`url(#${quantumGlowId})`} />
          <circle cx="100" cy="135" r="3" fill="#00ddff" filter={`url(#${quantumGlowId})`} />
          <circle cx="65" cy="100" r="2" fill={cfg.particleColor} filter={`url(#${quantumGlowId})`} />
        </g>

        {/* Counter-rotating particles */}
        <g>
          {!shouldReduce && !paused && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="360 100 100;0 100 100"
              dur={counterDur}
              repeatCount="indefinite"
            />
          )}
          <circle cx="120" cy="80" r="2" fill="#00ddff" filter={`url(#${quantumGlowId})`} opacity="0.8" />
          <circle cx="120" cy="120" r="2" fill={cfg.particleColor} filter={`url(#${quantumGlowId})`} opacity="0.8" />
          <circle cx="80" cy="120" r="2" fill="#aa44ff" filter={`url(#${quantumGlowId})`} opacity="0.8" />
          <circle cx="80" cy="80" r="2" fill={cfg.particleColor} filter={`url(#${quantumGlowId})`} opacity="0.8" />
        </g>

        {/* Binary streams */}
        <g opacity="0.9">
          <text x="65" y="25" fontFamily="monospace" fontSize="12" fill={`url(#${binaryGradId})`} filter={`url(#${binaryGlowId})`}>1010</text>
          <text x="105" y="25" fontFamily="monospace" fontSize="12" fill={`url(#${binaryGradId})`} filter={`url(#${binaryGlowId})`}>1101</text>
          <text x="165" y="65" fontFamily="monospace" fontSize="12" fill={`url(#${binaryGradId})`} filter={`url(#${binaryGlowId})`}>0110</text>
          <text x="165" y="105" fontFamily="monospace" fontSize="12" fill={`url(#${binaryGradId})`} filter={`url(#${binaryGlowId})`}>1001</text>
          <text x="165" y="145" fontFamily="monospace" fontSize="12" fill={`url(#${binaryGradId})`} filter={`url(#${binaryGlowId})`}>1100</text>
          <text x="65" y="185" fontFamily="monospace" fontSize="12" fill={`url(#${binaryGradId})`} filter={`url(#${binaryGlowId})`}>0101</text>
          <text x="105" y="185" fontFamily="monospace" fontSize="12" fill={`url(#${binaryGradId})`} filter={`url(#${binaryGlowId})`}>1110</text>
          <text x="10" y="65" fontFamily="monospace" fontSize="12" fill={`url(#${binaryGradId})`} filter={`url(#${binaryGlowId})`}>1011</text>
          <text x="10" y="105" fontFamily="monospace" fontSize="12" fill={`url(#${binaryGradId})`} filter={`url(#${binaryGlowId})`}>0011</text>
          <text x="10" y="145" fontFamily="monospace" fontSize="12" fill={`url(#${binaryGradId})`} filter={`url(#${binaryGlowId})`}>1001</text>
        </g>

        {/* Central tech identifier */}
        <rect x="92" y="96" width="16" height="8" rx="2" fill="rgba(0,0,0,0.8)" stroke={`url(#${binaryGradId})`} strokeWidth="1" />
        <text x="100" y="102" fontFamily="monospace" fontSize="6" fill={`url(#${binaryGradId})`} textAnchor="middle">OBD</text>

        {/* Outer diagnostic pulse */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke={cfg.pulseColor}
          strokeWidth="1"
          opacity={cfg.pulseOpacity}
        >
          {!shouldReduce && !paused && (
            <>
              <animate attributeName="r" values="90;95;90" dur="3s" repeatCount="indefinite" />
              <animate
                attributeName="opacity"
                values={`${cfg.pulseOpacity * 0.5};${cfg.pulseOpacity};${cfg.pulseOpacity * 0.5}`}
                dur="3s"
                repeatCount="indefinite"
              />
            </>
          )}
        </circle>
      </svg>
    </div>
  );
};

export default SnapTechAvatar;
