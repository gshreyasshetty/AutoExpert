import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, Plus, MessageSquare, Home, Moon, Sun, Crown } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        // Check local storage or system preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setTheme(savedTheme);
            document.body.setAttribute('data-theme', savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
            document.body.setAttribute('data-theme', 'dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <Car className="nav-icon" />
                    <span>AUTO-EXPERT</span>
                </Link>

                <div className="nav-links">
                    <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                        <Home size={20} />
                        <span>Dashboard</span>
                    </Link>

                    <Link to="/add-vehicle" className={`nav-link ${isActive('/add-vehicle') ? 'active' : ''}`}>
                        <Plus size={20} />
                        <span>Add Vehicle</span>
                    </Link>

                    <Link to="/diagnosis" className={`nav-link ${isActive('/diagnosis') ? 'active' : ''}`}>
                        <MessageSquare size={20} />
                        <span>Quick Diagnosis</span>
                    </Link>

                    <button 
                        className="nav-link" 
                        onClick={() => alert("Upgrade to PRO to unlock Sound Diagnosis and Expert Chat!")}
                        style={{ 
                            background: 'linear-gradient(45deg, #FFD700, #FFA500)', 
                            color: '#000', 
                            border: 'none',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 10px rgba(255, 215, 0, 0.3)'
                        }}
                    >
                        <Crown size={18} />
                        <span>PRO</span>
                    </button>

                    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
