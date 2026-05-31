import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BrandLogo from './BrandLogo';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/inventory', label: 'Inventory' },
    { to: '/camps', label: 'Camps' },
    { to: '/stories', label: 'Stories' },
    { to: '/blood-banks', label: 'Blood Banks' },
    { to: '/guides', label: 'Guides' },
    { to: '/faq', label: 'FAQ' },
    { to: '/find-donor', label: 'Find Donor' },
    { to: '/request-blood', label: 'Request Blood' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/80 shadow-sm shadow-slate-200/60 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <BrandLogo className="text-xl font-bold" markClassName="h-9 w-9" onClick={() => setIsOpen(false)} />

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-white/70 p-1 text-sm font-bold text-slate-600 shadow-sm md:flex">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="rounded-full px-4 py-2 transition-colors hover:bg-red-50 hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link to="/dashboard" className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold transition hover:bg-slate-50">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="rounded-full bg-slate-950 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold transition hover:bg-slate-50">
                Login
              </Link>
              <Link to="/register" className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white shadow-lg shadow-red-100 transition hover:bg-red-700">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="border-t border-slate-100 bg-white p-4 shadow-xl md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                className="text-lg font-medium text-slate-700 hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-slate-100" />
            <div className="flex flex-col gap-3">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="flex justify-center rounded-xl border border-slate-200 bg-slate-50 py-3 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex justify-center rounded-xl bg-slate-800 py-3 font-medium text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="flex justify-center rounded-xl border border-slate-200 bg-slate-50 py-3 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="flex justify-center rounded-xl bg-primary py-3 font-medium text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
