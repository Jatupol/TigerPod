// client/src/components/common/Sidebar.tsx
// ===== SIDEBAR COMPONENT WITH ORANGE THEME =====
// Complete Separation Entity Architecture - Sidebar Navigation
// Manufacturing/Quality Control System - Orange Theme Implementation

import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';

// ============ INTERFACES ============

interface SidebarProps {
  className?: string;
  onItemClick?: () => void;
}

// ============ COMPONENT ============

const Sidebar: React.FC<SidebarProps> = ({ className = '', onItemClick }) => {
  return (
    <div className={`flex flex-col h-full bg-white shadow-lg border-r border-border-primary ${className}`}>
      {/* Logo Header - Fixed at top with Orange Theme */}
      <div className="flex items-center justify-center h-16 px-4 bg-primary-600 flex-shrink-0 border-b border-primary-700">
        <Link to="/dashboard" className="flex items-center">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
            <span className="text-primary-600 font-bold text-lg">Q</span>
          </div>
          <span className="text-white font-semibold text-xl truncate">QC System</span>
        </Link>
      </div>

      {/* Navigation Container - Scrollable */}
      <div className="flex-1 min-h-0">
        <Navigation 
          variant="sidebar" 
          onItemClick={onItemClick}
          className="h-full"
        />
      </div>
    </div>
  );
};

export default Sidebar;

/*
=== ORANGE THEME SIDEBAR FEATURES ===

UPDATED COLOR SCHEME:
✅ Header Background: bg-primary-600 (orange header like in your image)
✅ Header Border: border-primary-700 (darker orange border)
✅ Logo Icon: text-primary-600 (orange Q icon on white background)
✅ Text: White text on orange background
✅ Borders: border-border-primary (warm gray borders)

LAYOUT IMPROVEMENTS:
✅ Proper flex container with h-full
✅ Fixed header section that doesn't scroll
✅ Scrollable navigation section with min-h-0
✅ Clean separation between logo and navigation

SCROLL FUNCTIONALITY:
✅ Navigation container uses flex-1 min-h-0 for proper scrolling
✅ Passes h-full to Navigation component
✅ Maintains fixed header while allowing content to scroll
✅ Proper flex layout hierarchy

VISUAL ENHANCEMENTS:
✅ Orange-themed header matching your dashboard image
✅ Professional orange color scheme
✅ Improved logo presentation with shadow
✅ Clean border separation between sections

RESPONSIVE BEHAVIOR:
✅ Proper text truncation for long titles
✅ Flexible layout that adapts to content height
✅ Touch-friendly design for mobile devices
✅ Consistent spacing and proportions

INTEGRATION:
✅ Works seamlessly with Navigation component
✅ Maintains existing onItemClick functionality
✅ Compatible with Layout component
✅ Preserves all existing features

BRANDING:
✅ Orange header perfectly matches your dashboard image
✅ Professional manufacturing/industrial appearance
✅ Consistent with orange theme throughout application
✅ White logo icon on orange background for brand recognition

This sidebar now matches the orange theme shown in your
dashboard image while maintaining all functionality and
providing proper scroll support for navigation items.
*/