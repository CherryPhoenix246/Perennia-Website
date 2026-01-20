import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      if (user.is_admin) {
        toast.success('Welcome, Admin!');
        navigate('/admin/dashboard');
      } else {
        toast.error('Admin access required');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-[#050505]" data-testid="admin-login-page">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md px-6"
      >
        <div className="bg-[#0F0F0F] p-8 md:p-12 border border-white/5">
          <div className="text-center mb-8">
            <img 
              src="https://customer-assets.emergentagent.com/job_8aaf14c8-9661-4336-8e9d-83cf935f1bb7/artifacts/f1ti0xuj_Screenshot_20260120_173740_Canva.jpg" 
              alt="Perennia" 
              className="h-16 w-auto mx-auto mb-2"
            />
            <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em]">Admin Portal</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="email"
                name="email"
                placeholder="Admin Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input border border-white/20 px-4"
                data-testid="admin-email"
              />
            </div>
            <div>
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input border border-white/20 px-4"
                data-testid="admin-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4"
              data-testid="admin-login-submit"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-[#525252] text-xs text-center mt-8">
            Admin access only. Unauthorized access is prohibited.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
