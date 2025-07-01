// Home.jsx
import React from 'react';
// import Navbar from '../components/Navbar'; // Navbar is likely rendered in App.js now
// import Header from '../components/Header'; // Remove Header import

const Home = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-[url("/bg_img.png")] bg-cover bg-center'>
        {/* Navbar is now handled by App.js, so remove it here */}
        {/* <Navbar/> */}
        {/* Header content is moved/removed, so remove it here */}
        {/* <Header/> */}
        {/* You can put any specific content for this Home page here if it's not Home2 */}
        <h1 className="text-5xl font-bold text-white">Welcome to the App</h1>
        <p className="text-xl text-white mt-4">Your journey starts here.</p>
    </div>
  )
}

export default Home;