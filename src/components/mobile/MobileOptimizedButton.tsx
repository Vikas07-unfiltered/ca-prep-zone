
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileOptimizedButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export const MobileOptimizedButton: React.FC<MobileOptimizedButtonProps> = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <Button
      className={cn(
        "min-h-[48px] px-6 text-base font-medium touch-manipulation",
        "active:scale-95 transition-all duration-150 ease-in-out",
        "focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};
