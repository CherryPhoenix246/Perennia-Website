import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      toast.success('Account created successfully!');
      navigate('/account');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center" data-testid="register-page">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md px-6 py-12"
      >
        <div className="bg-[#0F0F0F] p-8 md:p-12 border border-white/5">
          <h1 className="text-3xl font-serif text-white mb-2">Create Account</h1>
          <p className="text-[#A3A3A3] mb-8">Join the Perennia family</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                name="first_name"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="form-input border border-white/20 px-4"
                data-testid="register-firstname"
              />
              <Input
                type="text"
                name="last_name"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="form-input border border-white/20 px-4"
                data-testid="register-lastname"
              />
            </div>
            <Input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input border border-white/20 px-4"
              data-testid="register-email"
            />
            <Input
              type="tel"
              name="phone"
              placeholder="Phone Number (optional)"
              value={formData.phone}
              onChange={handleChange}
              className="form-input border border-white/20 px-4"
              data-testid="register-phone"
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="form-input border border-white/20 px-4"
              data-testid="register-password"
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4"
              data-testid="register-submit"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-[#A3A3A3] text-sm text-center mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-[#D4AF37] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
