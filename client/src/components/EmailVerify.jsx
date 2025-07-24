// client/src/components/EmailVerify.jsx
import React, {useContext, useEffect, useRef} from 'react'
import {assets} from '../assets/assets'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const EmailVerify = () => {

  axios.defaults.withCredentials = true;
  const {backendUrl, isLoggedin, userData, getUserData } = useContext(AppContent)

  const navigate = useNavigate()

  const inputRefs = useRef([])

  const handleInput = (e, index) => {
    // Move focus forward
    if(e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  }

  const handleKeyDown = (e, index) => {
    // Move focus backward on Backspace if current input is empty
    if(e.key === 'Backspace' && e.target.value === '' && index > 0){
      inputRefs.current[index - 1].focus();
    }
  }

  const handlePaste = (e)=>{
    e.preventDefault(); // Prevent default paste behavior
    const pasteData = e.clipboardData.getData('Text').slice(0, 6).split(''); // Get up to 6 characters
    pasteData.forEach((char, i) => {
      if(inputRefs.current[i]){
        inputRefs.current[i].value = char;
        // Optionally move focus to the next empty input after pasting
        if (i < 5 && pasteData.length > i + 1) {
            inputRefs.current[i + 1].focus();
        }
      }
    });
    // Ensure focus is at the end of the pasted sequence
    if (pasteData.length < 6) {
        inputRefs.current[pasteData.length]?.focus();
    } else {
        inputRefs.current[5]?.focus(); // Focus on the last input if all 6 are filled
    }
  }

  const onSubmitHandler = async (e) =>{
    e.preventDefault();
    try {
      const otpArray = inputRefs.current.map (input => input ? input.value : '')
      const otp = otpArray.join('');

      if (!userData || !userData.id) {
        console.error("EmailVerify: User data or user ID is missing in context.", userData);
        toast.error("User data not found. Please log in again.");
        navigate('/login');
        return;
      }

      const {data} = await axios.post(backendUrl + '/api/auth/verify-account', {
        userId: userData.id,
        otp: otp
      });

      if(data.success){
        toast.success(data.message)
        getUserData();
        navigate('/');
      }else{
        toast.error(data.message);
      }
    }catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "An error occurred during verification.";
      console.error("Email verification error:", error);
      toast.error(errorMsg);
    }
  }

  useEffect(()=>{
    if (isLoggedin && userData) {
        if (userData.isAccountVerified) {
            navigate('/');
        }
    } else if (!isLoggedin) {
        navigate('/login');
    }
  },[isLoggedin, userData, navigate]);

  return (
    // Outer container matching Login/Signup page background
    <div className="auth-page-container">
      <div className="auth-form-wrapper">
        <div className="auth-form-card">
          {/* Logo now inside the card, centered */}
          <img
            src={assets.logo}
            alt="Logo"
            className="auth-form-logo" // Reusing the logo style from Login.jsx
            onClick={() => navigate('/')} // Still navigable on click
          />

          {/* Title and subtitle matching the new image */}
          <h2 className="auth-form-title">Enter OTP</h2>
          <p className="auth-form-subtitle">Enter the 6-digit code sent to your email id.</p>

          <form onSubmit={onSubmitHandler} className='space-y-4'>
            {/* OTP input group using auth-otp-group and auth-otp-input classes */}
            <div className='auth-otp-group' onPaste={handlePaste}>
              {Array(6).fill(0).map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  required
                  className='auth-otp-input' // Using the dedicated OTP input class
                  ref={e => inputRefs.current[index] = e}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
            </div>

            {/* Button matching the green "Sign Up" button style */}
            <button type="submit" className='auth-submit-button'>Verify OTP</button>
          </form>
        </div>
      </div>

      {/* --- Embedded CSS Styles for Authentication Pages (including OTP specific styles) --- */}
      <style>{`
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
          background: #e0e7ff; /* Lighter background for consistency */
          padding: 20px; /* Add some padding for smaller screens */
        }

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

        .auth-form-logo {
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

        .auth-input-group { /* General input group style, not used for OTP but kept for consistency */
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

        .auth-icon { /* General icon style, not used for OTP but kept for consistency */
          width: 18px;
          height: 18px;
          margin-right: 10px;
          color: #666;
        }

        .auth-input-field { /* General input field style, not used for OTP but kept for consistency */
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

        /* --- OTP Specific Styles (Copied from ResetPassword.jsx's style block) --- */
        .auth-otp-group {
          display: flex;
          justify-content: space-between; /* Distributes items evenly with space between */
          margin-bottom: 25px;
          gap: 8px; /* Adds space between OTP inputs */
        }

        .auth-otp-input {
          width: 45px; /* Fixed width for each OTP box */
          height: 45px; /* Fixed height for each OTP box */
          background-color: #f5f5f5; /* Light background for inputs */
          color: #333;
          text-align: center;
          font-size: 20px;
          border-radius: 4px;
          border: 1px solid #ddd;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .auth-otp-input:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
        /* --- End OTP Specific Styles --- */


        .auth-submit-button {
          width: 100%;
          padding: 12px 20px;
          border-radius: 4px;
          background-color: #28a745; /* Green button */
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

        .auth-link-text { /* General text style for links/messages */
          color: #666;
          text-align: center;
          font-size: 14px;
        }

        .auth-link { /* Specific style for blue underlined links */
          color: #007bff;
          text-decoration: none;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .auth-link:hover {
          text-decoration: underline;
          color: #0056b3;
        }

        .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
      `}</style>
    </div>
  )
}

export default EmailVerify;