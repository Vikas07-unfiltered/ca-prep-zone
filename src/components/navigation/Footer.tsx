
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary mb-4">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-white text-sm font-bold">CA</span>
              </div>
              <span>StudyHub</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              A comprehensive study platform for CA students.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-sm mb-3">Features</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/timer" className="text-muted-foreground hover:text-foreground">
                  Pomodoro Timer
                </Link>
              </li>
              <li>
                <Link to="/planner" className="text-muted-foreground hover:text-foreground">
                  Study Planner
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="text-muted-foreground hover:text-foreground">
                  Study Rooms
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-muted-foreground hover:text-foreground">
                  Resources
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-sm mb-3">Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="text-muted-foreground hover:text-foreground">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-muted-foreground hover:text-foreground">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-muted-foreground hover:text-foreground">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-sm mb-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/40 mt-8 pt-6 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CA StudyHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
