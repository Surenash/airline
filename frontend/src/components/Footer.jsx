import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Main Footer */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                <Plane className="h-6 w-6 text-slate-900" />
              </div>
              <span className="text-2xl font-bold text-white">SkyLux</span>
            </Link>
            <p className="text-slate-400 leading-relaxed">
              Experience luxury travel at its finest. Your journey begins with us.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-amber-500 hover:text-slate-900 transition-all duration-300"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'Book a Flight', to: '/#flight-search' },
                { label: 'My Bookings', to: '/my-bookings' },
                { label: 'Special Offers', to: '/special-offers' },
                { label: 'Destinations', to: '/#destinations' },
                { label: 'About Us', to: '/about' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-slate-400 hover:text-amber-500 transition-colors duration-300 inline-block hover:translate-x-1"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Support</h3>
            <ul className="space-y-3">
              {[
                { label: 'Help Center', to: '/help' },
                { label: 'Contact Us', to: '/contact' },
                { label: 'FAQ', to: '/faq' },
                { label: 'Terms & Conditions', to: '/terms' },
                { label: 'Privacy Policy', to: '/privacy' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-slate-400 hover:text-amber-500 transition-colors duration-300 inline-block hover:translate-x-1"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
                <span className="text-slate-400">
                  123 Aviation Boulevard<br />
                  Sky City, SC 12345
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <a href="tel:+1234567890" className="text-slate-400 hover:text-amber-500 transition-colors duration-300">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <a href="mailto:info@skylux.com" className="text-slate-400 hover:text-amber-500 transition-colors duration-300">
                  info@skylux.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © {currentYear} SkyLux Airlines. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="text-slate-400 hover:text-amber-500 transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-slate-400 hover:text-amber-500 transition-colors duration-300">
                Terms of Service
              </Link>
              <Link to="/help" className="text-slate-400 hover:text-amber-500 transition-colors duration-300">
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
