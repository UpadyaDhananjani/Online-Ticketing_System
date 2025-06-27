// ✅ ResetPassword.jsx (Frontend)
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt="logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      <div className="flex gap-6 bg-transparent p-4 sm:p-10">
        {!isEmailSent && (
          <form
            onSubmit={onSubmitEmail}
            className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
          >
            <h1 className="text-white text-2xl font-semibold text-center mb-4">Reset password</h1>
            <p className="text-center mb-6 text-indigo-300">Enter your registered email address</p>
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.mail_icon} alt="" className="w-4 h-4" />
              <input
                type="email"
                placeholder="Email id"
                className="bg-transparent outline-none text-white w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-400 text-white rounded-full mt-3"
            >
              Submit
            </button>
          </form>
        )}

        {isEmailSent && !isOtpSubmitted && (
          <form
            onSubmit={onSubmitOTP}
            className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
          >
            <h1 className="text-white text-2xl font-semibold text-center mb-4">Reset password OTP</h1>
            <p className="text-center mb-6 text-indigo-300">
              Enter the 6-digit code sent to your email id.
            </p>
            <div className="flex justify-between mb-8" onPaste={handlePaste}>
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    required
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                    ref={(el) => (inputRefs.current[index] = el)}
                    onInput={(e) => handleInput(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                  />
                ))}
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-400 text-white rounded-full"
            >
              Verify OTP
            </button>
          </form>
        )}

        {isEmailSent && isOtpSubmitted && (
          <form
            onSubmit={onSubmitNewPassword}
            className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
          >
            <h1 className="text-white text-2xl font-semibold text-center mb-4">New password</h1>
            <p className="text-center mb-6 text-indigo-300">
              Enter the new password below
            </p>
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.lock_icon} alt="" className="w-4 h-4" />
              <input
                type="password"
                placeholder="Password"
                className="bg-transparent outline-none text-white w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-400 text-white rounded-full mt-3"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;