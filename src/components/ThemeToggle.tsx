<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SnapFaultCore Theme Toggle</title>
    <style>
        :root {
            --bg: #0a1420;
            --accent: #00ffaa;
            --brand: #ff4444;
            --text: #ffffff;
            --muted: rgba(255,255,255,.75);
            --panel: rgba(15,25,40,.4);
            --panel-border: rgba(0,255,170,.25);
            --panel-hover: rgba(0,255,170,.08);
            --shadow: 0 8px 32px rgba(0,0,0,.35);
            --radius: 12px;
        }

        /* Light theme variables */
        :root.theme-light {
            --bg: #f8fafc;
            --text: #1e293b;
            --muted: rgba(30,41,59,.65);
            --panel: rgba(255,255,255,.8);
            --panel-border: rgba(255,68,68,.15);
            --panel-hover: rgba(255,68,68,.05);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            transition: all 0.3s ease;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 40px 24px;
        }

        .page-title {
            color: var(--brand);
            font-size: 2.5rem;
            font-weight: 300;
            text-align: center;
            margin-bottom: 16px;
            text-shadow: 0 0 20px rgba(255, 68, 68, 0.6);
        }

        .page-subtitle {
            text-align: center;
            color: var(--muted);
            margin-bottom: 48px;
            font-size: 1.1rem;
        }

        .section {
            margin-bottom: 40px;
        }

        .section-title {
            color: var(--brand);
            margin-bottom: 20px;
            font-size: 20px;
        }

        .demo-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            align-items: center;
        }

        .config-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }

        .config-item h4 {
            color: var(--text);
            margin-bottom: 12px;
        }

        /* Theme Toggle Styles */
        .theme-toggle {
            display: flex;
            align-items: center;
            gap: 12px;
            background: var(--panel);
            border: 1px solid var(--panel-border);
            border-radius: 12px;
            backdrop-filter: blur(12px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
            color: var(--text);
            position: relative;
            overflow: hidden;
            padding: 10px 16px;
        }

        .theme-toggle:hover {
            background: var(--panel-hover);
            border-color: rgba(255, 68, 68, 0.3);
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(255, 68, 68, 0.15);
        }

        .theme-toggle.small {
            padding: 6px 12px;
            gap: 8px;
            border-radius: 8px;
        }

        .theme-toggle.large {
            padding: 14px 20px;
            gap: 16px;
            border-radius: 14px;
        }

        .theme-toggle.glass {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
        }

        .theme-toggle.neon {
            border-color: rgba(255, 68, 68, 0.4);
            box-shadow: 0 0 15px rgba(255, 68, 68, 0.2);
        }

        .theme-toggle.neon:hover {
            box-shadow: 0 0 25px rgba(255, 68, 68, 0.3);
        }

        .theme-toggle.minimal {
            background: transparent;
            border: none;
            box-shadow: none;
        }

        .theme-toggle.minimal:hover {
            background: rgba(255, 68, 68, 0.08);
        }

        .toggle-track {
            position: relative;
            width: 56px;
            height: 28px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 14px;
            display: flex;
            align-items: center;
            transition: all 0.3s ease;
            overflow: hidden;
        }

        .theme-toggle.small .toggle-track {
            width: 44px;
            height: 22px;
            border-radius: 11px;
        }

        .theme-toggle.large .toggle-track {
            width: 68px;
            height: 34px;
            border-radius: 17px;
        }

        .toggle-thumb {
            position: absolute;
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, var(--brand), #ff6666);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 
                0 2px 8px rgba(255, 68, 68, 0.3),
                0 0 15px rgba(255, 68, 68, 0.2);
            transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
            left: 2px;
            z-index: 2;
        }

        .theme-toggle.small .toggle-thumb {
            width: 18px;
            height: 18px;
        }

        .theme-toggle.large .toggle-thumb {
            width: 30px;
            height: 30px;
        }

        .toggle-thumb.dark {
            transform: translateX(0);
            background: linear-gradient(135deg, #1e293b, #374151);
            box-shadow: 
                0 2px 8px rgba(30, 41, 59, 0.3),
                0 0 15px rgba(30, 41, 59, 0.2);
        }

        .toggle-thumb.light {
            transform: translateX(28px);
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            box-shadow: 
                0 2px 8px rgba(251, 191, 36, 0.3),
                0 0 15px rgba(251, 191, 36, 0.2);
        }

        .toggle-thumb.auto {
            transform: translateX(14px);
            background: linear-gradient(135deg, var(--brand), #ff6666);
        }

        .theme-toggle.small .toggle-thumb.light {
            transform: translateX(22px);
        }

        .theme-toggle.small .toggle-thumb.auto {
            transform: translateX(11px);
        }

        .theme-toggle.large .toggle-thumb.light {
            transform: translateX(34px);
        }

        .theme-toggle.large .toggle-thumb.auto {
            transform: translateX(17px);
        }

        .theme-icon {
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .theme-toggle.small .theme-icon {
            font-size: 10px;
        }

        .theme-toggle.large .theme-icon {
            font-size: 14px;
        }

        .toggle-indicators {
            position: absolute;
            inset: 2px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 6px;
            z-index: 1;
        }

        .indicator {
            font-size: 10px;
            opacity: 0.4;
            transition: opacity 0.3s ease;
        }

        .theme-toggle.small .indicator {
            font-size: 8px;
        }

        .theme-toggle.large .indicator {
            font-size: 12px;
        }

        .theme-label {
            font-size: 14px;
            font-weight: 500;
            color: var(--text);
            user-select: none;
        }

        .theme-toggle.small .theme-label {
            font-size: 12px;
        }

        .theme-toggle.large .theme-label {
            font-size: 16px;
        }

        .status-panel {
            padding: 24px;
            background: var(--panel);
            border: 1px solid var(--panel-border);
            border-radius: 12px;
            backdrop-filter: blur(12px);
        }

        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
        }

        .status-item {
            display: flex;
            flex-direction: column;
        }

        .status-label {
            color: var(--muted);
            font-size: 14px;
        }

        .status-value {
            color: var(--text);
            font-weight: 600;
            font-size: 16px;
            margin-top: 4px;
        }

        .usage-panel {
            padding: 24px;
            background: rgba(255, 68, 68, 0.05);
            border: 1px solid rgba(255, 68, 68, 0.1);
            border-radius: 12px;
        }

        .code-block {
            background: rgba(0, 0, 0, 0.2);
            padding: 16px;
            border-radius: 8px;
            font-size: 13px;
            color: var(--text);
            overflow: auto;
            font-family: 'Courier New', monospace;
            white-space: pre;
        }

        @media (max-width: 768px) {
            .demo-grid {
                flex-direction: column;
                align-items: stretch;
            }

            .config-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="page-title">SnapFaultCore Theme Toggle</h1>
        <p class="page-subtitle">Professional theme switching component with automotive diagnostic styling</p>

        <!-- Size Variants -->
        <section class="section">
            <h2 class="section-title">Size Variants</h2>
            <div class="demo-grid">
                <button class="theme-toggle small" onclick="cycleTheme(this)">
                    <div class="toggle-track">
                        <div class="toggle-thumb dark">
                            <span class="theme-icon">🌙</span>
                        </div>
                        <div class="toggle-indicators">
                            <span class="indicator dark">🌙</span>
                            <span class="indicator light">☀️</span>
                            <span class="indicator auto">⚙️</span>
                        </div>
                    </div>
                    <span class="theme-label">Small</span>
                </button>

                <button class="theme-toggle" onclick="cycleTheme(this)">
                    <div class="toggle-track">
                        <div class="toggle-thumb dark">
                            <span class="theme-icon">🌙</span>
                        </div>
                        <div class="toggle-indicators">
                            <span class="indicator dark">🌙</span>
                            <span class="indicator light">☀️</span>
                            <span class="indicator auto">⚙️</span>
                        </div>
                    </div>
                    <span class="theme-label">Medium</span>
                </button>

                <button class="theme-toggle large" onclick="cycleTheme(this)">
                    <div class="toggle-track">
                        <div class="toggle-thumb dark">
                            <span class="theme-icon">🌙</span>
                        </div>
                        <div class="toggle-indicators">
                            <span class="indicator dark">🌙</span>
                            <span class="indicator light">☀️</span>
                            <span class="indicator auto">⚙️</span>
                        </div>
                    </div>
                    <span class="theme-label">Large</span>
                </button>
            </div>
        </section>

        <!-- Style Variants -->
        <section class="section">
            <h2 class="section-title">Style Variants</h2>
            <div class="config-grid">
                <div class="config-item">
                    <h4>Default</h4>
                    <button class="theme-toggle" onclick="cycleTheme(this)">
                        <div class="toggle-track">
                            <div class="toggle-thumb dark">
                                <span class="theme-icon">🌙</span>
                            </div>
                            <div class="toggle-indicators">
                                <span class="indicator dark">🌙</span>
                                <span class="indicator light">☀️</span>
                                <span class="indicator auto">⚙️</span>
                            </div>
                        </div>
                        <span class="theme-label">Dark Mode</span>
                    </button>
                </div>

                <div class="config-item">
                    <h4>Glass</h4>
                    <button class="theme-toggle glass" onclick="cycleTheme(this)">
                        <div class="toggle-track">
                            <div class="toggle-thumb dark">
                                <span class="theme-icon">🌙</span>
                            </div>
                            <div class="toggle-indicators">
                                <span class="indicator dark">🌙</span>
                                <span class="indicator light">☀️</span>
                                <span class="indicator auto">⚙️</span>
                            </div>
                        </div>
                        <span class="theme-label">Dark Mode</span>
                    </button>
                </div>

                <div class="config-item">
                    <h4>Neon</h4>
                    <button class="theme-toggle neon" onclick="cycleTheme(this)">
                        <div class="toggle-track">
                            <div class="toggle-thumb dark">
                                <span class="theme-icon">🌙</span>
                            </div>
                            <div class="toggle-indicators">
                                <span class="indicator dark">🌙</span>
                                <span class="indicator light">☀️</span>
                                <span class="indicator auto">⚙️</span>
                            </div>
                        </div>
                        <span class="theme-label">Dark Mode</span>
                    </button>
                </div>

                <div class="config-item">
                    <h4>Minimal</h4>
                    <button class="theme-toggle minimal" onclick="cycleTheme(this)">
                        <div class="toggle-track">
                            <div class="toggle-thumb dark">
                                <span class="theme-icon">🌙</span>
                            </div>
                            <div class="toggle-indicators">
                                <span class="indicator dark">🌙</span>
                                <span class="indicator light">☀️</span>
                                <span class="indicator auto">⚙️</span>
                            </div>
                        </div>
                        <span class="theme-label">Dark Mode</span>
                    </button>
                </div>
            </div>
        </section>

        <!-- Configuration Options -->
        <section class="section">
            <h2 class="section-title">Configuration Options</h2>
            <div class="config-grid">
                <div class="config-item">
                    <h4>With Label</h4>
                    <button class="theme-toggle" onclick="cycleTheme(this)">
                        <div class="toggle-track">
                            <div class="toggle-thumb dark">
                                <span class="theme-icon">🌙</span>
                            </div>
                            <div class="toggle-indicators">
                                <span class="indicator dark">🌙</span>
                                <span class="indicator light">☀️</span>
                                <span class="indicator auto">⚙️</span>
                            </div>
                        </div>
                        <span class="theme-label">Dark Mode</span>
                    </button>
                </div>

                <div class="config-item">
                    <h4>Icon Only</h4>
                    <button class="theme-toggle" onclick="cycleTheme(this)">
                        <div class="toggle-track">
                            <div class="toggle-thumb dark">
                                <span class="theme-icon">🌙</span>
                            </div>
                            <div class="toggle-indicators">
                                <span class="indicator dark">🌙</span>
                                <span class="indicator light">☀️</span>
                                <span class="indicator auto">⚙️</span>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </section>

        <!-- Current Theme Status -->
        <section class="section">
            <h2 class="section-title">Current Theme Status</h2>
            <div class="status-panel">
                <div class="status-grid">
                    <div class="status-item">
                        <span class="status-label">Active Theme:</span>
                        <div class="status-value" id="current-theme">Dark</div>
                    </div>
                    <div class="status-item">
                        <span class="status-label">System Preference:</span>
                        <div class="status-value" id="system-preference">Dark</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Usage Example -->
        <section class="section">
            <h2 class="section-title">Usage Example</h2>
            <div class="usage-panel">
                <div class="code-block">import ThemeToggle from './components/ThemeToggle';

// Basic usage
&lt;ThemeToggle 
  initialTheme="dark"
  showLabel={true}
  onChange={(theme) => console.log('Theme changed to:', theme)}
/&gt;

// Advanced configuration
&lt;ThemeToggle 
  size="large"
  variant="neon"
  position="fixed-top-right"
  autoDetect={true}
  disabled={false}
/&gt;</div>
            </div>
        </section>
    </div>

    <script>
        // Theme state management
        let currentTheme = 'dark';
        const themes = ['dark', 'light', 'auto'];
        
        // Get system preference
        function getSystemPreference() {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        // Update system preference display
        function updateSystemPreference() {
            document.getElementById('system-preference').textContent = 
                getSystemPreference().charAt(0).toUpperCase() + getSystemPreference().slice(1);
        }
        
        // Apply theme
        function applyTheme(theme) {
            const root = document.documentElement;
            
            root.classList.remove('theme-light', 'theme-dark', 'theme-auto');
            
            if (theme === 'auto') {
                const systemTheme = getSystemPreference();
                root.classList.add(`theme-${systemTheme}`);
            } else {
                root.classList.add(`theme-${theme}`);
            }
            
            // Update current theme display
            let displayTheme = theme;
            if (theme === 'auto') {
                displayTheme = `Auto (${getSystemPreference()})`;
            }
            document.getElementById('current-theme').textContent = 
                displayTheme.charAt(0).toUpperCase() + displayTheme.slice(1);
        }
        
        // Get theme label
        function getThemeLabel(theme) {
            switch (theme) {
                case 'light': return 'Light Mode';
                case 'dark': return 'Dark Mode';
                case 'auto': return `Auto (${getSystemPreference()})`;
                default: return 'Dark Mode';
            }
        }
        
        // Get theme icon
        function getThemeIcon(theme) {
            switch (theme) {
                case 'light': return '☀️';
                case 'dark': return '🌙';
                case 'auto': return '⚙️';
                default: return '🌙';
            }
        }
        
        // Cycle theme
        function cycleTheme(button) {
            const currentIndex = themes.indexOf(currentTheme);
            currentTheme = themes[(currentIndex + 1) % themes.length];
            
            // Apply theme
            applyTheme(currentTheme);
            
            // Update all toggles
            updateAllToggles();
        }
        
        // Update all toggle buttons
        function updateAllToggles() {
            const toggles = document.querySelectorAll('.theme-toggle');
            
            toggles.forEach(toggle => {
                const thumb = toggle.querySelector('.toggle-thumb');
                const icon = toggle.querySelector('.theme-icon');
                const label = toggle.querySelector('.theme-label');
                
                // Update thumb position and style
                thumb.className = `toggle-thumb ${currentTheme}`;
                
                // Update icon
                if (icon) {
                    icon.textContent = getThemeIcon(currentTheme);
                }
                
                // Update label
                if (label) {
                    label.textContent = getThemeLabel(currentTheme);
                }
            });
        }
        
        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            updateSystemPreference();
            applyTheme(currentTheme);
            updateAllToggles();
            
            // Listen for system preference changes
            if (window.matchMedia) {
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
                    updateSystemPreference();
                    if (currentTheme === 'auto') {
                        applyTheme('auto');
                        updateAllToggles();
                    }
                });
            }
        });
    </script>
</body>
</html>