import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, User, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CartDrawer from './CartDrawer';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, setIsOpen } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const { settings } = useSiteSettings();
  const location = useLocation();

  const isAdmin = location.pathname.startsWith('/admin');
  if (isAdmin) return null;

  const navLinks = [
    { name: 'Shop', href: '/shop' },
    { name: 'Resin Art', href: '/shop/resin' },
    { name: 'Body Care', href: '/shop/soaps' },
    { name: 'Candles', href: '/shop/candles' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <nav className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center" data-testid="logo-link">
              {settings.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt={settings.business_name} 
                  className="h-14 w-auto mix-blend-lighten"
                />
              ) : (
                <span className="text-2xl font-serif text-[#D4AF37] tracking-wider">
                  {settings.business_name}
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-xs uppercase tracking-widest text-white/80 hover:text-[#D4AF37] transition-colors duration-300"
                  data-testid={`nav-${link.name.toLowerCase().replace(' ', '-')}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right side icons */}
            <div className="flex items-center space-x-6">
              {/* Account */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-1 text-white/80 hover:text-[#D4AF37] transition-colors">
                    <User size={20} />
                    <span className="hidden md:inline text-xs uppercase tracking-widest">
                      {user?.first_name}
                    </span>
                    <ChevronDown size={14} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#0F0F0F] border-white/10">
                    <DropdownMenuItem asChild>
                      <Link to="/account" className="text-white hover:text-[#D4AF37]" data-testid="account-link">
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={logout}
                      className="text-white hover:text-[#D4AF37] cursor-pointer"
                      data-testid="logout-btn"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  to="/login"
                  className="text-white/80 hover:text-[#D4AF37] transition-colors"
                  data-testid="login-link"
                >
                  <User size={20} />
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={() => setIsOpen(true)}
                className="relative text-white/80 hover:text-[#D4AF37] transition-colors"
                data-testid="cart-button"
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#D4AF37] text-black text-xs flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-white/80 hover:text-[#D4AF37] transition-colors"
                data-testid="mobile-menu-btn"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-[#0F0F0F] border-t border-white/5"
            >
              <div className="px-6 py-8 space-y-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm uppercase tracking-widest text-white/80 hover:text-[#D4AF37] transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CartDrawer />
    </>
  );
};

export default Navbar;
