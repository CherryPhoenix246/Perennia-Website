import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/contact`, formData);
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20" data-testid="contact-page">
      {/* Header */}
      <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24 bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">Get in Touch</h1>
            <p className="text-[#A3A3A3] max-w-xl mx-auto">
              Have a question or want to place a custom order? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-serif text-white mb-6">Contact Information</h2>
                <p className="text-[#A3A3A3] leading-relaxed">
                  Based in beautiful Barbados, Perennia creates handcrafted luxury items 
                  with Caribbean love. Reach out for custom orders, wholesale inquiries, 
                  or just to say hello!
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Visit Us</h3>
                    <p className="text-[#A3A3A3] text-sm">
                      Bridgetown, Barbados<br />
                      Caribbean
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
                    <Phone size={20} className="text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Call Us</h3>
                    <p className="text-[#A3A3A3] text-sm">+1 (246) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
                    <Mail size={20} className="text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Email Us</h3>
                    <p className="text-[#A3A3A3] text-sm">info@perennia.bb</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#0F0F0F] p-8 border border-white/5"
            >
              <h2 className="text-2xl font-serif text-white mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input border border-white/20 px-4"
                    data-testid="contact-name"
                  />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-input border border-white/20 px-4"
                    data-testid="contact-email"
                  />
                </div>
                <Input
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="form-input border border-white/20 px-4"
                  data-testid="contact-subject"
                />
                <Textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="bg-transparent border-white/20 text-white min-h-[150px]"
                  data-testid="contact-message"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-8 py-3"
                  data-testid="contact-submit"
                >
                  {loading ? 'Sending...' : (
                    <>
                      Send Message
                      <Send size={16} className="ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
