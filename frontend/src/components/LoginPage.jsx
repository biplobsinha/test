import React, { useState } from 'react';
import { Shield, Mail, ArrowRight, Lock, Sparkles, Zap } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage({ onLogin }) {
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    const newOTP = generateOTP();
    setGeneratedOTP(newOTP);
    
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      console.log('🔐 Your OTP:', newOTP);
      alert(`Your OTP is: ${newOTP}\n\n(In production, this would be sent to ${email})`);
    }, 1000);
  };

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return;
    if (value && !/^\d+$/.test(value)) return;

    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOTP = pastedData.split('');
      setOtp([...newOTP, ...Array(6 - newOTP.length).fill('')]);
      document.getElementById(`otp-${Math.min(pastedData.length, 5)}`)?.focus();
    }
  };

  const handleOTPSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const enteredOTP = otp.join('');
    
    if (enteredOTP.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (enteredOTP === generatedOTP) {
        onLogin(email);
      } else {
        setError('Invalid OTP. Please try again.');
        setLoading(false);
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      }
    }, 800);
  };

  const handleResendOTP = () => {
    const newOTP = generateOTP();
    setGeneratedOTP(newOTP);
    setOtp(['', '', '', '', '', '']);
    setError('');
    console.log('🔐 New OTP:', newOTP);
    alert(`New OTP: ${newOTP}\n\n(Check console for OTP)`);
  };

  return (
    <div className="login-page-container">
      {/* Animated Grid Background - Razorpay inspired */}
      <div className="cinematic-grid"></div>

      {/* Floating Particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>
      
      <div className="login-card">
        {/* Logo Section - Razorpay inspired */}
        <div className="login-header">
          <div className="logo-wrapper">
            <div className="logo-glow"></div>
            <Shield size={32} strokeWidth={2.5} />
          </div>
          
          <div className="brand-section">
            <h1 className="brand-title">RiskForge</h1>
            <div className="brand-tagline">
              <Zap size={12} />
              <span>AI-Powered Fraud Detection</span>
            </div>
          </div>

          <div className="buildathon-badge">
            <Sparkles size={12} />
            <span>Razorpay AI Buildathon 2026</span>
          </div>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="login-form">
            <div className="form-header">
              <h2>Welcome Back</h2>
              <p>Enter your email to receive a secure OTP</p>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="analyst@riskforge.ai"
                  disabled={loading}
                  autoFocus
                  className="email-input"
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Sending OTP...
                </>
              ) : (
                <>
                  Send OTP
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="security-note">
              <Lock size={14} />
              <p>Secure authentication via one-time password. Your data is encrypted and protected.</p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOTPSubmit} className="login-form">
            <div className="form-header">
              <h2>Verify OTP</h2>
              <p>
                Enter the 6-digit code sent to<br />
                <strong>{email}</strong>
              </p>
            </div>

            <div className="otp-container" onPaste={handleOTPPaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyDown(index, e)}
                  disabled={loading}
                  className="otp-input"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary submit-btn"
              disabled={loading || otp.join('').length !== 6}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify & Continue
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="otp-actions">
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtp(['', '', '', '', '', '']);
                  setError('');
                }}
                className="link-button"
              >
                ← Change Email
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                className="link-button primary"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        <div className="login-footer">
          <p>Track #02 — AI Risk Manager</p>
          <p>© 2026 RiskForge. Built with AI.</p>
        </div>
      </div>
    </div>
  );
}
