import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plane, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import SignInModal from './SignInModal';
import SignUpModal from './SignUpModal';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkAuth();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('auth-change', checkAuth);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
  };

  const navLinks = [
    { name: 'Destinations', href: '/#destinations' },
    { name: 'Book Flight', href: '/#flight-search' },
    { name: 'Special Offers', href: '/special-offers' },
    { name: 'About Us', href: '/about' }
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-lg'
        : 'bg-transparent'
        }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${isScrolled ? 'bg-amber-500' : 'bg-amber-500'
              }`}>
              <Plane className="h-5 w-5 text-slate-900" />
            </div>
            <span className={`text-2xl font-bold transition-colors duration-300 ${isScrolled ? 'text-slate-900' : 'text-white'
              }`}>
              SkyLux
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`font-medium transition-colors duration-300 hover:text-amber-500 ${isScrolled ? 'text-slate-700' : 'text-white'
                  }`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <>
                <span className={`font-medium mr-2 ${isScrolled ? 'text-slate-700' : 'text-white'}`}>
                  Hello, {user.name.split(' ')[0]}
                </span>
                <Link to="/profile">
                  <Button variant="ghost" className={`font-medium transition-all duration-300 ${isScrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}>
                    Profile
                  </Button>
                </Link>
                <Link to="/my-bookings">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold transition-all duration-300">
                    My Bookings
                  </Button>
                </Link>
                <Button
                  variant={isScrolled ? "outline" : "ghost"}
                  onClick={handleLogout}
                  className={`font-medium transition-all duration-300 ${isScrolled
                    ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    : 'text-white hover:bg-white/10'
                    }`}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant={isScrolled ? "outline" : "ghost"}
                  onClick={() => setIsSignInOpen(true)}
                  className={`font-medium transition-all duration-300 ${isScrolled
                    ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    : 'text-white hover:bg-white/10'
                    }`}
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => setIsSignUpOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold transition-all duration-300"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 transition-colors duration-300 ${isScrolled ? 'text-slate-900' : 'text-white'
              }`}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 shadow-lg">
          <div className="container mx-auto px-6 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-slate-700 font-medium hover:text-amber-500 transition-colors duration-300"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 space-y-3 border-t border-slate-200">
              {user ? (
                <>
                  <div className="text-slate-700 font-medium pb-2">Hello, {user.name}</div>
                  <Link to="/my-bookings" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold">
                      My Bookings
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full border-slate-300 text-slate-700"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full border-slate-300 text-slate-700"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsSignInOpen(true);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsSignUpOpen(true);
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modals */}
      <SignInModal isOpen={isSignInOpen} onOpenChange={setIsSignInOpen} />
      <SignUpModal isOpen={isSignUpOpen} onOpenChange={setIsSignUpOpen} />
    </nav>
  );
};

export default Navbar;
