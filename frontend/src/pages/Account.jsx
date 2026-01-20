import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, User, LogOut } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Account = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, getAuthHeaders } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API}/orders`, {
          headers: getAuthHeaders()
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate, getAuthHeaders]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: 'status-pending',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return classes[status] || 'status-pending';
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen pt-20" data-testid="account-page">
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-white">
              Hello, {user?.first_name}
            </h1>
            <p className="text-[#A3A3A3] mt-2">{user?.email}</p>
          </div>
          <Button onClick={handleLogout} variant="ghost" className="text-[#A3A3A3] hover:text-white">
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </motion.div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="bg-transparent border-b border-white/10 rounded-none w-full justify-start mb-8 p-0">
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-transparent data-[state=active]:text-[#D4AF37] data-[state=active]:border-b-2 data-[state=active]:border-[#D4AF37] rounded-none px-6 py-3 text-[#A3A3A3]"
            >
              <Package size={18} className="mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-transparent data-[state=active]:text-[#D4AF37] data-[state=active]:border-b-2 data-[state=active]:border-[#D4AF37] rounded-none px-6 py-3 text-[#A3A3A3]"
            >
              <User size={18} className="mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-[#0F0F0F] skeleton" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-[#0F0F0F] border border-white/5">
                <Package size={48} className="text-white/20 mx-auto mb-4" />
                <p className="text-[#A3A3A3] mb-6">No orders yet</p>
                <Button asChild className="btn-primary px-6 py-2">
                  <a href="/shop">Start Shopping</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0F0F0F] border border-white/5 p-6"
                    data-testid={`order-${order.id}`}
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                      <div>
                        <p className="text-xs text-[#A3A3A3] uppercase tracking-widest">Order ID</p>
                        <p className="text-white text-sm font-mono">{order.id.slice(0, 8)}...</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#A3A3A3] uppercase tracking-widest">Date</p>
                        <p className="text-white text-sm">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#A3A3A3] uppercase tracking-widest">Total</p>
                        <p className="text-[#D4AF37] font-serif">${order.total_bbd.toFixed(2)} BBD</p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 text-xs uppercase tracking-widest ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                        <span className={`px-3 py-1 text-xs uppercase tracking-widest ${
                          order.payment_status === 'paid' ? 'status-delivered' : 'status-pending'
                        }`}>
                          {order.payment_status}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="border-t border-white/5 pt-4 space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          {item.image && (
                            <div className="w-10 h-12 bg-[#1A1A1A] overflow-hidden flex-shrink-0">
                              <img src={item.image} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{item.product_name}</p>
                            <p className="text-xs text-[#A3A3A3]">
                              Qty: {item.quantity} × ${item.price_bbd.toFixed(2)} BBD
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="bg-[#0F0F0F] border border-white/5 p-6">
              <h3 className="text-lg font-serif text-white mb-6">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-[#A3A3A3] uppercase tracking-widest mb-1">First Name</p>
                  <p className="text-white">{user?.first_name}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A3A3A3] uppercase tracking-widest mb-1">Last Name</p>
                  <p className="text-white">{user?.last_name}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A3A3A3] uppercase tracking-widest mb-1">Email</p>
                  <p className="text-white">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A3A3A3] uppercase tracking-widest mb-1">Phone</p>
                  <p className="text-white">{user?.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Account;
