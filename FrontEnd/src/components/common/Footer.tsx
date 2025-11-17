// client/src/components/common/Footer.tsx
// ===== FOOTER COMPONENT WITH ORANGE THEME =====
// Complete Separation Entity Architecture - Self-contained Footer component
// Manufacturing/Quality Control System - Orange Theme Implementation

import React from 'react';

// ============ INTERFACES ============

interface FooterProps {
  className?: string;
}

// ============ COMPONENT ============

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`
      bg-background-primary border-t border-border-primary py-6 mt-auto
      ${className}
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          {/* Left Section */}
          <div className="flex items-center space-x-4 text-sm text-text-secondary">
            <span>&copy; {currentYear} Quality Control System</span>
            <span className="hidden sm:block">•</span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-primary-400 rounded-full mr-2 animate-pulse-orange"></div>
              System Status: Online
            </span>
          </div>
          
          {/* Right Section - Navigation Links */}
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <button className="text-sm text-text-secondary hover:text-primary-600 transition-colors duration-200">
              Support
            </button>
            <button className="text-sm text-text-secondary hover:text-primary-600 transition-colors duration-200">
              Documentation
            </button>
            <button className="text-sm text-text-secondary hover:text-primary-600 transition-colors duration-200">
              Settings
            </button>
          </div>
        </div>
        
        {/* Bottom Section - Version Info */}
        <div className="mt-4 pt-4 border-t border-border-primary">
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-text-tertiary">
            <div className="flex items-center space-x-4">
              <span>Version 2.1.0</span>
              <span className="hidden sm:block">•</span>
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
            
            {/* System Info */}
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
              <span className="flex items-center">
                <svg className="w-3 h-3 text-primary-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                All systems operational
              </span>
              <span className="hidden sm:block">•</span>
              <span className="text-primary-600 font-medium">
                Uptime: 99.9%
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

 
 