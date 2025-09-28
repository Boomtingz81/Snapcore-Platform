import React, { useState } from "react";

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Login attempt:', formData);
      alert('Login successful! (This is a demo)');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
    alert('Password reset functionality would be implemented here');
  };

  const handleCreateAccount = () => {
    console.log('Create account clicked');
    alert('Account creation would redirect to registration page');
  };

  return (
    <div className="login-page">
      {/* Skip Link */}
      <a className="skip-link" href="#main">Skip to main content</a>

      <main id="main" className="login-container">
        {/* Background Effects */}
        <div className="login-background" aria-hidden="true">
          <div className="bg-grid"></div>
          <div className="bg-glow"></div>
        </div>

        {/* Login Card */}
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="brand-logo">
              <div className="logo-icon">⚡</div>
              <div className="brand-text">
                <h1 className="brand-name">SnapFaultCore</h1>
                <p className="brand-tagline">Professional Diagnostics Platform</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="login-form">
            <div className="form-header">
              <h2>Sign In</h2>
              <p>Access your diagnostic workspace</p>
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="technician@company.com"
                  required
                  autoComplete="email"
                />
                <div className="input-icon">📧</div>
              </div>
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">Remember me</span>
              </label>
              
              <button
                type="button"
                className="forgot-password"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              className={`submit-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <span className="button-icon">→</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="form-divider">
              <span>or</span>
            </div>

            {/* Create Account */}
            <button
              type="button"
              className="create-account-button"
              onClick={handleCreateAccount}
            >
              Create New Account
            </button>
          </div>

          {/* Footer */}
          <div className="login-footer">
            <div className="system-info">
              <div className="info-item">
                <span className="info-label">System Status:</span>
                <span className="info-value online">Online</span>
              </div>
              <div className="info-item">
                <span className="info-label">Version:</span>
                <span className="info-value">v2.1.4</span>
              </div>
            </div>
            <p className="footer-text">
              &copy; 2024 SnapCore AI Systems Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </main>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .skip-link {
          position: fixed;
          left: 16px;
          top: 16px;
          z-index: 50;
          background: rgba(0,0,0,.6);
          color: #fff;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,.2);
          text-decoration: none;
          font-size: 14px;
          opacity: .9;
        }

        .login-container {
          position: relative;
          width: 100%;
          max-width: 480px;
        }

        .login-background {
          position: fixed;
          inset: 0;
          z-index: -2;
          overflow: hidden;
        }

        .bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 68, 68, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 68, 68, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridMove 20s linear infinite;
        }

        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        .bg-glow {
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(255, 68, 68, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          animation: glowPulse 4s ease-in-out infinite alternate;
        }

        @keyframes glowPulse {
          0% { opacity: 0.3; transform: translateX(-50%) scale(1); }
          100% { opacity: 0.6; transform: translateX(-50%) scale(1.1); }
        }

        .login-card {
          background: var(--panel);
          border: 1px solid rgba(255, 68, 68, 0.2);
          border-radius: 16px;
          backdrop-filter: blur(20px);
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.3),
            0 0 30px rgba(255, 68, 68, 0.1);
          overflow: hidden;
        }

        .login-header {
          padding: 32px 32px 24px;
          text-align: center;
          border-bottom: 1px solid rgba(255, 68, 68, 0.1);
        }

        .brand-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .logo-icon {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--brand), #ff6666, #ff8888);
          border-radius: 16px;
          font-size: 32px;
          box-shadow: 
            0 0 20px rgba(255, 68, 68, 0.5),
            0 0 40px rgba(255, 68, 68, 0.3),
            inset 0 2px 0 rgba(255, 255, 255, 0.2);
          animation: logoGlow 3s ease-in-out infinite alternate;
        }

        @keyframes logoGlow {
          from {
            box-shadow: 
              0 0 20px rgba(255, 68, 68, 0.5),
              0 0 40px rgba(255, 68, 68, 0.3),
              inset 0 2px 0 rgba(255, 255, 255, 0.2);
          }
          to {
            box-shadow: 
              0 0 30px rgba(255, 68, 68, 0.7),
              0 0 60px rgba(255, 68, 68, 0.4),
              0 0 80px rgba(255, 68, 68, 0.2),
              inset 0 2px 0 rgba(255, 255, 255, 0.3);
          }
        }

        .brand-name {
          font-size: 28px;
          font-weight: 600;
          color: var(--brand);
          text-shadow: 
            0 0 15px rgba(255, 68, 68, 0.6),
            0 0 30px rgba(255, 68, 68, 0.4);
          margin: 0;
        }

        .brand-tagline {
          font-size: 14px;
          color: rgba(255, 68, 68, 0.8);
          margin: 4px 0 0 0;
        }

        .login-form {
          padding: 32px;
        }

        .form-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .form-header h2 {
          font-size: 24px;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 8px 0;
        }

        .form-header p {
          color: var(--muted);
          font-size: 14px;
          margin: 0;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          color: var(--text);
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .input-wrapper {
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
          padding-right: 48px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: var(--text);
          font-size: 16px;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: rgba(255, 68, 68, 0.4);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(255, 68, 68, 0.1);
        }

        .form-input.error {
          border-color: var(--brand);
          background: rgba(255, 68, 68, 0.05);
        }

        .form-input::placeholder {
          color: var(--muted);
        }

        .input-icon {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          color: var(--muted);
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          font-size: 16px;
          padding: 4px;
          transition: color 0.2s ease;
        }

        .password-toggle:hover {
          color: var(--text);
        }

        .error-message {
          display: block;
          color: var(--brand);
          font-size: 12px;
          margin-top: 6px;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
          color: var(--text);
        }

        .checkbox-input {
          display: none;
        }

        .checkbox-custom {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 3px;
          position: relative;
          transition: all 0.2s ease;
        }

        .checkbox-input:checked + .checkbox-custom {
          background: var(--brand);
          border-color: var(--brand);
        }

        .checkbox-input:checked + .checkbox-custom::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 10px;
          font-weight: bold;
        }

        .forgot-password {
          background: none;
          border: none;
          color: var(--brand);
          font-size: 14px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .forgot-password:hover {
          text-decoration: underline;
          color: #ff6666;
        }

        .submit-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, var(--brand), #ff6666);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: inherit;
          box-shadow: 0 4px 12px rgba(255, 68, 68, 0.3);
        }

        .submit-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #ff6666, #ff8888);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 68, 68, 0.4);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .button-icon {
          font-size: 18px;
          transition: transform 0.2s ease;
        }

        .submit-button:hover .button-icon {
          transform: translateX(4px);
        }

        .form-divider {
          position: relative;
          text-align: center;
          margin: 32px 0;
          color: var(--muted);
          font-size: 14px;
        }

        .form-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          z-index: 1;
        }

        .form-divider span {
          background: var(--panel);
          padding: 0 16px;
          position: relative;
          z-index: 2;
        }

        .create-account-button {
          width: 100%;
          padding: 14px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: var(--text);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .create-account-button:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 68, 68, 0.3);
          color: var(--brand);
        }

        .login-footer {
          padding: 24px 32px;
          border-top: 1px solid rgba(255, 68, 68, 0.1);
          background: rgba(0, 0, 0, 0.2);
        }

        .system-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
          font-size: 12px;
        }

        .info-item {
          display: flex;
          gap: 4px;
        }

        .info-label {
          color: var(--muted);
        }

        .info-value {
          color: var(--text);
          font-weight: 500;
        }

        .info-value.online {
          color: var(--accent);
        }

        .footer-text {
          color: var(--muted);
          font-size: 12px;
          text-align: center;
          margin: 0;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .login-page {
            padding: 16px;
          }

          .login-card {
            border-radius: 12px;
          }

          .login-header,
          .login-form,
          .login-footer {
            padding: 24px;
          }

          .brand-name {
            font-size: 24px;
          }

          .logo-icon {
            width: 56px;
            height: 56px;
            font-size: 28px;
          }

          .form-options {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }
        }

        /* Focus Styles */
        .form-input:focus-visible,
        .checkbox-label:focus-visible,
        .forgot-password:focus-visible,
        .submit-button:focus-visible,
        .create-account-button:focus-visible,
        .password-toggle:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: duration 0.1s !important;
          }
        }