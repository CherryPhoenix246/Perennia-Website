import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import ProductCard from '@/components/ProductCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSiteSettings();

  const heroSection = settings.hero_section || {};
  const aboutSection = settings.about_section || {};

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await axios.get(`${API}/products?featured=true`);
        setFeaturedProducts(response.data.slice(0, 6));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const categories = [
    {
      name: 'Resin Art',
      description: 'Handcrafted décor & gifts',
      image: 'https://images.unsplash.com/photo-1718635310388-880694939769?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwyfHxyZXNpbiUyMGFydCUyMGRlY29yJTIwZ29sZCUyMHR1cnF1b2lzZXxlbnwwfHx8fDE3Njg5NDMzNDZ8MA&ixlib=rb-4.1.0&q=85',
      href: '/shop/resin'
    },
    {
      name: 'Body Care',
      description: 'Soaps, lotions & scrubs',
      image: 'https://images.unsplash.com/photo-1622116500760-1753e5973ec7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBoYW5kbWFkZSUyMHNvYXAlMjBkYXJrJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3Njg5NDMzNDJ8MA&ixlib=rb-4.1.0&q=85',
      href: '/shop/soaps'
    },
    {
      name: 'Candles',
      description: 'Artisan scented candles',
      image: 'https://images.unsplash.com/photo-1668086682339-f14262879c18?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwc2NlbnRlZCUyMGNhbmRsZSUyMGRhcmslMjBtb29kJTIwZ29sZHxlbnwwfHx8fDE3Njg5NDMzNDR8MA&ixlib=rb-4.1.0&q=85',
      href: '/shop/candles'
    }
  ];

  const heroImage = heroSection.image_url || 'https://images.unsplash.com/photo-1668086682339-f14262879c18?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwc2NlbnRlZCUyMGNhbmRsZSUyMGRhcmslMjBtb29kJTIwZ29sZHxlbnwwfHx8fDE3Njg5NDMzNDR8MA&ixlib=rb-4.1.0&q=85';

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Perennia Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/40 to-[#050505]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center space-x-2 text-[#D4AF37] text-xs uppercase tracking-[0.3em] mb-6">
              <Sparkles size={14} />
              <span>{heroSection.tagline || 'Handcrafted in Barbados'}</span>
              <Sparkles size={14} />
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-serif text-white leading-tight mb-8"
          >
            {heroSection.title || 'Luxury Artisan'}<br />
            <span className="text-[#D4AF37]">{heroSection.subtitle || 'Gifts & Décor'}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[#A3A3A3] text-base md:text-lg max-w-2xl mx-auto mb-10"
          >
            {heroSection.description || 'Discover our collection of handcrafted resin art, natural body care, and artisan candles. Each piece crafted with love and Caribbean spirit.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button asChild className="btn-primary px-10 py-4">
              <Link to="/shop" data-testid="shop-now-btn">
                Shop Collection
                <ArrowRight size={18} className="ml-2" />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="btn-secondary px-10 py-4">
              <Link to="/about">Our Story</Link>
            </Button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border border-white/30 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-[#D4AF37] rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Our Collections</h2>
            <p className="text-[#A3A3A3]">Explore our handcrafted categories</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Link
                  to={category.href}
                  className="category-card block relative aspect-[3/4] overflow-hidden group"
                  data-testid={`category-${category.name.toLowerCase().replace(' ', '-')}`}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                    <h3 className="text-2xl font-serif text-white mb-2">{category.name}</h3>
                    <p className="text-[#A3A3A3] text-sm mb-4">{category.description}</p>
                    <span className="inline-flex items-center text-[#D4AF37] text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform duration-300">
                      Explore <ArrowRight size={14} className="ml-2" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-16"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Featured Pieces</h2>
              <p className="text-[#A3A3A3]">Handpicked favorites from our collection</p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center text-[#D4AF37] text-xs uppercase tracking-widest mt-6 md:mt-0 hover:translate-x-2 transition-transform duration-300"
            >
              View All <ArrowRight size={14} className="ml-2" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="products-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[4/5] bg-[#1A1A1A] skeleton" />
                  <div className="h-4 bg-[#1A1A1A] skeleton w-3/4" />
                  <div className="h-4 bg-[#1A1A1A] skeleton w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Snippet */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] mb-6 block">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-serif text-white mb-6 leading-tight">
                {aboutSection.title || 'Crafted with Love, Inspired by the Caribbean'}
              </h2>
              <p className="text-[#A3A3A3] leading-relaxed mb-8">
                {aboutSection.content?.split('\n')[0] || 'Perennia was born from a passion for artistry and a deep love for Barbados. Each piece we create tells a story of Caribbean beauty—from the turquoise waters to the golden sunsets. We believe in sustainable craftsmanship and bringing luxury into everyday moments.'}
              </p>
              <Button asChild className="btn-secondary px-8 py-3">
                <Link to="/about">Learn More</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-[#1A1A1A] overflow-hidden">
                <img
                  src={aboutSection.image_url || 'https://images.unsplash.com/photo-1620567645328-99d8d4b6d4e5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBoYW5kbWFkZSUyMHNvYXAlMjBkYXJrJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3Njg5NDMzNDJ8MA&ixlib=rb-4.1.0&q=85'}
                  alt="Perennia Craftsmanship"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-[#D4AF37]/30" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-[#0F0F0F]">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Stay Connected</h2>
            <p className="text-[#A3A3A3] mb-8">
              Subscribe for exclusive offers and new collection updates
            </p>
            <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 form-input bg-transparent border border-white/20 px-6 py-4 text-white placeholder:text-white/30 focus:border-[#D4AF37] transition-colors"
                data-testid="newsletter-email"
              />
              <Button type="submit" className="btn-primary px-8 py-4" data-testid="newsletter-submit">
                Subscribe
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
