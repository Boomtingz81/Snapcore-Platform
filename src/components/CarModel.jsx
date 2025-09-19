// src/components/CarModel.jsx
// Enhanced <model-viewer> wrapper: progress + errors + AR + reframe + exposure/shadows controls.

import '@google/model-viewer';
import React, { useRef, useState, useEffect, useCallback } from 'react';

/**
 * @param {object} props
 * @param {string} props.src - Path to the GLB/GLTF.
 * @param {string} [props.iosSrc] - Optional .usdz for iOS AR QuickLook.
 * @param {string} [props.envImage] - Environment image or 'neutral'.
 * @param {string} [props.poster] - Optional poster image shown before load.
 * @param {string} [props.alt] - Accessibility alt text.
 * @param {string|number} [props.height] - CSS height of the viewer container.
 * @param {boolean} [props.ar] - Enable AR modes.
 * @param {boolean} [props.autoStart] - Start auto-rotation initially.
 * @param {function} [props.onReady] - Fired when model fully loads.
 * @param {function} [props.onError] - Fired on load error.
 */
export default function CarModel({
  src = '/assets/models/Audi_RS_Q3_red.glb',
  iosSrc,
  envImage = 'neutral',
  poster,
  alt = '3D car model',
  height = '70vh',
  ar = true,
  autoStart = true,
  onReady,
  onError,
}) {
  const ref = useRef(null);

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [autoRotate, setAutoRotate] = useState(autoStart);
  const [exposure, setExposure] = useState(1.15);
  const [shadow, setShadow] = useState(0.8);
  const [errorMsg, setErrorMsg] = useState('');

  // Event handlers
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleProgress = (e) => {
      const p = Math.round((e?.detail?.totalProgress ?? 0) * 100);
      setProgress(p);
      if (p >= 100) setLoading(false);
    };

    const handleLoad = () => {
      setLoading(false);
      setProgress(100);
      // Reasonable default frame for car-sized models
      try {
        el.cameraTarget = '0m 0.8m 0m';
        el.cameraOrbit = '0deg 65deg 5m';
      } catch {}
      onReady?.();
    };

    const handleError = (e) => {
      const msg =
        e?.detail?.message ||
        'Failed to load the 3D model. Check the file path and try again.';
      setErrorMsg(msg);
      setLoading(false);
      onError?.(msg);
    };

    el.addEventListener('progress', handleProgress);
    el.addEventListener('load', handleLoad);
    el.addEventListener('error', handleError);

    return () => {
      el.removeEventListener('progress', handleProgress);
      el.removeEventListener('load', handleLoad);
      el.removeEventListener('error', handleError);
    };
  }, [onReady, onError]);

  const reframe = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.cameraTarget = '0m 0.8m 0m';
    el.cameraOrbit = '0deg 65deg 5m';
  }, []);

  const toggleRotate = useCallback(() => setAutoRotate((v) => !v), []);

  return (
    <div className="relative w-full select-none" style={{ height }}>
      {/* Viewer */}
      <model-viewer
        ref={ref}
        src={src}
        ios-src={iosSrc}
        alt={alt}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
        camera-controls
        auto-rotate={autoRotate ? '' : undefined}
        rotation-per-second="18deg"
        interaction-prompt="auto"
        touch-action="pan-y"
        disable-zoom={false}
        environment-image={envImage}
        exposure={exposure}
        shadow-intensity={shadow}
        shadow-softness="0.85"
        reveal={poster ? 'interaction' : 'auto'}
        poster={poster}
        // AR
        ar={ar ? '' : undefined}
        ar-modes="webxr scene-viewer quick-look"
        ar-status="not-presenting"
        loading="eager"
      />

      {/* Loading overlay */}
      {loading && !errorMsg && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="w-64">
            <div className="mb-2 text-center text-gray-800 text-sm font-medium">
              Loading model… {progress}%
            </div>
            <div className="w-full h-2 bg-gray-200 rounded">
              <div
                className="h-2 bg-blue-600 rounded transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {!!errorMsg && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50/90 text-red-800 p-4">
          <div className="max-w-md text-center">
            <p className="font-semibold mb-2">Couldn’t load the 3D model</p>
            <p className="text-sm mb-3">{errorMsg}</p>
            <button
              onClick={() => {
                setErrorMsg('');
                setLoading(true);
                setProgress(0);
                // Simple refresh of the component
                ref.current?.updateFraming?.();
              }}
              className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
        <button
          onClick={toggleRotate}
          className="px-3 py-1.5 text-sm rounded bg-black/70 text-white hover:bg-black"
          title="Toggle auto-rotate"
        >
          {autoRotate ? 'Pause' : 'Rotate'}
        </button>
        <button
          onClick={reframe}
          className="px-3 py-1.5 text-sm rounded bg-black/70 text-white hover:bg-black"
          title="Reframe model"
        >
          Reframe
        </button>
      </div>

      <div className="absolute bottom-3 right-3 flex flex-wrap items-center gap-2 bg-black/60 text-white rounded px-2 py-1.5">
        <label className="flex items-center gap-2 text-xs">
          <span className="opacity-80">Exposure</span>
          <input
            type="range"
            min="0.6"
            max="1.6"
            step="0.05"
            value={exposure}
            onChange={(e) => setExposure(parseFloat(e.target.value))}
          />
        </label>
        <label className="flex items-center gap-2 text-xs">
          <span className="opacity-80">Shadow</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={shadow}
            onChange={(e) => setShadow(parseFloat(e.target.value))}
          />
        </label>
        {ar && (
          <button
            onClick={() => ref.current?.activateAR?.()}
            className="ml-1 px-2 py-1 text-xs bg-white text-black rounded"
            title="View in AR"
          >
            AR
          </button>
        )}
      </div>
    </div>
  );
}
