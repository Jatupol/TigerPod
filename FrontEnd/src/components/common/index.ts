// client/src/components/common/index.ts
// Updated exports with all components

export { default as Layout } from './Layout';
export { default as Header } from './Header';
export { default as Footer } from './Footer';
export { default as Sidebar } from './Sidebar';
export { default as Navigation } from './Navigation';
export { default as Breadcrumb } from './Breadcrumb';
export { default as MobileMenu } from './MobileMenu';
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as NotificationSystem, NotificationProvider, useNotifications, useNotificationHelpers } from './NotificationSystem';
export { default as ProtectedRoute } from '../auth/ProtectedRoute';

// Export types from Navigation
export type { NavigationItem, NavigationSection } from './Navigation';

