// src/pages/Showroom.jsx
import React, { useMemo, useState } from 'react';
import CarModel from '@/components/CarModel';
import { Helmet } from 'react-helmet';
import { AlertTriangle, Smartphone, Cube } from 'lucide-react';

function ErrorBoundary({ children, fallback }) {
  const [error, setError] = useState(null);
  if (error) return fallback ?? null;
  return (
    <React.Suspense fallback={fallback}>
      {React.cloneElement(children, {
        onError: (msg) => setError(msg || 'Failed to load model'),
      })}
    </React.Suspense>
  );
}

export default function Showroom() {
  // If you add more variants later, just extend this map
  const variants = useMemo(
    () => ({
      red: {
        label: 'Tango Red',
        src: '/assets/models/Audi_RS_Q3_red.glb',
        iosSrc: '/assets/models/Audi_RS_Q3_red.usdz',
        poster: '/assets/posters/rsq3.jpg',
      },
      // example for future:
      // black: { label: 'Mythos Black', src: '/assets/models/Audi_RS_Q3_black.glb', iosSrc: '/assets/models/Audi_RS_Q3_black.usdz', poster: '/assets/posters/rsq3_black.jpg' },
    }),
    []
  );

  const [activeKey, setActiveKey] = useState('red');
  const active = variants[activeKey];

  const supportsARQuickLook = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const supportsWebXR = typeof navigator !== 'undefined' && 'xr' in navigator;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <Helmet>
        <title>Audi RS Q3 — Showroom</title>
        <meta
          name="description"
          content="Inspect the Audi RS Q3 in 3D/AR. Orbit, zoom, and adjust exposure. View on mobile to place it in your space."
        />
      </Helmet>

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Audi RS Q3</h1>
        <div className="flex gap-2">
          {Object.entries(variants).map(([key, v]) => (
            <button
              key={key}
              onClick={() => setActiveKey(key)}
              className={`px-3 py-1.5 rounded text-sm border ${
                activeKey === key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Capability callouts */}
      {!supportsWebXR && (
        <div className="mb-3 flex items-center gap-2 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900">
          <AlertTriangle className="h-4 w-4" />
          <p className="text-sm">
            WebXR not detected in this browser. 3D works, but AR may be limited. Try Chrome/Android or iOS Quick Look.
          </p>
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Viewer */}
        <div className="lg:col-span-2 rounded-lg bg-white shadow-sm border">
          <ErrorBoundary
            fallback={
              <div className="h-[60vh] flex items-center justify-center text-gray-600">
                <span className="flex items-center gap-2">
                  <Cube className="w-5 h-5" />
                  Loading model…
                </span>
              </div>
            }
          >
            <CarModel
              src={active.src}
              poster={active.poster}
              envImage="neutral"
              iosSrc={active.iosSrc} // iOS Quick Look (USDZ) if you have it
              ar // enable AR button (CarModel adds AR button if supported)
              onReady={() => console.log('Model ready')}
              // onError handled by ErrorBoundary above via prop injection
            />
          </ErrorBoundary>
        </div>

        {/* Side panel */}
        <aside className="rounded-lg bg-white shadow-sm border p-4 lg:p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Model Details</h2>
          <ul className="text-sm text-gray-700 space-y-1 mb-4">
            <li><strong>Model:</strong> RS Q3</li>
            <li><strong>Variant:</strong> {variants[activeKey].label}</li>
            <li><strong>Format:</strong> GLB (Web), USDZ (iOS)</li>
            <li><strong>AR:</strong> WebXR / Scene Viewer / Quick Look</li>
          </ul>

          <h3 className="text-sm font-semibold text-gray-900 mb-2">Tips</h3>
          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
            <li>Use mouse or touch to orbit/zoom the car.</li>
            <li>Click “Reframe” in the viewer to snap the camera.</li>
            <li>Adjust exposure (bottom-right) for brighter/darker lighting.</li>
            <li>Open on mobile for AR placement.</li>
          </ul>

          <div className="mt-4 rounded bg-gray-50 border p-3 text-xs text-gray-600 flex items-start gap-2">
            <Smartphone className="w-4 h-4 mt-0.5" />
            <p>
              For the best AR experience on Android, use Chrome. On iOS, the “AR” button opens Quick Look if a USDZ is provided.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
