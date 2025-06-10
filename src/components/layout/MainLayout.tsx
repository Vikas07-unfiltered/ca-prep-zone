
import { ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/navigation/Footer';
import PageTransition from './PageTransition';
import { MobileNavigation } from '@/components/mobile/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <main className={cn(
        "flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8",
        isMobile ? "pb-20" : "pb-4"
      )}>
        <AnimatePresence mode="wait">
          <PageTransition>{children}</PageTransition>
        </AnimatePresence>
      </main>
      {!isMobile && <Footer />}
      {isMobile && <MobileNavigation />}
    </div>
  );
};

export default MainLayout;
