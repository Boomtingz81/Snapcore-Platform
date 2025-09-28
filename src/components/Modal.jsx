import React, { useEffect, useRef, useState, useCallback } from "react";

const Modal = ({
  isOpen = false,
  onClose = () => {},
  title = "",
  subtitle = "",
  children,
  size = "medium",
  variant = "default",
  showCloseButton = true,
  closeOnEscape = true,
  closeOnBackdrop = true,
  preventBodyScroll = true,
  autoFocus = true,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
  footer = null,
  zIndex = 1000,
  animation = "default",
  persist = false,
  loading = false,
  icon = null,
  maxHeight = "calc(100vh - 64px)",
  onOpen = () => {},
  onClosed = () => {}
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  // Enhanced close handler with callbacks
  const handleClose = useCallback(() => {
    if (persist) return;
    setIsAnimating(true);
    setTimeout(() => {
      onClose();
      onClosed();
      setIsAnimating(false);
    }, 200);
  }, [onClose, onClosed, persist]);

  // Enhanced open/close effects
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      previousFocusRef.current = document.activeElement;
      onOpen();
      
      if (preventBodyScroll) {
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
      }
      
      if (autoFocus) {
        setTimeout(() => {
          if (modalRef.current) {
            modalRef.current.focus();
          }
        }, 100);
      }
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      
      if (preventBodyScroll) {
        document.body.style.overflow = 'unset';
        document.body.style.paddingRight = '0px';
      }
      
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
      
      return () => clearTimeout(timer);
    }

    return () => {
      if (preventBodyScroll) {
        document.body.style.overflow = 'unset';
        document.body.style.paddingRight = '0px';
      }
    };
  }, [isOpen, preventBodyScroll, autoFocus, onOpen]);

  // Enhanced keyboard handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          if (closeOnEscape) {
            e.preventDefault();
            handleClose();
          }
          break;
        case 'Tab':
          // Trap focus within modal
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (!focusableElements?.length) return;
          
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEscape, handleClose]);

  const handleBackdropClick = useCallback((e) => {
    if (closeOnBackdrop && e.target === e.currentTarget && !loading) {
      handleClose();
    }
  }, [closeOnBackdrop, handleClose, loading]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`modal-overlay ${variant} ${animation} ${isOpen ? 'open' : 'closing'} ${className}`} 
      style={{ zIndex }}
    >
      <div 
        className="modal-backdrop"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      <div
        ref={modalRef}
        className={`modal-container ${size} ${loading ? 'loading' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={subtitle ? "modal-subtitle" : undefined}
        tabIndex={-1}
        style={{ maxHeight }}
      >
        {loading && <div className="modal-loading-overlay" />}
        
        {/* Enhanced Header */}
        {(title || subtitle || icon || showCloseButton) && (
          <div className={`modal-header ${headerClassName}`}>
            <div className="modal-header-content">
              {icon && <div className="modal-icon">{icon}</div>}
              <div className="modal-header-text">
                {title && (
                  <h2 id="modal-title" className="modal-title">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p id="modal-subtitle" className="modal-subtitle">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {showCloseButton && (
              <button
                className="modal-close-button"
                onClick={handleClose}
                aria-label="Close modal"
                type="button"
                disabled={loading}
              >
                <span className="close-icon">×</span>
              </button>
            )}
          </div>
        )}

        {/* Enhanced Body */}
        <div className={`modal-body ${bodyClassName}`}>
          {loading ? (
            <div className="modal-loading-content">
              <div className="loading-spinner"></div>
              <p>Loading...</p>
            </div>
          ) : (
            children
          )}
        </div>

        {/* Enhanced Footer */}
        {footer && !loading && (
          <div className={`modal-footer ${footerClassName}`}>
            {footer}
          </div>
        )}
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .modal-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        .modal-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(12px);
          transition: all 0.3s ease;
        }

        .modal-container {
          position: relative;
          background: linear-gradient(145deg, rgba(15, 25, 40, 0.95), rgba(10, 20, 32, 0.98));
          border: 1px solid rgba(255, 68, 68, 0.2);
          border-radius: 16px;
          backdrop-filter: blur(24px);
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.5),
            0 0 40px rgba(255, 68, 68, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          overflow: hidden;
          transform: scale(0.9) translateY(20px);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .modal-overlay.open .modal-container {
          transform: scale(1) translateY(0);
          opacity: 1;
        }

        .modal-container.loading {
          pointer-events: none;
        }

        .modal-loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.3);
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Enhanced size variants */
        .modal-container.small {
          width: 100%;
          max-width: 400px;
        }

        .modal-container.medium {
          width: 100%;
          max-width: 600px;
        }

        .modal-container.large {
          width: 100%;
          max-width: 900px;
        }

        .modal-container.xl {
          width: 100%;
          max-width: 1200px;
        }

        .modal-container.full {
          width: calc(100vw - 32px);
          height: calc(100vh - 32px);
          max-width: none;
        }

        /* Enhanced variant styles */
        .modal-overlay.danger .modal-container {
          border-color: rgba(255, 68, 68, 0.5);
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.5),
            0 0 40px rgba(255, 68, 68, 0.2),
            inset 0 1px 0 rgba(255, 68, 68, 0.1);
        }

        .modal-overlay.success .modal-container {
          border-color: rgba(16, 185, 129, 0.5);
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.5),
            0 0 40px rgba(16, 185, 129, 0.2),
            inset 0 1px 0 rgba(16, 185, 129, 0.1);
        }

        .modal-overlay.warning .modal-container {
          border-color: rgba(245, 158, 11, 0.5);
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.5),
            0 0 40px rgba(245, 158, 11, 0.2),
            inset 0 1px 0 rgba(245, 158, 11, 0.1);
        }

        .modal-overlay.info .modal-container {
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.5),
            0 0 40px rgba(59, 130, 246, 0.2),
            inset 0 1px 0 rgba(59, 130, 246, 0.1);
        }

        /* Animation variants */
        .modal-overlay.slide .modal-container {
          transform: translateY(100%);
        }

        .modal-overlay.slide.open .modal-container {
          transform: translateY(0);
        }

        .modal-overlay.zoom .modal-container {
          transform: scale(0.3);
        }

        .modal-overlay.zoom.open .modal-container {
          transform: scale(1);
        }

        .modal-overlay.fade .modal-container {
          transform: none;
          opacity: 0;
        }

        .modal-overlay.fade.open .modal-container {
          opacity: 1;
        }

        /* Enhanced header */
        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 28px 28px 20px;
          border-bottom: 1px solid rgba(255, 68, 68, 0.1);
          background: linear-gradient(135deg, rgba(255, 68, 68, 0.02), rgba(255, 68, 68, 0.01));
        }

        .modal-header-content {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        .modal-icon {
          font-size: 24px;
          color: var(--brand);
          text-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
        }

        .modal-header-text {
          flex: 1;
        }

        .modal-title {
          font-size: 22px;
          font-weight: 600;
          color: var(--brand);
          text-shadow: 0 0 12px rgba(255, 68, 68, 0.4);
          margin: 0 0 4px 0;
          line-height: 1.3;
        }

        .modal-subtitle {
          font-size: 14px;
          color: var(--muted);
          margin: 0;
          line-height: 1.4;
        }

        .modal-close-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          font-family: inherit;
          flex-shrink: 0;
        }

        .modal-close-button:hover:not(:disabled) {
          background: rgba(255, 68, 68, 0.1);
          border-color: rgba(255, 68, 68, 0.3);
          color: var(--brand);
          transform: scale(1.05) rotate(90deg);
        }

        .modal-close-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .close-icon {
          font-size: 22px;
          line-height: 1;
          font-weight: 300;
        }

        /* Enhanced body */
        .modal-body {
          padding: 28px;
          overflow-y: auto;
          color: var(--text);
          line-height: 1.6;
          position: relative;
        }

        .modal-body::-webkit-scrollbar {
          width: 8px;
        }

        .modal-body::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          margin: 8px;
        }

        .modal-body::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, rgba(255, 68, 68, 0.3), rgba(255, 68, 68, 0.5));
          border-radius: 4px;
          border: 1px solid rgba(255, 68, 68, 0.1);
        }

        .modal-body::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, rgba(255, 68, 68, 0.5), rgba(255, 68, 68, 0.7));
        }

        .modal-loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 40px;
          color: var(--muted);
        }

        /* Enhanced footer */
        .modal-footer {
          padding: 20px 28px 28px;
          border-top: 1px solid rgba(255, 68, 68, 0.1);
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          align-items: center;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.05));
          flex-wrap: wrap;
        }

        /* Loading spinner */
        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255, 68, 68, 0.2);
          border-radius: 50%;
          border-top-color: var(--brand);
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Enhanced focus styles */
        .modal-container:focus {
          outline: 2px solid rgba(255, 68, 68, 0.5);
          outline-offset: 2px;
        }

        .modal-close-button:focus-visible {
          outline: 2px solid rgba(255, 68, 68, 0.5);
          outline-offset: 2px;
        }

        /* Enhanced responsive design */
        @media (max-width: 768px) {
          .modal-overlay {
            padding: 12px;
          }

          .modal-container {
            border-radius: 16px;
            max-height: calc(100vh - 24px) !important;
          }

          .modal-header {
            padding: 20px 20px 16px;
          }

          .modal-header-content {
            gap: 12px;
          }

          .modal-title {
            font-size: 20px;
          }

          .modal-subtitle {
            font-size: 13px;
          }

          .modal-close-button {
            width: 32px;
            height: 32px;
          }

          .close-icon {
            font-size: 20px;
          }

          .modal-body {
            padding: 20px;
          }

          .modal-footer {
            padding: 16px 20px 20px;
            flex-direction: column-reverse;
            gap: 8px;
          }

          .modal-footer > * {
            width: 100%;
            justify-content: center;
          }

          .modal-container.small,
          .modal-container.medium,
          .modal-container.large,
          .modal-container.xl {
            width: calc(100vw - 24px);
          }

          .modal-container.full {
            width: calc(100vw - 24px);
            height: calc(100vh - 24px);
          }
        }

        @media (max-width: 480px) {
          .modal-header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .modal-icon {
            font-size: 20px;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .modal-container {
            border-width: 2px;
            border-color: var(--brand);
          }

          .modal-close-button {
            border-width: 2px;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .modal-overlay,
          .modal-container,
          .modal-close-button,
          .modal-backdrop {
            transition: none !important;
            animation: none !important;
          }

          .modal-container {
            transform: none !important;
          }
        }

        /* Dark theme enhancements */
        @media (prefers-color-scheme: dark) {
          .modal-backdrop {
            background: rgba(0, 0, 0, 0.8);
          }
        }

        /* Print styles */
        @media print {
          .modal-overlay {
            position: static !important;
            background: transparent !important;
            padding: 0 !important;
          }

          .modal-backdrop {
            display: none !important;
          }

          .modal-container {
            box-shadow: none !important;
            border: 1px solid #000 !important;
            max-width: none !important;
            transform: none !important;
          }

          .modal-close-button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

// Enhanced demo with more comprehensive examples
const ModalDemo = () => {
  const [modals, setModals] = useState({
    basic: false,
    confirm: false,
    form: false,
    large: false,
    danger: false,
    success: false,
    loading: false,
    slide: false,
    diagnostic: false
  });

  const openModal = (type) => {
    setModals(prev => ({ ...prev, [type]: true }));
  };

  const closeModal = (type) => {
    setModals(prev => ({ ...prev, [type]: false }));
  };

  return (
    <div style={{ 
      padding: '40px', 
      background: 'linear-gradient(135deg, #0a1420 0%, #1a2332 100%)', 
      color: 'var(--text)', 
      minHeight: '100vh',
      fontFamily: 'system-ui'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          color: 'var(--brand)', 
          marginBottom: '16px', 
          textAlign: 'center',
          fontSize: '3rem',
          textShadow: '0 0 25px rgba(255, 68, 68, 0.6)',
          fontWeight: '300'
        }}>
          SnapFaultCore Enhanced Modals
        </h1>
        
        <p style={{ 
          textAlign: 'center', 
          color: 'var(--muted)', 
          marginBottom: '48px',
          fontSize: '1.1rem'
        }}>
          Professional automotive diagnostic interface components
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '24px',
          marginBottom: '40px'
        }}>
          {[
            { key: 'diagnostic', label: 'Diagnostic Report', variant: 'primary', icon: '🔧' },
            { key: 'danger', label: 'Critical Alert', variant: 'danger', icon: '⚠️' },
            { key: 'success', label: 'Scan Complete', variant: 'success', icon: '✅' },
            { key: 'loading', label: 'Processing...', variant: 'secondary', icon: '⏳' },
            { key: 'form', label: 'Vehicle Setup', variant: 'outline', icon: '🚗' },
            { key: 'slide', label: 'Slide Animation', variant: 'glass', icon: '📊' }
          ].map(({ key, label, variant, icon }) => (
            <button 
              key={key}
              onClick={() => openModal(key)}
              style={{
                padding: '16px 20px',
                background: variant === 'primary' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                           variant === 'danger' ? 'linear-gradient(135deg, #dc2626, #b91c1c)' :
                           variant === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' :
                           variant === 'outline' ? 'transparent' :
                           variant === 'glass' ? 'rgba(255, 255, 255, 0.05)' :
                           'rgba(255, 255, 255, 0.05)',
                color: variant === 'success' ? 'black' : 'white',
                border: variant === 'outline' ? '2px solid #ef4444' : 
                       variant === 'glass' ? '1px solid rgba(255, 255, 255, 0.1)' :
                       'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minHeight: '56px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(255, 68, 68, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '18px' }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Enhanced Modal Examples */}
        
        {/* Diagnostic Modal */}
        <Modal
          isOpen={modals.diagnostic}
          onClose={() => closeModal('diagnostic')}
          title="Vehicle Diagnostic Report"
          subtitle="Comprehensive system analysis completed"
          size="large"
          variant="info"
          icon="🔧"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{ 
              padding: '20px', 
              background: 'rgba(16, 185, 129, 0.1)', 
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <h4 style={{ color: '#10b981', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🟢</span> Engine System
              </h4>
              <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: '1.5' }}>
                All parameters within normal range. No diagnostic trouble codes detected.
              </p>
            </div>
            <div style={{ 
              padding: '20px', 
              background: 'rgba(245, 158, 11, 0.1)', 
              borderRadius: '12px',
              border: '1px solid rgba(245, 158, 11, 0.2)'
            }}>
              <h4 style={{ color: '#f59e0b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🟡</span> Transmission
              </h4>
              <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: '1.5' }}>
                Minor service recommended. Fluid levels adequate, minor wear detected.
              </p>
            </div>
          </div>
        </Modal>

        {/* Critical Alert Modal */}
        <Modal
          isOpen={modals.danger}
          onClose={() => closeModal('danger')}
          title="Critical System Alert"
          subtitle="Immediate attention required"
          size="medium"
          variant="danger"
          icon="⚠️"
          footer={
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', width: '100%' }}>
              <button 
                onClick={() => closeModal('danger')}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Acknowledge Alert
              </button>
              <button 
                onClick={() => closeModal('danger')}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px'
                }}
              >
                Contact Support
              </button>
            </div>
          }
        >
          <div style={{ 
            padding: '24px', 
            background: 'rgba(239, 68, 68, 0.1)', 
            borderRadius: '12px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px', opacity: '0.8' }}>🚨</div>
            <h3 style={{ color: '#ef4444', marginBottom: '16px', fontSize: '18px' }}>
              Engine Temperature Critical
            </h3>
            <p style={{ color: 'var(--muted)', marginBottom: '20px', lineHeight: '1.6' }}>
              Engine coolant temperature has exceeded safe operating limits. 
              Stop the vehicle immediately and allow engine to cool before continuing operation.
            </p>
            <div style={{ 
              padding: '12px 16px', 
              background: 'rgba(0, 0, 0, 0.2)', 
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '13px',
              color: '#ff6666'
            }}>
              Error Code: P0217 - Engine Overheating Condition
            </div>
          </div>
        </Modal>

        {/* Success Modal */}
        <Modal
          isOpen={modals.success}
          onClose={() => closeModal('success')}
          title="Diagnostic Scan Complete"
          subtitle="All systems checked successfully"
          size="medium"
          variant="success"
          icon="✅"
        >
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '72px', marginBottom: '24px' }}>🎯</div>
            <h3 style={{ color: '#10b981', marginBottom: '16px' }}>Scan Completed Successfully</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '24px', lineHeight: '1.6' }}>
              Comprehensive diagnostic scan completed. All monitored systems are operating within normal parameters.
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', color: '#10b981' }}>47</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Systems OK</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', color: '#f59e0b' }}>3</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Warnings</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', color: '#ef4444' }}>0</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Errors</div>
              </div>
            </div>
          </div>
        </Modal>

        {/* Loading Modal */}
        <Modal
          isOpen={modals.loading}
          onClose={() => closeModal('loading')}
          title="Processing Diagnostic Data"
          subtitle="Analyzing vehicle systems..."
          size="medium"
          variant="default"
          icon="⏳"
          loading={true}
          persist={true}
        />

        {/* Slide Animation Modal */}
        <Modal
          isOpen={modals.slide}
          onClose={() => closeModal('slide')}
          title="Performance Analytics"
          subtitle="Real-time vehicle performance metrics"
          size="large"
          variant="info"
          animation="slide"
          icon="📊"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Engine RPM', value: '2,450', unit: 'rpm', color: '#10b981' },
              { label: 'Speed', value: '65', unit: 'mph', color: '#3b82f6' },
              { label: 'Fuel Economy', value: '28.5', unit: 'mpg', color: '#f59e0b' },
              { label: 'Engine Temp', value: '195', unit: '°F', color: '#ef4444' },
              { label: 'Battery', value: '12.6', unit: 'V', color: '#10b981' },
              { label: 'Oil Pressure', value: '45', unit: 'psi', color: '#10b981' }
            ].map((metric, index) => (
              <div key={index} style={{ 
                padding: '16px', 
                background: `rgba(${metric.color === '#10b981' ? '16, 185, 129' : 
                                   metric.color === '#3b82f6' ? '59, 130, 246' :
                                   metric.color === '#f59e0b' ? '245, 158, 11' :
                                   '239, 68, 68'}, 0.1)`,
                borderRadius: '10px',
                border: `1px solid rgba(${metric.color === '#10b981' ? '16, 185, 129' : 
                                         metric.color === '#3b82f6' ? '59, 130, 246' :
                                         metric.color === '#f59e0b' ? '245, 158, 11' :
                                         '239, 68, 68'}, 0.2)`,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '600', color: metric.color, marginBottom: '4px' }}>
                  {metric.value}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '2px' }}>
                  {metric.unit}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text)' }}>
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </Modal>

        {/* Form Modal */}
        <Modal
          isOpen={modals.form}
          onClose={() => closeModal('form')}
          title="Vehicle Configuration"
          subtitle="Set up your vehicle profile for accurate diagnostics"
          size="medium"
          variant="default"
          icon="🚗"
          footer={
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', width: '100%' }}>
              <button 
                onClick={() => closeModal('form')}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={() => closeModal('form')}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Save Configuration
              </button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  color: 'white', 
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  Vehicle Make
                </label>
                <select style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}>
                  <option value="">Select make</option>
                  <option value="toyota">Toyota</option>
                  <option value="ford">Ford</option>
                  <option value="honda">Honda</option>
                  <option value="chevrolet">Chevrolet</option>
                </select>
              </div>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  color: 'white', 
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  Model Year
                </label>
                <input 
                  type="number" 
                  placeholder="2023"
                  min="1990"
                  max="2024"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: 'white', 
                fontWeight: '500',
                fontSize: '14px'
              }}>
                VIN Number
              </label>
              <input 
                type="text" 
                placeholder="Enter 17-digit VIN number"
                maxLength="17"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  letterSpacing: '1px'
                }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: 'white', 
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Engine Type
              </label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {['Gasoline', 'Diesel', 'Hybrid', 'Electric'].map((type) => (
                  <label key={type} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    <input 
                      type="radio" 
                      name="engineType" 
                      value={type.toLowerCase()}
                      style={{ accentColor: '#ef4444' }}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Modal>

        {/* Feature showcase */}
        <div style={{ 
          marginTop: '48px',
          padding: '32px',
          background: 'rgba(255, 68, 68, 0.05)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 68, 68, 0.1)'
        }}>
          <h2 style={{ 
            color: 'var(--brand)', 
            marginBottom: '20px',
            fontSize: '24px',
            textShadow: '0 0 15px rgba(255, 68, 68, 0.4)'
          }}>
            Enhanced Features
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '20px',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <div>
              <h4 style={{ color: '#10b981', marginBottom: '8px' }}>Advanced Accessibility</h4>
              <p style={{ color: 'var(--muted)' }}>
                Full keyboard navigation, focus trapping, screen reader support, and high contrast mode compatibility.
              </p>
            </div>
            <div>
              <h4 style={{ color: '#10b981', marginBottom: '8px' }}>Smart Animations</h4>
              <p style={{ color: 'var(--muted)' }}>
                Multiple animation variants (default, slide, zoom, fade) with automatic reduced motion support.
              </p>
            </div>
            <div>
              <h4 style={{ color: '#10b981', marginBottom: '8px' }}>Enhanced UX</h4>
              <p style={{ color: 'var(--muted)' }}>
                Loading states, persist mode, custom callbacks, subtitle support, and responsive design.
              </p>
            </div>
            <div>
              <h4 style={{ color: '#10b981', marginBottom: '8px' }}>Professional Polish</h4>
              <p style={{ color: 'var(--muted)' }}>
                Enhanced glassmorphism, custom scrollbars, print optimization, and automotive-focused variants.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDemo;