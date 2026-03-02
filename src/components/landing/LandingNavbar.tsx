import React from 'react';
import { Link } from 'react-router-dom';

export const LandingNavbar = () => {
    return (
        <div className="fixed top-4 left-0 right-0 z-50 pointer-events-none px-4 md:px-6 flex justify-center">
            <nav className="pointer-events-auto w-full max-w-7xl clear-glass flex items-center justify-between px-6 py-4 rounded-[2rem] shadow-sm">

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link to="/" className="text-xl font-display font-semibold tracking-tight text-slate-900 flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary to-accent flex items-center justify-center text-white text-sm font-bold shadow-md">
                            M
                        </div>
                        MindLens
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
                    <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
                    <a href="#philosophy" className="hover:text-slate-900 transition-colors">Privacy</a>
                    <a href="#protocol" className="hover:text-slate-900 transition-colors">How it Works</a>
                </div>

                {/* CTAs */}
                <div className="flex items-center gap-4">
                    <Link
                        to="/auth"
                        className="bg-secondary text-white hover:bg-blue-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide"
                    >
                        Login to Dashboard
                    </Link>
                </div>

            </nav>
        </div>
    );
};
