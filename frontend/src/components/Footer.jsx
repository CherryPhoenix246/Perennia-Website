import { Link, useLocation } from 'react-router-dom';
import { Instagram, Facebook, Mail, MapPin, Phone, Twitter, Youtube, MessageCircle } from 'lucide-react';
import { useSiteSettings } from '@/context/SiteSettingsContext';

const Footer = () => {
  const location = useLocation();
  const { settings } = useSiteSettings();
  const isAdmin = location.pathname.startsWith('/admin');
  if (isAdmin) return null;

  const socialLinks = settings.social_links || {};
  const contactInfo = settings.contact_info || {};

  const socialIcons = [
    { key: 'instagram', icon: Instagram, url: socialLinks.instagram },
    { key: 'facebook', icon: Facebook, url: socialLinks.facebook },
    { key: 'twitter', icon: Twitter, url: socialLinks.twitter },
    { key: 'youtube', icon: Youtube, url: socialLinks.youtube },
    { key: 'whatsapp', icon: MessageCircle, url: socialLinks.whatsapp ? `https://wa.me/${socialLinks.whatsapp.replace(/[^0-9]/g, '')}` : '' },
  ].filter(s => s.url);

  return (
    <footer className="bg-[var(--bg-paper)] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            {settings.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt={settings.business_name} 
                className="h-20 w-auto mb-6"
              />
            ) : (
              <h2 className="text-3xl font-serif text-[var(--brand-gold)] mb-6">{settings.business_name}</h2>
            )}
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-8">
              {settings.footer_text}
            </p>
            {socialIcons.length > 0 && (
              <div className="flex space-x-4">
                {socialIcons.map(({ key, icon: Icon, url }) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                    data-testid={`social-${key}`}
                  >
                    <Icon size={18} />
                  </a>
                ))}
                {contactInfo.email && (
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="social-icon"
                    data-testid="social-email"
                  >
                    <Mail size={18} />
                  </a>
                )}
              </div>
            )}
            {socialIcons.length === 0 && (
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
                  href={`mailto:${contactInfo.email || 'info@perennia.bb'}`}
                  className="social-icon"
                  data-testid="social-email"
                >
                  <Mail size={18} />
                </a>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[var(--text-primary)] mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/shop" className="text-[var(--text-secondary)] text-sm hover:text-[var(--brand-gold)] transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link to="/shop/resin" className="text-[var(--text-secondary)] text-sm hover:text-[var(--brand-gold)] transition-colors">
                  Resin Art
                </Link>
              </li>
              <li>
                <Link to="/shop/soaps" className="text-[var(--text-secondary)] text-sm hover:text-[var(--brand-gold)] transition-colors">
                  Body Care
                </Link>
              </li>
              <li>
                <Link to="/shop/candles" className="text-[var(--text-secondary)] text-sm hover:text-[var(--brand-gold)] transition-colors">
                  Candles
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[var(--text-primary)] mb-6">Company</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="text-[var(--text-secondary)] text-sm hover:text-[var(--brand-gold)] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[var(--text-secondary)] text-sm hover:text-[var(--brand-gold)] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/account" className="text-[var(--text-secondary)] text-sm hover:text-[var(--brand-gold)] transition-colors">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-[var(--text-primary)] mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-[var(--brand-gold)] flex-shrink-0 mt-0.5" />
                <span className="text-[var(--text-secondary)] text-sm">
                  {contactInfo.address || 'Bridgetown, Barbados'}
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-[var(--brand-gold)] flex-shrink-0" />
                <span className="text-[var(--text-secondary)] text-sm">{contactInfo.phone || '+1 (246) 123-4567'}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-[var(--brand-gold)] flex-shrink-0" />
                <span className="text-[var(--text-secondary)] text-sm">{contactInfo.email || 'info@perennia.bb'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center">
          <p className="text-[var(--text-muted)] text-xs">
            © {new Date().getFullYear()} {settings.business_name}. All rights reserved.
          </p>
          <p className="text-[var(--text-muted)] text-xs mt-4 md:mt-0">
            Prices shown in BBD & USD
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
