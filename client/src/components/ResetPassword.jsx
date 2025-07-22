import React, { useContext, useRef, useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext';

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContent);
  axios.defaults.withCredentials = true;

  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const inputRefs = useRef([]);

  // Step 1: Submit Email
  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, { email });
      if (data.success) {
        toast.success(data.message);
        setIsEmailSent(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Step 2: Submit OTP
  const onSubmitOTP = (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map((input) => input.value);
    if (otpArray.some((digit) => digit === '')) {
      toast.error('Please enter all 6 digits');
      return;
    }
    setOtp(otpArray);
    setIsOtpSubmitted(true);
    toast.success('OTP submitted successfully!');
  };

  // Step 3: Submit New Password
  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, {
        email,
        otp: otp.join(''),
        newPassword,
      });

      if (data.success) {
        toast.success(data.message);
        navigate('/login');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // OTP input handling
  const handleInput = (e, index) => {
    const value = e.target.value.replace(/\D/, '');
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('Text').slice(0, 6).split('');
    const updatedOtp = [...otp];
    pasteData.forEach((char, i) => {
      updatedOtp[i] = char;
      if (inputRefs.current[i]) {
        inputRefs.current[i].value = char;
      }
    });
    setOtp(updatedOtp);
    if (pasteData.length < 6) {
      inputRefs.current[pasteData.length]?.focus();
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-form-wrapper">
        {/* Step 1: Email Input */}
        {!isEmailSent && (
          <form onSubmit={onSubmitEmail} className="auth-form-card">
            {/* Logo moved inside the form */}
            <img
              onClick={() => navigate('/')}
              src={assets.logo}
              alt="logo"
              className="auth-form-logo" // Removed the inline comment here
            />
            <h1 className="auth-form-title">Reset Password</h1>
            <p className="auth-form-subtitle">Enter your registered email address</p>
            <div className="auth-input-group">
              <img src={assets.mail_icon} alt="" className="auth-icon" />
              <input
                type="email"
                placeholder="Email id"
                className="auth-input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="auth-submit-button">
              Submit
            </button>
          </form>
        )}

        {/* Step 2: OTP Input */}
        {isEmailSent && !isOtpSubmitted && (
          <form onSubmit={onSubmitOTP} className="auth-form-card">
            {/* Logo moved inside the form */}
            <img
              onClick={() => navigate('/')}
              src={assets.logo}
              alt="logo"
              className="auth-form-logo" // Removed the inline comment here
            />
            <h1 className="auth-form-title">Enter OTP</h1>
            <p className="auth-form-subtitle">
              Enter the 6-digit code sent to your email id.
            </p>
            <div className="auth-otp-group" onPaste={handlePaste}>
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    required
                    className="auth-otp-input"
                    ref={(el) => (inputRefs.current[index] = el)}
                    onInput={(e) => handleInput(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                  />
                ))}
            </div>
            <button type="submit" className="auth-submit-button">
              Verify OTP
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {isEmailSent && isOtpSubmitted && (
          <form onSubmit={onSubmitNewPassword} className="auth-form-card">
            {/* Logo moved inside the form */}
            <img
              onClick={() => navigate('/')}
              src={assets.logo}
              alt="logo"
              className="auth-form-logo" // Removed the inline comment here
            />
            <h1 className="auth-form-title">New Password</h1>
            <p className="auth-form-subtitle">
              Enter the new password below
            </p>
            <div className="auth-input-group">
              <img src={assets.lock_icon} alt="" className="auth-icon" />
              <input
                type="password"
                placeholder="New Password"
                className="auth-input-field"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="auth-submit-button">
              Reset Password
            </button>
          </form>
        )}
      </div>

      {/* --- Specific CSS Styles for Authentication Pages (matching Sign Up/Login visual) --- */}
      <style>
        {`
          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          a {
            text-decoration: none !important;
          }

          .auth-page-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #e0e7ff; /* Lighter background for consistency with signup page */
            padding: 20px; /* Add some padding for smaller screens */
          }

          /* Removed .auth-logo for external positioning */

          .auth-form-wrapper {
            display: flex;
            gap: 24px;
            background: transparent;
            padding: 16px;
          }

          .auth-form-card {
            background-color: #fff;
            padding: 32px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
            text-align: center;
          }

          .auth-form-logo { /* New class for logo *inside* the form */
            width: 80px; /* Adjust logo size */
            margin: 0 auto 20px; /* Center and add margin below */
            display: block;
            cursor: pointer;
          }

          .auth-form-title {
            font-size: 28px;
            font-weight: 600;
            color: #333;
            margin-bottom: 20px;
          }

          .auth-form-subtitle {
            text-align: center;
            font-size: 15px;
            margin-bottom: 25px;
            color: #666;
          }

          .auth-input-group {
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            padding: 12px 20px;
            border-radius: 4px;
            background-color: #f5f5f5;
            border: 1px solid #ddd;
          }

          .auth-input-group:focus-within {
              border-color: #007bff;
              box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          }

          .auth-icon {
            width: 18px;
            height: 18px;
            margin-right: 10px;
            color: #666;
          }

          .auth-input-field {
            background-color: transparent;
            outline: none;
            border: none;
            width: 100%;
            color: #333;
            font-size: 16px;
          }

          .auth-input-field::placeholder {
            color: #999;
          }

          .auth-otp-group {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            gap: 8px;
          }

          .auth-otp-input {
            width: 45px;
            height: 45px;
            background-color: #f5f5f5;
            color: #333;
            text-align: center;
            font-size: 20px;
            border-radius: 4px;
            border: 1px solid #ddd;
            outline: none;
            transition: border-color 0.2s ease;
          }

          .auth-otp-input:focus {
            border-color: #007bff;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          }

          .auth-submit-button {
            width: 100%;
            padding: 12px 20px;
            border-radius: 4px;
            background-color: #28a745;
            color: #ffffff;
            font-weight: 500;
            border: none;
            cursor: pointer;
            font-size: 18px;
            transition: background-color 0.3s ease;
          }

          .auth-submit-button:hover {
            background-color: #218838;
          }

          .auth-link-text {
            color: #666;
            text-align: center;
            font-size: 14px;
            margin-top: 20px;
          }

          .auth-link-text a {
            color: #007bff;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s ease;
          }

          .auth-link-text a:hover {
            text-decoration: underline;
            color: #0056b3;
          }
        `}
      </style>
    </div>
  );
};

export default ResetPassword;