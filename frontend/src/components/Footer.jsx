import { Link, useLocation } from 'react-router-dom';
import { Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  if (isAdmin) return null;

  return (
    <footer className="bg-[#0F0F0F] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <img 
              src="https://customer-assets.emergentagent.com/job_8aaf14c8-9661-4336-8e9d-83cf935f1bb7/artifacts/f1ti0xuj_Screenshot_20260120_173740_Canva.jpg" 
              alt="Perennia" 
              className="h-20 w-auto mb-6 mix-blend-lighten"
            />
            <p className="text-[#A3A3A3] text-sm leading-relaxed mb-8">
              Handcrafted luxury from Barbados. Each piece tells a story of Caribbean artistry and timeless elegance.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                data-testid="social-instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                data-testid="social-facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="mailto:info@perennia.bb"
                className="social-icon"
                data-testid="social-email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-white mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/shop" className="text-[#A3A3A3] text-sm hover:text-[#D4AF37] transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link to="/shop/resin" className="text-[#A3A3A3] text-sm hover:text-[#D4AF37] transition-colors">
                  Resin Art
                </Link>
              </li>
              <li>
                <Link to="/shop/soaps" className="text-[#A3A3A3] text-sm hover:text-[#D4AF37] transition-colors">
                  Body Care
                </Link>
              </li>
              <li>
                <Link to="/shop/candles" className="text-[#A3A3A3] text-sm hover:text-[#D4AF37] transition-colors">
                  Candles
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-white mb-6">Company</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="text-[#A3A3A3] text-sm hover:text-[#D4AF37] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#A3A3A3] text-sm hover:text-[#D4AF37] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/account" className="text-[#A3A3A3] text-sm hover:text-[#D4AF37] transition-colors">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-white mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span className="text-[#A3A3A3] text-sm">
                  Bridgetown, Barbados
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-[#D4AF37] flex-shrink-0" />
                <span className="text-[#A3A3A3] text-sm">+1 (246) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-[#D4AF37] flex-shrink-0" />
                <span className="text-[#A3A3A3] text-sm">info@perennia.bb</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center">
          <p className="text-[#525252] text-xs">
            © {new Date().getFullYear()} Perennia. All rights reserved.
          </p>
          <p className="text-[#525252] text-xs mt-4 md:mt-0">
            Prices shown in BBD & USD
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
