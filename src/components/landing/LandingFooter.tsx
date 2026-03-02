import React from 'react';
import { Link } from 'react-router-dom';

export const LandingFooter = () => {
    return (
        <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">

                {/* Brand Logo */}
                <div className="md:col-span-2 space-y-6">
                    <Link to="/" className="text-2xl font-display font-semibold tracking-tight text-slate-900 flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-secondary to-accent flex items-center justify-center text-white text-lg font-bold shadow-md">
                            M
                        </div>
                        MindLens
                    </Link>
                    <p className="text-slate-500 max-w-sm leading-relaxed">
                        AI Student Wellbeing Analyzer — decoding mental health through real-time emotion tracking and AI empathy.
                    </p>
                </div>

                {/* Navigation Links */}
                <div className="space-y-6">
                    <h4 className="font-semibold text-slate-900">Platform</h4>
                    <ul className="space-y-4 text-slate-500">
                        <li><a href="#features" className="hover:text-secondary transition-colors">Features</a></li>
                        <li><a href="#protocol" className="hover:text-secondary transition-colors">How it works</a></li>
                        <li><a href="#philosophy" className="hover:text-secondary transition-colors">Privacy</a></li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="space-y-6 flex flex-col items-start">
                    <h4 className="font-semibold text-slate-900">Access</h4>
                    <Link
                        to="/auth"
                        className="bg-secondary text-white hover:bg-blue-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 px-8 py-3 rounded-full text-base font-semibold tracking-wide"
                    >
                        Login to Dashboard
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
                <p>&copy; {new Date().getFullYear()} MindLens. All rights reserved.</p>
                <div className="flex gap-6">
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">
                        GitHub
                    </a>
                </div>
            </div>
        </footer>
    );
};
