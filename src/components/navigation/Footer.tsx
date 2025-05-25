
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Footer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Handler to check auth and redirect if not logged in
  const requireAuth = (path: string) => (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      navigate('/login');
    }
  };
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary mb-4">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-white text-sm font-bold">CA</span>
              </div>
              <span>Unfiltered CA</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              A comprehensive study platform for CA students.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-sm mb-3">Features</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/timer" className="text-muted-foreground hover:text-foreground" onClick={requireAuth('/timer')}>
                  Pomodoro Timer
                </Link>
              </li>
              <li>
                <Link to="/planner" className="text-muted-foreground hover:text-foreground" onClick={requireAuth('/planner')}>
                  Study Planner
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="text-muted-foreground hover:text-foreground" onClick={requireAuth('/rooms')}>
                  Study Rooms
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-muted-foreground hover:text-foreground" onClick={requireAuth('/resources')}>
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
        
        <div className="flex justify-center gap-6 mt-8 mb-2">
          {/* Instagram */}
          <a href="https://www.instagram.com/unfiltered_ca/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-muted-foreground hover:text-foreground transition-colors"><rect width="18" height="18" x="3" y="3" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>
          </a>
          {/* Telegram */}
          <a href="https://t.me/+pUMu05Vk-EEwZDFl" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-muted-foreground hover:text-foreground transition-colors"><path d="M21 3L3.5 10.5c-.7.3-.7 1.3 0 1.6l4.3 1.4 1.4 4.3c.3.7 1.3.7 1.6 0L21 3z"/><path d="M8.5 15.5l2.5 2.5c.4.4 1.1.2 1.2-.4l.7-3.2"/></svg>
          </a>
          {/* X (Twitter) */}
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="X">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-muted-foreground hover:text-foreground transition-colors"><path d="M17.5 6.5l-11 11"/><path d="M6.5 6.5l11 11"/></svg>
          </a>
          {/* YouTube */}
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-muted-foreground hover:text-foreground transition-colors"><rect x="3" y="6" width="18" height="12" rx="4"/><path d="M10 9.5v5l5-2.5-5-2.5z"/></svg>
          </a>
        </div>
        <div className="border-t border-border/40 pt-6 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CA Unfiltered CA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
