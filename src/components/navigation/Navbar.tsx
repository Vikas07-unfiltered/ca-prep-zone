
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  User,
  Clock,
  Calendar,
  Users,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xl font-bold text-primary"
        >
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white text-sm font-bold">CA</span>
          </div>
          <span>StudyHub</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/timer" 
            className="text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <Clock className="h-4 w-4" />
            <span>Timer</span>
          </Link>
          <Link 
            to="/planner" 
            className="text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <Calendar className="h-4 w-4" />
            <span>Planner</span>
          </Link>
          <Link 
            to="/rooms" 
            className="text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <Users className="h-4 w-4" />
            <span>Study Rooms</span>
          </Link>
          <Link 
            to="/resources" 
            className="text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <BookOpen className="h-4 w-4" />
            <span>Resources</span>
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm" className="hidden md:flex">
              Sign Up
            </Button>
          </Link>
          
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="container md:hidden pb-4">
          <nav className="flex flex-col gap-4">
            <Link 
              to="/timer" 
              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              <Clock className="h-5 w-5 text-primary" />
              <span>Timer</span>
            </Link>
            <Link 
              to="/planner" 
              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              <Calendar className="h-5 w-5 text-primary" />
              <span>Planner</span>
            </Link>
            <Link 
              to="/rooms" 
              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              <Users className="h-5 w-5 text-primary" />
              <span>Study Rooms</span>
            </Link>
            <Link 
              to="/resources" 
              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Resources</span>
            </Link>
            <div className="flex gap-2 mt-2">
              <Link to="/login" className="w-full" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link to="/register" className="w-full" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full">Sign Up</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
