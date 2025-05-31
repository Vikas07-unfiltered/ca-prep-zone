
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
              <li>
                <Link to="/forum" className="text-muted-foreground hover:text-foreground">
                  Discussion Forum
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
                <Link to="/help-center" className="text-muted-foreground hover:text-foreground">Help Center</Link>
              </li>
              <li>
                <Link to="/contact-us" className="text-muted-foreground hover:text-foreground">Contact Us</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
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
          {/* LinkedIn */}
          <a href="https://linkedin.com/company/unfiltered-ca" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-muted-foreground hover:text-foreground transition-colors"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M7 10v7"/><circle cx="7" cy="7" r="1.1"/><path d="M10 17v-4a2 2 0 0 1 4 0v4"/><path d="M14 13v4"/></svg>
          </a>
          {/* YouTube */}
          <a href="https://youtube.com/@unfiltered-ca07?si=X8Od_FglcVQ4BdVx" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-muted-foreground hover:text-foreground transition-colors"><rect x="3" y="6" width="18" height="12" rx="4"/><path d="M10 9.5v5l5-2.5-5-2.5z"/></svg>
          </a>
        </div>
        <div className="flex justify-center mt-8 mb-4">
          {/* Feedback & Suggestion Box */}
          <FeedbackDialog />
        </div>
        <div className="border-t border-border/40 pt-6 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CA Unfiltered CA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// --- Feedback & Suggestion Dialog ---
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

function FeedbackDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Phone number is required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('feedback').insert([
        { name, email, phone, message }
      ]);
      if (error) {
        setError('Failed to submit feedback. Please try again.');
        setLoading(false);
        return;
      }
      setSubmitted(true);
      setLoading(false);
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
      }, 2000);
    } catch (err) {
      setError('An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-medium">
          Feedback & Suggestions
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feedback & Suggestions</DialogTitle>
          <DialogDescription>
            We value your input! Please share your feedback or suggest new features/resources.
          </DialogDescription>
        </DialogHeader>
        {submitted ? (
          <div className="py-8 text-center text-green-600 font-medium">Thank you for your feedback!</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Your Name (optional)"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <Input
              type="email"
              placeholder="Your Email (optional)"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Input
              type="tel"
              placeholder="Your Phone Number (required)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
            <Textarea
              placeholder="Your feedback or suggestion..."
              required
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
            {error && <div className="text-red-500 text-sm pb-2">{error}</div>}
            <DialogFooter>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-medium"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default Footer;


