import React, { useState } from "react";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    jobTitle: '',
    acceptTerms: false,
    marketingEmails: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  const jobTitles = [
    'Automotive Technician',
    'Senior Technician',
    'Shop Manager',
    'Service Advisor',
    'Diagnostic Specialist',
    'Fleet Manager',
    'Other'
  ];

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

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }
    
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Signup attempt:', formData);
      alert('Account created successfully! (This is a demo)');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    console.log('Navigate to sign in');
    alert('Would navigate to login page');
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (password.length === 0) return { strength: 0, label: '' };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['#ff4444', '#ff8800', '#ffaa00', '#88ff00', '#00ff66'];
    
    return {
      strength: (score / 5) * 100,
      label: labels[score - 1] || '',
      color: colors[score - 1] || '#ff4444'
    };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="signup-page">
      <a className="skip-link" href="#main">Skip to main content</a>

      <main id="main" className="signup-container">
        <div className="signup-background" aria-hidden="true">
          <div className="bg-grid"></div>
          <div className="bg-glow"></div>
        </div>

        <div className="signup-card">
          <div className="signup-header">
            <div className="brand-logo">
              <div className="logo-icon">⚡</div>
              <div className="brand-text">
                <h1 className="brand-name">SnapFaultCore</h1>
                <p className="brand-tagline">Professional Diagnostics Platform</p>
              </div>
            </div>
            
            <div className="progress-indicator">
              <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                <div className="step-number">1</div>
                <span className="step-label">Basic Info</span>
              </div>
              <div className="progress-line"></div>
              <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <span className="step-label">Complete Setup</span>
              </div>
            </div>
          </div>

          <div className="signup-form">
            {currentStep === 1 ? (
              <div className="form-step">
                <div className="form-header">
                  <h2>Create Account</h2>
                  <p>Join the professional diagnostic platform</p>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`form-input ${errors.firstName ? 'error' : ''}`}
                      placeholder="John"
                      required
                      autoComplete="given-name"
                    />
                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`form-input ${errors.lastName ? 'error' : ''}`}
                      placeholder="Smith"
                      required
                      autoComplete="family-name"
                    />
                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="john.smith@company.com"
                      required
                      autoComplete="email"
                    />
                    <div className="input-icon">📧</div>
                  </div>
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <button
                  type="button"
                  className="next-button"
                  onClick={handleNextStep}
                >
                  Continue
                  <span className="button-icon">→</span>
                </button>
              </div>
            ) : (
              <div className="form-step">
                <div className="form-header">
                  <h2>Complete Your Setup</h2>
                  <p>Almost there! Just a few more details</p>
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      placeholder="Create a strong password"
                      required
                      autoComplete="new-password"
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
                  {formData.password && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div 
                          className="strength-fill"
                          style={{ 
                            width: `${passwordStrength.strength}%`,
                            background: passwordStrength.color 
                          }}
                        ></div>
                      </div>
                      <span className="strength-label" style={{ color: passwordStrength.color }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                      placeholder="Confirm your password"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="company" className="form-label">Company</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className={`form-input ${errors.company ? 'error' : ''}`}
                      placeholder="Your Company Name"
                      required
                      autoComplete="organization"
                    />
                    {errors.company && <span className="error-message">{errors.company}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="jobTitle" className="form-label">Job Title</label>
                    <select
                      id="jobTitle"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      className={`form-input form-select ${errors.jobTitle ? 'error' : ''}`}
                      required
                    >
                      <option value="">Select your role</option>
                      {jobTitles.map(title => (
                        <option key={title} value={title}>{title}</option>
                      ))}
                    </select>
                    {errors.jobTitle && <span className="error-message">{errors.jobTitle}</span>}
                  </div>
                </div>

                <div className="form-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      className="checkbox-input"
                      required
                    />
                    <span className="checkbox-custom"></span>
                    <span className="checkbox-text">
                      I agree to the <button type="button" className="link-button">Terms of Service</button> and <button type="button" className="link-button">Privacy Policy</button>
                    </span>
                  </label>
                  {errors.acceptTerms && <span className="error-message">{errors.acceptTerms}</span>}

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="marketingEmails"
                      checked={formData.marketingEmails}
                      onChange={handleInputChange}
                      className="checkbox-input"
                    />
                    <span className="checkbox-custom"></span>
                    <span className="checkbox-text">
                      Send me updates about new features and diagnostics tools
                    </span>
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="back-button"
                    onClick={handlePrevStep}
                  >
                    ← Back
                  </button>
                  
                  <button
                    type="button"
                    className={`submit-button ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                    onClick={handleSubmit}
                  >
                    {isLoading ? (
                      <>
                        <div className="loading-spinner"></div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <span className="button-icon">✓</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="form-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="signin-button"
              onClick={handleSignIn}
            >
              Already have an account? Sign In
            </button>
          </div>

          <div className="signup-footer">
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
        .signup-page {
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

        .signup-container {
          position: relative;
          width: 100%;
          max-width: 520px;
        }

        .signup-background {
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

        .signup-card {
          background: var(--panel);
          border: 1px solid rgba(255, 68, 68, 0.2);
          border-radius: 16px;
          backdrop-filter: blur(20px);
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.3),
            0 0 30px rgba(255, 68, 68, 0.1);
          overflow: hidden;
        }

        .signup-header {
          padding: 32px 32px 24px;
          text-align: center;
          border-bottom: 1px solid rgba(255, 68, 68, 0.1);
        }

        .brand-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }

        .logo-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--brand), #ff6666, #ff8888);
          border-radius: 14px;
          font-size: 28px;
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
          font-size: 24px;
          font-weight: 600;
          color: var(--brand);
          text-shadow: 
            0 0 15px rgba(255, 68, 68, 0.6),
            0 0 30px rgba(255, 68, 68, 0.4);
          margin: 0;
        }

        .brand-tagline {
          font-size: 12px;
          color: rgba(255, 68, 68, 0.8);
          margin: 4px 0 0 0;
        }

        .progress-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          opacity: 0.5;
          transition: opacity 0.3s ease;
        }

        .step.active {
          opacity: 1;
        }

        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: var(--text);
          transition: all 0.3s ease;
        }

        .step.active .step-number {
          background: var(--brand);
          border-color: var(--brand);
          box-shadow: 0 0 10px rgba(255, 68, 68, 0.4);
        }

        .step-label {
          font-size: 12px;
          color: var(--muted);
        }

        .step.active .step-label {
          color: var(--text);
        }

        .progress-line {
          width: 40px;
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 1px;
        }

        .signup-form {
          padding: 32px;
        }

        .form-step {
          min-height: 400px;
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
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
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
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--text);
          font-size: 14px;
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

        .form-select {
          cursor: pointer;
        }

        .input-icon {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          color: var(--muted);
          pointer-events: none;
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
          font-size: 14px;
          padding: 4px;
          transition: color 0.2s ease;
        }

        .password-toggle:hover {
          color: var(--text);
        }

        .password-strength {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 8px;
        }

        .strength-bar {
          flex: 1;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .strength-fill {
          height: 100%;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .strength-label {
          font-size: 12px;
          font-weight: 500;
          min-width: 80px;
          text-align: right;
        }

        .error-message {
          display: block;
          color: var(--brand);
          font-size: 12px;
          margin-top: 6px;
        }

        .form-checkboxes {
          margin-bottom: 32px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
          font-size: 13px;
          color: var(--text);
          line-height: 1.4;
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
          flex-shrink: 0;
          margin-top: 2px;
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

        .link-button {
          background: none;
          border: none;
          color: var(--brand);
          text-decoration: underline;
          cursor: pointer;
          font-size: inherit;
          font-family: inherit;
        }

        .link-button:hover {
          color: #ff6666;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .back-button {
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--text);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 68, 68, 0.3);
        }

        .next-button,
        .submit-button {
          flex: 1;
          padding: 14px;
          background: linear-gradient(135deg, var(--brand), #ff6666);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 14px;
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

        .next-button {
          width: 100%;
          margin-bottom: 24px;
        }

        .next-button:hover,
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
          width: 14px;
          height: 14px;
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
          font-size: 16px;
          transition: transform 0.2s ease;
        }

        .next-button:hover .button-icon,
        .submit-button:hover .button-icon {
          transform: translateX(2px);
        }

        .form-divider {
          position: relative;
          text-align: center;
          margin: 24px 0;
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

        .signin-button {
          width: 100%;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--text);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .signin-button:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 68, 68, 0.3);
          color: var(--brand);
        }

        .signup-footer {
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
          .signup-page {
            padding: 16px;
          }

          .signup-card {
            border-radius: 12px;
          }

          .signup-header,
          .signup-form,
          .signup-footer {
            padding: 24px;
          }

          .brand-name {
            font-size: 20px;
          }

          .logo-icon {
            width: 48px;
            height: 48px;
            font-size: 24px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .progress-indicator {
            gap: 16px;
          }

          .progress-line {
            width: 30px;
          }

          .form-step {
            min-height: 350px;
          }

          .form-actions {
            flex-direction: column;
          }

          .back-button {
            order: 2;
          }

          .submit-button {
            order: 1;
          }
        }

        /* Focus Styles */
        .form-input:focus-visible,
        .checkbox-label:focus-visible,
        .link-button:focus-visible,
        .next-button:focus-visible,
        .submit-button:focus-visible,
        .back-button:focus-visible,
        .signin-button:focus-visible,
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
      `}