
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
  { path: '/', icon: <Home size={20} />, label: 'Home' },
  { path: '/preparation', icon: <Book size={20} />, label: 'Study' },
  { path: '/forum', icon: <MessageCircle size={20} />, label: 'Forum' },
  { path: '/pomodoro', icon: <Timer size={20} />, label: 'Timer' },
  { path: '/profile', icon: <User size={20} />, label: 'Profile' },
];

export const MobileNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
                "min-h-[48px] min-w-[48px] touch-manipulation",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-gray-600 hover:text-primary"
              )}
            >
              {item.icon}
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
