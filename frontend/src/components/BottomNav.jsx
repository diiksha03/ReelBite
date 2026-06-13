import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// 🔥 Lucide Icons import kiye hain premium Instagram look ke liye
import { Home, Bookmark, PlusCircle, User } from 'lucide-react';

const BottomNav = () => {
    const location = useLocation();
    
    // Check karte hain ki kya user login hai (token se)
    const isLoggedIn = localStorage.getItem("token");

    // Ek helper function jo active tab ka rang badal dega (jaise Instagram mein hota hai)
    const isActive = (path) => location.pathname === path ? '#ff4757' : '#ffffff';

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            alignItems: 'center',
            background: '#121212', // Premium Dark Background
            padding: '12px 0px', 
            position: 'fixed', 
            bottom: 0, 
            width: '100%',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.5)',
            borderTop: '1px solid #222',
            zIndex: 1000
        }}>
            {/* 1. HOME ICON */}
            <Link to="/" style={{ color: isActive('/'), display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Home size={24} strokeWidth={isActive('/') === '#ff4757' ? 2.5 : 2} />
            </Link>

            {/* 2. SAVED ICON */}
            <Link to="/saved" style={{ color: isActive('/saved'), display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Bookmark size={24} strokeWidth={isActive('/saved') === '#ff4757' ? 2.5 : 2} />
            </Link>

            {/* 3. ADD FOOD / POST ICON (Sirf tab dikhega jab user logged in ho) */}
            {isLoggedIn && (
                <Link to="/create-food" style={{ color: isActive('/create-food'), display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <PlusCircle size={26} strokeWidth={isActive('/create-food') === '#ff4757' ? 2.5 : 2} />
                </Link>
            )}

            {/* 4. PROFILE / LOGIN ICON (Instagram jaisa corner mein) */}
            {isLoggedIn ? (
                // Agar login hai toh profile page par le jao
                <Link to="/profile" style={{ color: isActive('/profile'), display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <User size={24} strokeWidth={isActive('/profile') === '#ff4757' ? 2.5 : 2} />
                </Link>
            ) : (
                // Agar login nahi hai toh login page par le jao
                <Link to="/user/login" style={{ color: isActive('/user/login'), display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <User size={24} strokeWidth={isActive('/user/login') === '#ff4757' ? 2.5 : 2} />
                </Link>
            )}
        </div>
    );
};

export default BottomNav;