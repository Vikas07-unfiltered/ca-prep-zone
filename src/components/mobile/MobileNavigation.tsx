
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Book, MessageCircle, User, Timer } from 'lucide-react';

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/', icon: <Home size={18} />, label: 'Home' },
  { path: '/preparation', icon: <Book size={18} />, label: 'Study' },
  { path: '/forum', icon: <MessageCircle size={18} />, label: 'Forum' },
  { path: '/tools/timer', icon: <Timer size={18} />, label: 'Timer' },
  { path: '/profile', icon: <User size={18} />, label: 'Profile' },
];

export const MobileNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-50 md:hidden dark:bg-gray-900/95 dark:border-gray-700">
      <div className="flex justify-around items-center py-1 px-2 safe-area-inset-bottom">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200",
                "min-h-[44px] min-w-[44px] touch-manipulation flex-1 max-w-[80px]",
                "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary",
                isActive 
                  ? "text-primary bg-primary/10 scale-105" 
                  : "text-gray-600 hover:text-primary hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              )}
            >
              <div className="transition-transform duration-200">
                {item.icon}
              </div>
              <span className="text-xs mt-1 font-medium truncate w-full text-center">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
