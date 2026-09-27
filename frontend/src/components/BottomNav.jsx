import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bookmark, PlusCircle, User } from 'lucide-react';

const BottomNav = () => {
    const location = useLocation();

    const isLoggedIn = localStorage.getItem("token");

    const isActive = (path) => location.pathname === path ? '#ff4757' : '#ffffff';

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            alignItems: 'center',
            background: '#121212',
            padding: '12px 0px', 
            position: 'fixed', 
            bottom: 0, 
            width: '100%',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.5)',
            borderTop: '1px solid #222',
            zIndex: 1000
        }}>
            <Link to="/" style={{ color: isActive('/'), display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Home size={24} strokeWidth={isActive('/') === '#ff4757' ? 2.5 : 2} />
            </Link>

            <Link to="/saved" style={{ color: isActive('/saved'), display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Bookmark size={24} strokeWidth={isActive('/saved') === '#ff4757' ? 2.5 : 2} />
            </Link>

            {isLoggedIn && (
                <Link to="/create-food" style={{ color: isActive('/create-food'), display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <PlusCircle size={26} strokeWidth={isActive('/create-food') === '#ff4757' ? 2.5 : 2} />
                </Link>
            )}

            {isLoggedIn ? (
                <Link to="/profile" style={{ color: isActive('/profile'), display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <User size={24} strokeWidth={isActive('/profile') === '#ff4757' ? 2.5 : 2} />
                </Link>
            ) : (
                <Link to="/user/login" style={{ color: isActive('/user/login'), display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <User size={24} strokeWidth={isActive('/user/login') === '#ff4757' ? 2.5 : 2} />
                </Link>
            )}
        </div>
    );
};

export default BottomNav;
