<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SnapFaultCore ButtonStyles Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        :root {
            --btn-primary-bg: linear-gradient(135deg, #ef4444, #dc2626);
            --btn-primary-hover: linear-gradient(135deg, #dc2626, #b91c1c);
            --btn-accent: #10b981;
            --btn-warning: #f59e0b;
            --btn-info: #3b82f6;
            --btn-glass-bg: rgba(255, 255, 255, 0.05);
            --btn-glass-border: rgba(255, 255, 255, 0.1);
            --btn-neon-glow: rgba(239, 68, 68, 0.3);
            --btn-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            --btn-radius: 0.5rem;
            --btn-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        body {
            background: linear-gradient(135deg, #0a1420 0%, #1a2332 100%);
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            color: white;
        }

        .section {
            margin-bottom: 3rem;
        }

        .section h2 {
            color: #ef4444;
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
        }

        .button-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .button-row {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        /* Base button styles */
        .snap-btn {
            position: relative;
            display: inline-flex;
            items-center: center;
            justify-content: center;
            font-weight: 600;
            border-radius: 0.5rem;
            outline: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            backdrop-filter: blur(4px);
            border: 1px solid;
            cursor: pointer;
        }

        /* Sizes */
        .snap-btn-sm { padding: 0.5rem 0.75rem; font-size: 0.875rem; min-height: 32px; gap: 0.25rem; }
        .snap-btn-md { padding: 0.625rem 1.25rem; font-size: 1rem; min-height: 36px; gap: 0.5rem; }
        .snap-btn-lg { padding: 0.75rem 1.5rem; font-size: 1.125rem; min-height: 44px; gap: 0.5rem; }
        .snap-btn-xl { padding: 1rem 2rem; font-size: 1.25rem; min-height: 48px; gap: 0.75rem; }

        /* Variants */
        .snap-btn-primary {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            border-color: #ef4444;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
        }
        .snap-btn-primary:hover {
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.35);
        }

        .snap-btn-secondary {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            color: white;
            border-color: rgba(255, 255, 255, 0.1);
        }
        .snap-btn-secondary:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(239, 68, 68, 0.3);
            color: #ef4444;
            transform: translateY(-1px);
        }

        .snap-btn-outline {
            background: transparent;
            border-color: #ef4444;
            color: #ef4444;
        }
        .snap-btn-outline:hover {
            background: rgba(239, 68, 68, 0.1);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }

        .snap-btn-gradient {
            background: linear-gradient(135deg, #ef4444, #dc2626, #b91c1c);
            color: white;
            border-color: #ef4444;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
        .snap-btn-gradient:hover {
            background: linear-gradient(135deg, #dc2626, #b91c1c, #991b1b);
            box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
        }

        .snap-btn-glass {
            backdrop-filter: blur(20px);
            background: rgba(0, 0, 0, 0.2);
            border-color: rgba(239, 68, 68, 0.2);
            color: white;
        }
        .snap-btn-glass:hover {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.4);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
        }

        .snap-btn-neon {
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(4px);
            color: #f87171;
            border-color: #ef4444;
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
        }
        .snap-btn-neon:hover {
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
            color: #fca5a5;
        }

        .snap-btn-ghost {
            background: transparent;
            color: #f87171;
            border-color: transparent;
        }
        .snap-btn-ghost:hover {
            background: rgba(239, 68, 68, 0.08);
            border-color: rgba(239, 68, 68, 0.2);
        }

        .snap-btn-danger {
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            color: white;
            border-color: #dc2626;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
        }
        .snap-btn-danger:hover {
            background: linear-gradient(135deg, #b91c1c, #991b1b);
            box-shadow: 0 6px 20px rgba(220, 38, 38, 0.35);
        }

        .snap-btn-success {
            background: linear-gradient(135deg, #10b981, #059669);
            color: black;
            border-color: #10b981;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        }
        .snap-btn-success:hover {
            background: linear-gradient(135deg, #059669, #047857);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
        }

        .snap-btn-warning {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            border-color: #f59e0b;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
        }

        .snap-btn-info {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            border-color: #3b82f6;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
        }

        .snap-btn-full { width: 100%; }
        .snap-btn-disabled { opacity: 0.6; cursor: not-allowed; pointer-events: none; }

        /* Effects */
        .shimmer::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transform: translateX(-100%);
            transition: transform 0.5s;
        }
        .shimmer:hover::before {
            transform: translateX(100%);
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
        }
        .pulse { animation: pulse 2s infinite; }

        .loading-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: currentColor;
            animation: spin 1s linear infinite;
            display: inline-block;
            margin-right: 0.5rem;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 style="color: #ef4444; font-size: 2.5rem; font-weight: 600; text-align: center; margin-bottom: 2rem; text-shadow: 0 0 20px rgba(239, 68, 68, 0.6);">
            SnapFaultCore Button Styles
        </h1>

        <div class="section">
            <h2>Button Variants</h2>
            <div class="button-row">
                <button class="snap-btn snap-btn-primary snap-btn-md">Primary</button>
                <button class="snap-btn snap-btn-secondary snap-btn-md">Secondary</button>
                <button class="snap-btn snap-btn-outline snap-btn-md">Outline</button>
                <button class="snap-btn snap-btn-gradient snap-btn-md">Gradient</button>
            </div>
            <div class="button-row">
                <button class="snap-btn snap-btn-glass snap-btn-md">Glass</button>
                <button class="snap-btn snap-btn-neon snap-btn-md">Neon</button>
                <button class="snap-btn snap-btn-ghost snap-btn-md">Ghost</button>
                <button class="snap-btn snap-btn-danger snap-btn-md">Danger</button>
            </div>
            <div class="button-row">
                <button class="snap-btn snap-btn-success snap-btn-md">Success</button>
                <button class="snap-btn snap-btn-warning snap-btn-md">Warning</button>
                <button class="snap-btn snap-btn-info snap-btn-md">Info</button>
            </div>
        </div>

        <div class="section">
            <h2>Button Sizes</h2>
            <div class="button-row">
                <button class="snap-btn snap-btn-primary snap-btn-sm">Small</button>
                <button class="snap-btn snap-btn-primary snap-btn-md">Medium</button>
                <button class="snap-btn snap-btn-primary snap-btn-lg">Large</button>
                <button class="snap-btn snap-btn-primary snap-btn-xl">Extra Large</button>
            </div>
        </div>

        <div class="section">
            <h2>Special Effects</h2>
            <div class="button-row">
                <button class="snap-btn snap-btn-primary snap-btn-md shimmer">Shimmer Effect</button>
                <button class="snap-btn snap-btn-success snap-btn-md pulse">Pulse Effect</button>
                <button class="snap-btn snap-btn-secondary snap-btn-md">
                    <span class="loading-spinner"></span>Loading
                </button>
                <button class="snap-btn snap-btn-outline snap-btn-md snap-btn-disabled">Disabled</button>
            </div>
        </div>

        <div class="section">
            <h2>Preset Combinations</h2>
            <div class="button-grid">
                <div>
                    <h3 style="color: #10b981; margin-bottom: 0.5rem;">Diagnostic Actions</h3>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <button class="snap-btn snap-btn-primary snap-btn-md shimmer">🔍 Diagnostic Scan</button>
                        <button class="snap-btn snap-btn-danger snap-btn-lg pulse">🚨 Emergency Scan</button>
                        <button class="snap-btn snap-btn-info snap-btn-md">📊 Analyze Results</button>
                        <button class="snap-btn snap-btn-success snap-btn-sm">📤 Export Data</button>
                    </div>
                </div>
                
                <div>
                    <h3 style="color: #10b981; margin-bottom: 0.5rem;">Form Actions</h3>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <button class="snap-btn snap-btn-gradient snap-btn-lg snap-btn-full shimmer">✓ Submit Form</button>
                        <button class="snap-btn snap-btn-secondary snap-btn-md">🔄 Reset</button>
                        <button class="snap-btn snap-btn-ghost snap-btn-md">← Back</button>
                    </div>
                </div>
                
                <div>
                    <h3 style="color: #10b981; margin-bottom: 0.5rem;">Navigation</h3>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <button class="snap-btn snap-btn-neon snap-btn-sm">🏠 Home</button>
                        <button class="snap-btn snap-btn-ghost snap-btn-sm">📊 Dashboard</button>
                        <button class="snap-btn snap-btn-primary snap-btn-sm">⚙️ Settings</button>
                    </div>
                </div>
                
                <div>
                    <h3 style="color: #10b981; margin-bottom: 0.5rem;">Status Indicators</h3>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <button class="snap-btn snap-btn-success snap-btn-sm pulse">🟢 Online</button>
                        <button class="snap-btn snap-btn-danger snap-btn-sm">🔴 Offline</button>
                        <button class="snap-btn snap-btn-warning snap-btn-sm">⚠️ Warning</button>
                        <button class="snap-btn snap-btn-info snap-btn-sm">ℹ️ Info</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Code Example</h2>
            <div style="background: rgba(0, 0, 0, 0.3); padding: 1.5rem; border-radius: 0.5rem; border: 1px solid rgba(239, 68, 68, 0.2);">
                <pre style="color: #10b981; font-family: 'Courier New', monospace; font-size: 0.875rem; overflow-x: auto;">
// Usage Examples
import { combineButtonStyles, buttonPresets } from './ButtonStyles';

// Custom combination
const customButton = combineButtonStyles('neon', 'lg', ['shimmer', 'fullWidth']);

// Preset combinations
const scanButton = buttonPresets.diagnostic.scan();
const submitButton = buttonPresets.form.submit();

// JSX Usage
&lt;button className={buttonPresets.diagnostic.emergency()}&gt;
  Emergency Scan
&lt;/button&gt;

&lt;button className="snap-btn snap-btn-primary snap-btn-md shimmer"&gt;
  Custom Button
&lt;/button&gt;
                </pre>
            </div>
        </div>
    </div>
</body>
</html>