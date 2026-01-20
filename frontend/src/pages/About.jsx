import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSiteSettings } from '@/context/SiteSettingsContext';

const About = () => {
  const { settings } = useSiteSettings();
  const aboutSection = settings.about_section || {};

  const values = [
    {
      icon: Sparkles,
      title: 'Handcrafted Excellence',
      description: 'Every piece is meticulously crafted by hand, ensuring unique quality and attention to detail.'
    },
    {
      icon: Heart,
      title: 'Caribbean Soul',
      description: 'Our creations are inspired by the beauty, colors, and spirit of Barbados and the Caribbean.'
    },
    {
      icon: Leaf,
      title: 'Sustainable Luxury',
      description: 'We prioritize eco-friendly materials and sustainable practices in everything we create.'
    }
  ];

  // Split content by newlines for paragraphs
  const contentParagraphs = (aboutSection.content || '').split('\n\n').filter(Boolean);

  return (
    <div className="min-h-screen pt-20" data-testid="about-page">
      {/* Hero */}
      <section className="relative py-24 md:py-32 px-6 md:px-12 lg:px-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2E0235_0%,_#050505_70%)] opacity-50" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] mb-4 block">Our Story</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-tight mb-6">
              {aboutSection.title || 'Crafting Beauty,'}<br />
              <span className="text-[#40E0D0]">One Piece at a Time</span>
            </h1>
            <p className="text-[#A3A3A3] text-lg leading-relaxed">
              {contentParagraphs[0] || 'Perennia was born from a deep passion for artistry and the enchanting beauty of Barbados. What started as a personal creative journey has blossomed into a celebration of Caribbean craftsmanship.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] bg-[#1A1A1A] overflow-hidden">
                <img
                  src={aboutSection.image_url || 'https://images.unsplash.com/photo-1759794108525-94ff060da692?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBoYW5kbWFkZSUyMHNvYXAlMjBkYXJrJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3Njg5NDMzNDJ8MA&ixlib=rb-4.1.0&q=85'}
                  alt="Perennia artisan at work"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 border border-[#D4AF37]/30" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-serif text-white">
                The Heart Behind<br />Every Creation
              </h2>
              {contentParagraphs.slice(1).map((paragraph, index) => (
                <p key={index} className="text-[#A3A3A3] leading-relaxed">
                  {paragraph}
                </p>
              ))}
              {contentParagraphs.length <= 1 && (
                <>
                  <p className="text-[#A3A3A3] leading-relaxed">
                    Based in the vibrant island of Barbados, Perennia represents more than 
                    just handcrafted goods—it's a testament to the rich artistic heritage 
                    of the Caribbean. Each resin piece captures the turquoise waters of 
                    our beaches, each candle carries the warmth of our tropical sunsets.
                  </p>
                  <p className="text-[#A3A3A3] leading-relaxed">
                    Our body care line is crafted with natural ingredients, drawing from 
                    the healing traditions that have been passed down through generations. 
                    We believe that luxury should be accessible, sustainable, and deeply 
                    personal.
                  </p>
                </>
              )}
              <p className="font-accent text-xl text-[#D4AF37] italic">
                "{aboutSection.quote || 'Every piece tells a story of Caribbean beauty and timeless elegance.'}"
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Our Values</h2>
            <p className="text-[#A3A3A3]">The principles that guide everything we create</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-[#0F0F0F] p-8 border border-white/5 hover:border-[#D4AF37]/30 transition-colors duration-500"
              >
                <div className="w-12 h-12 border border-[#D4AF37] flex items-center justify-center mb-6">
                  <value.icon size={24} className="text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-serif text-white mb-3">{value.title}</h3>
                <p className="text-[#A3A3A3] text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-[#0F0F0F]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-6">
              Experience Caribbean Luxury
            </h2>
            <p className="text-[#A3A3A3] mb-8">
              Explore our collection and bring a piece of Barbados into your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="btn-primary px-8 py-3">
                <Link to="/shop">Shop Now</Link>
              </Button>
              <Button asChild variant="ghost" className="btn-secondary px-8 py-3">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
