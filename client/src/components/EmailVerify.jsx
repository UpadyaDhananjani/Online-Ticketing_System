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
    if(e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  }

  const handleKeyDown = (e, index) => {
    // Only move focus if Backspace is pressed, current input is empty, and it's not the first input
    if(e.key === 'Backspace' && e.target.value === '' && index > 0){
      inputRefs.current[index - 1].focus(); // Corrected: focus the previous input
    }
  }

  const handlePaste = (e)=>{
    const paste = e.clipboardData.getData('text')
    const pasteArray = paste.split('');
    pasteArray.forEach((char,index)=>{
      if(inputRefs.current[index]){
        inputRefs.current[index].value = char;
      }
    })
  }

  const onSubmitHandler = async (e) =>{
    e.preventDefault();
    try {
      const otpArray = inputRefs.current.map (input => input ? input.value : '')
      const otp = otpArray.join(''); // Correct use of .join('')

      // --- CRITICAL FIX HERE: Change userData._id to userData.id ---
      if (!userData || !userData.id) { // Changed _id to id
        console.error("EmailVerify: User data or user ID is missing in context.", userData); // Added for debugging
        toast.error("User data not found. Please log in again.");
        navigate('/login');
        return;
      }

      const {data} = await axios.post(backendUrl + '/api/auth/verify-account', {
        userId: userData.id, // Changed _id to id
        otp: otp
      });

      if(data.success){
        toast.success(data.message)
        getUserData(); // Refetch user data to update isAccountVerified status in context
        navigate('/');
      }else{
        toast.error(data.message);
      }
    }catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "An error occurred during verification.";
      console.error("Email verification error:", error); // Added for debugging
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      <form onSubmit={onSubmitHandler} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
        <h1 className='text-white text-2xl font-semibold text-center mb-4'>Email Verify OTP</h1>
        <p className='text-center mb-6 text-indigo-300'>Enter the 6-digit code sent to your email id.</p>

        <div className='flex justify-between mb-8' onPaste={handlePaste}>
          {Array(6).fill(0).map((_, index) => (
            <input
              key={index} type="text" maxLength={1} required
              className='w-12 h-12 bg-[#333A5C] text-center text-white text-xl rounded-md'
              ref={e => inputRefs.current[index] = e}
              onInput={(e) => handleInput(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
        </div>

        <button type="submit" className='w-full py-3 bg-gradient-to-r from-indigo-500 to-fuchsia-600 text-white rounded-full'>Verify Email</button>

      </form>
    </div>
  )
}

export default EmailVerify;
