import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Menu, X, LayoutDashboard, BookOpen, BarChart, Timer, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedButton } from '@/components/ui/animated-button';
import Logo from '@/components/ui/Logo.svg?react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <motion.div
              whileHover={{ rotate: 5 }}
              className="w-10 h-10 flex items-center justify-center"
            >
              <Logo className="w-full h-full" />
            </motion.div>
            <span>Unfiltered CA</span>
          </Link>
        </motion.div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <motion.div whileHover={{ y: -2 }}>
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
          </motion.div>
          {user && (
            <>
              <motion.div whileHover={{ y: -2 }}>
                <Link to="/tools" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Tools</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }}>
                <Link to="/preparation" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>Preparation</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }}>
                <Link to="/forum" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <span>Discussion Forum</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }}>
                <Link to="/study-analysis" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <BarChart className="h-4 w-4" />
                  <span>Study Analysis</span>
                </Link>
              </motion.div>

              <motion.div whileHover={{ y: -2 }}>
                <Link to="/achievements" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  <span>Achievements</span>
                </Link>
              </motion.div>
            </>
          )}
        </nav>
        
        {/* User Menu */}
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 rounded-full border p-2 hover:bg-accent"
                >
                  <User className="h-5 w-5" />
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={signOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <AnimatedButton variant="ghost" hoverScale={1.05}>Sign In</AnimatedButton>
              </Link>
              <Link to="/register">
                <AnimatedButton hoverScale={1.08}>Get Started</AnimatedButton>
              </Link>
            </div>
          )}
          
          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="container md:hidden pb-4"
          >
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="flex flex-col gap-4"
            >
              <motion.div whileHover={{ x: 5 }}>
                <Link to="/" className="flex items-center gap-2 p-2 rounded-md hover:bg-accent" onClick={() => setIsMenuOpen(false)}>
                  Home
                </Link>
              </motion.div>
              {user && (
                <>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link to="/tools" className="flex items-center gap-2 p-2 rounded-md hover:bg-accent" onClick={() => setIsMenuOpen(false)}>
                      <LayoutDashboard className="h-5 w-5 text-primary" />
                      <span>Tools</span>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link to="/preparation" className="flex items-center gap-2 p-2 rounded-md hover:bg-accent" onClick={() => setIsMenuOpen(false)}>
  <BookOpen className="h-5 w-5 text-primary" />
  <span>Preparation</span>
</Link>
                  </motion.div>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link to="/forum" className="flex items-center gap-2 p-2 rounded-md hover:bg-accent" onClick={() => setIsMenuOpen(false)}>
                      <span>Discussion Forum</span>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link to="/study-analysis" className="flex items-center gap-2 p-2 rounded-md hover:bg-accent" onClick={() => setIsMenuOpen(false)}>
                      <BarChart className="h-5 w-5 text-primary" />
                      <span>Study Analysis</span>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link to="/achievements" className="flex items-center gap-2 p-2 rounded-md hover:bg-accent" onClick={() => setIsMenuOpen(false)}>
                      <Trophy className="h-5 w-5 text-primary" />
                      <span>Achievements</span>
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;