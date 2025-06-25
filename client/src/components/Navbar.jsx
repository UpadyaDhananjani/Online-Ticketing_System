// Navbar.jsx
import React, { useContext } from 'react';
import { assets } from '../assets/assets';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { userData } = useContext(AppContent);

  // Hide Login button on auth routes
  const hideLoginBtn = ['/login', '/reset-password', '/email-verify'].includes(location.pathname);

  const sendVerificationOtp = async () => {
    try {
        axios.defaults.withCredentials = true;
        const {data} = await axios.post(backendUrl + '/api/auth/send-verify-otp')

        if(data.success){
            navigate('/email-verify')
            toast.success(data.message)
        }else{
            toast.error(data.message)
        }

    }catch(error) {
        toast.error(error.message)

    }
  }

  const logout = async () =>{
    try{
        axios.defaults.withCredentials = true
        const {data} = await axios.post(backendUrl + '/api/auth/logout')
        data.success && setIsLoggedin(false)
        data.success && setUserData(false)
        navigate('/')

    }catch(error){
        toast.error(error.message)

    }
  }

  return (
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0 z-50">
      {/* Logo */}
      <img
        src={assets.logo}
        alt="logo"
        className="w-28 sm:w-32 cursor-pointer"
        onClick={() => navigate('/')}
      />

      {userData ?

      <div className='w-8 h-8 flex justify-center items-center rounded-full bg-black-text-white relative group'>
        {userData.name[0].toUpperCase()}
        <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10'>

            <ul className='list-none m-0 p-2 big-gray-100 text-sm'>
                {!userData.isAccountVerified && 
                <li onClick={sendVerificationOtp} className='py-1 px-2 hover:bg-gray-200 cursor-pointer'>Verify email</li> }
                <li onClick={logout} className='py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10'>Logout</li>
            </ul>

        </div>


      </div>

       : <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all"
        >
          Login <img src={assets.arrow_icon} alt="arrow" />
        </button>
     }

      {/* If user is logged in, show first letter of name */}
      {userData && (
        <div className="bg-gray-300 text-gray-800 font-bold rounded-full w-10 h-10 flex items-center justify-center">
          {userData.name?.[0]?.toUpperCase() || 'U'}
        </div>
      )}
    </div>
  );
};

export default Navbar;
