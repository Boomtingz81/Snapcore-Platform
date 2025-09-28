import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = "left",
  fullWidth = false,
  onClick = () => {},
  className = "",
  type = "button",
  ...props
}) => {
  const handleClick = (e) => {
    if (disabled || loading) return;
    onClick(e);
  };

  const renderIcon = () => {
    if (loading) {
      return <div className="loading-spinner"></div>;
    }
    if (icon) {
      return <span className="button-icon">{icon}</span>;
    }
    return null;
  };

  return (
    <button
      type={type}
      className={`snap-button ${variant} ${size} ${fullWidth ? 'full-width' : ''} ${disabled ? 'disabled' : ''} ${loading ? 'loading' : ''} ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      {children && <span className="button-text">{children}</span>}
      {iconPosition === 'right' && renderIcon()}

      <style jsx>{`
        .snap-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
          font-weight: 500;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          text-decoration: none;
          position: relative;
          overflow: hidden;
          white-space: nowrap;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        /* Variants */
        .snap-button.primary {
          background: linear-gradient(135deg, var(--brand), #ff6666);
          color: white;
          border: 1px solid var(--brand);
          box-shadow: 0 4px 12px rgba(255, 68, 68, 0.3);
        }

        .snap-button.primary:hover:not(.disabled):not(.loading) {
          background: linear-gradient(135deg, #ff6666, #ff8888);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 68, 68, 0.4);
        }

        .snap-button.primary:active:not(.disabled):not(.loading) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(255, 68, 68, 0.3);
        }

        .snap-button.secondary {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .snap-button.secondary:hover:not(.disabled):not(.loading) {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 68, 68, 0.3);
          color: var(--brand);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 68, 68, 0.2);
        }

        .snap-button.outline {
          background: transparent;
          color: var(--brand);
          border: 2px solid var(--brand);
        }

        .snap-button.outline:hover:not(.disabled):not(.loading) {
          background: rgba(255, 68, 68, 0.1);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 68, 68, 0.2);
        }

        .snap-button.ghost {
          background: transparent;
          color: var(--muted);
          border: 1px solid transparent;
        }

        .snap-button.ghost:hover:not(.disabled):not(.loading) {
          background: rgba(255, 68, 68, 0.08);
          color: var(--brand);
          border-color: rgba(255, 68, 68, 0.2);
        }

        .snap-button.danger {
          background: linear-gradient(135deg, #ff4444, #ff6666);
          color: white;
          border: 1px solid #ff4444;
          box-shadow: 0 4px 12px rgba(255, 68, 68, 0.3);
        }

        .snap-button.danger:hover:not(.disabled):not(.loading) {
          background: linear-gradient(135deg, #ff6666, #ff8888);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 68, 68, 0.4);
        }

        .snap-button.success {
          background: linear-gradient(135deg, var(--accent), #66ffcc);
          color: var(--bg);
          border: 1px solid var(--accent);
          box-shadow: 0 4px 12px rgba(0, 255, 170, 0.3);
        }

        .snap-button.success:hover:not(.disabled):not(.loading) {
          background: linear-gradient(135deg, #66ffcc, #88ffdd);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 255, 170, 0.4);
        }

        /* Sizes */
        .snap-button.small {
          padding: 6px 12px;
          font-size: 12px;
          gap: 4px;
        }

        .snap-button.medium {
          padding: 10px 16px;
          font-size: 14px;
          gap: 6px;
        }

        .snap-button.large {
          padding: 14px 20px;
          font-size: 16px;
          gap: 8px;
          border-radius: 10px;
        }

        .snap-button.xl {
          padding: 16px 24px;
          font-size: 18px;
          gap: 10px;
          border-radius: 12px;
        }

        /* States */
        .snap-button.disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }

        .snap-button.loading {
          cursor: not-allowed;
          color: transparent;
        }

        .snap-button.full-width {
          width: 100%;
        }

        /* Icon and text elements */
        .button-text {
          display: inline-block;
        }

        .button-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 1.1em;
          transition: transform 0.2s ease;
        }

        .snap-button:hover:not(.disabled):not(.loading) .button-icon {
          transform: scale(1.1);
        }

        .snap-button.primary:hover:not(.disabled):not(.loading) .button-icon,
        .snap-button.success:hover:not(.disabled):not(.loading) .button-icon {
          animation: iconBounce 0.3s ease;
        }

        @keyframes iconBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }

        /* Loading spinner */
        .loading-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: currentColor;
          animation: spin 1s linear infinite;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .snap-button.small .loading-spinner {
          width: 12px;
          height: 12px;
        }

        .snap-button.large .loading-spinner,
        .snap-button.xl .loading-spinner {
          width: 16px;
          height: 16px;
        }

        .snap-button.secondary .loading-spinner,
        .snap-button.ghost .loading-spinner {
          border-color: rgba(255, 68, 68, 0.3);
          border-top-color: var(--brand);
        }

        .snap-button.outline .loading-spinner {
          border-color: rgba(255, 68, 68, 0.3);
          border-top-color: var(--brand);
        }

        @keyframes spin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        /* Pulse effect for primary buttons */
        .snap-button.primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          opacity: 0;
          transform: translateX(-100%);
          transition: all 0.5s ease;
        }

        .snap-button.primary:hover:not(.disabled):not(.loading)::before {
          opacity: 1;
          transform: translateX(100%);
        }

        /* Focus styles */
        .snap-button:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }

        /* Pressed state */
        .snap-button:active:not(.disabled):not(.loading) {
          transform: scale(0.98);
        }

        /* Special effects for success variant */
        .snap-button.success::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(0, 255, 170, 0.2) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .snap-button.success:hover:not(.disabled):not(.loading)::after {
          opacity: 1;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .snap-button {
            min-height: 44px; /* Better touch target */
          }
          
          .snap-button.small {
            padding: 8px 12px;
            min-height: 36px;
          }
          
          .snap-button.large {
            padding: 16px 20px;
            min-height: 52px;
          }
          
          .snap-button.xl {
            padding: 18px 24px;
            min-height: 56px;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .snap-button {
            transition: none !important;
          }
          
          .snap-button *,
          .snap-button::before,
          .snap-button::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </button>
  );
};

// Demo component to showcase all variants
const ButtonDemo = () => {
  const [loadingStates, setLoadingStates] = React.useState({});

  const toggleLoading = (id) => {
    setLoadingStates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div style={{ padding: '40px', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: 'var(--brand)', marginBottom: '40px', textAlign: 'center' }}>SnapFaultCore Button Components</h1>
        
        <div style={{ display: 'grid', gap: '40px' }}>
          {/* Variants */}
          <section>
            <h2 style={{ color: 'var(--accent)', marginBottom: '20px' }}>Button Variants</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <Button variant="primary" icon="⚡">Primary</Button>
              <Button variant="secondary" icon="🔧">Secondary</Button>
              <Button variant="outline" icon="🔍">Outline</Button>
              <Button variant="ghost" icon="👻">Ghost</Button>
              <Button variant="danger" icon="⚠️">Danger</Button>
              <Button variant="success" icon="✓">Success</Button>
            </div>
          </section>

          {/* Sizes */}
          <section>
            <h2 style={{ color: 'var(--accent)', marginBottom: '20px' }}>Button Sizes</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
              <Button size="small" icon="🔧">Small</Button>
              <Button size="medium" icon="⚡">Medium</Button>
              <Button size="large" icon="🚗">Large</Button>
              <Button size="xl" icon="⚡">Extra Large</Button>
            </div>
          </section>

          {/* States */}
          <section>
            <h2 style={{ color: 'var(--accent)', marginBottom: '20px' }}>Button States</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <Button 
                variant="primary" 
                loading={loadingStates.primary}
                onClick={() => toggleLoading('primary')}
              >
                {loadingStates.primary ? 'Loading...' : 'Click to Load'}
              </Button>
              <Button disabled icon="🔒">Disabled</Button>
              <Button variant="secondary" loading icon="🔄">Loading State</Button>
            </div>
          </section>

          {/* Icon positions */}
          <section>
            <h2 style={{ color: 'var(--accent)', marginBottom: '20px' }}>Icon Positions</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <Button icon="←" iconPosition="left">Icon Left</Button>
              <Button icon="→" iconPosition="right">Icon Right</Button>
              <Button icon="⚡">Default Left</Button>
            </div>
          </section>

          {/* Full width */}
          <section>
            <h2 style={{ color: 'var(--accent)', marginBottom: '20px' }}>Layout Options</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              <Button fullWidth variant="primary" icon="🚀">Full Width Primary</Button>
              <Button fullWidth variant="secondary" icon="📊">Full Width Secondary</Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ButtonDemo;