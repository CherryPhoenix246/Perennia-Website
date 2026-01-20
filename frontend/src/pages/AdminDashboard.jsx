import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Dashboard Overview
const DashboardOverview = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, messages: 0 });
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [products, orders, messages] = await Promise.all([
          axios.get(`${API}/products`),
          axios.get(`${API}/admin/orders`, { headers: getAuthHeaders() }),
          axios.get(`${API}/admin/contacts`, { headers: getAuthHeaders() })
        ]);
        setStats({
          products: products.data.length,
          orders: orders.data.length,
          messages: messages.data.filter(m => !m.read).length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, [getAuthHeaders]);

  return (
    <div>
      <h1 className="text-2xl font-serif text-white mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0F0F0F] border border-white/5 p-6">
          <Package size={24} className="text-[#D4AF37] mb-4" />
          <p className="text-3xl font-serif text-white">{stats.products}</p>
          <p className="text-[#A3A3A3] text-sm">Products</p>
        </div>
        <div className="bg-[#0F0F0F] border border-white/5 p-6">
          <ShoppingCart size={24} className="text-[#40E0D0] mb-4" />
          <p className="text-3xl font-serif text-white">{stats.orders}</p>
          <p className="text-[#A3A3A3] text-sm">Total Orders</p>
        </div>
        <div className="bg-[#0F0F0F] border border-white/5 p-6">
          <MessageSquare size={24} className="text-[#4A0E5C] mb-4" />
          <p className="text-3xl font-serif text-white">{stats.messages}</p>
          <p className="text-[#A3A3A3] text-sm">Unread Messages</p>
        </div>
      </div>
    </div>
  );
};

// Products Management
const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { getAuthHeaders } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_bbd: '',
    price_usd: '',
    category: 'resin',
    images: '',
    stock: '',
    featured: false
  });

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price_bbd: '',
      price_usd: '',
      category: 'resin',
      images: '',
      stock: '',
      featured: false
    });
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price_bbd: product.price_bbd.toString(),
      price_usd: product.price_usd.toString(),
      category: product.category,
      images: product.images.join(', '),
      stock: product.stock.toString(),
      featured: product.featured
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        description: formData.description,
        price_bbd: parseFloat(formData.price_bbd),
        price_usd: parseFloat(formData.price_usd),
        category: formData.category,
        images: formData.images.split(',').map(s => s.trim()).filter(Boolean),
        stock: parseInt(formData.stock),
        featured: formData.featured
      };

      if (editingProduct) {
        await axios.put(
          `${API}/admin/products/${editingProduct.id}`,
          data,
          { headers: getAuthHeaders() }
        );
        toast.success('Product updated!');
      } else {
        await axios.post(
          `${API}/admin/products`,
          data,
          { headers: getAuthHeaders() }
        );
        toast.success('Product created!');
      }
      
      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save product');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${API}/admin/products/${productId}`, {
        headers: getAuthHeaders()
      });
      toast.success('Product deleted!');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif text-white">Products</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="btn-primary px-4 py-2" data-testid="add-product-btn">
              <Plus size={18} className="mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0F0F0F] border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white font-serif">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
              <DialogDescription className="text-[#A3A3A3]">
                {editingProduct ? 'Update the product details below.' : 'Fill in the product details below.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <Input
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-transparent border-white/20 text-white"
                data-testid="product-name"
              />
              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="bg-transparent border-white/20 text-white min-h-[100px]"
                data-testid="product-description"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Price BBD"
                  value={formData.price_bbd}
                  onChange={(e) => setFormData({ ...formData, price_bbd: e.target.value })}
                  required
                  className="bg-transparent border-white/20 text-white"
                  data-testid="product-price-bbd"
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Price USD"
                  value={formData.price_usd}
                  onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })}
                  required
                  className="bg-transparent border-white/20 text-white"
                  data-testid="product-price-usd"
                />
              </div>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-transparent border-white/20 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F0F0F] border-white/10">
                  <SelectItem value="resin">Resin Art & Décor</SelectItem>
                  <SelectItem value="soaps">Soaps, Lotions & Scrubs</SelectItem>
                  <SelectItem value="candles">Candles</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Image URLs (comma separated)"
                value={formData.images}
                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                required
                className="bg-transparent border-white/20 text-white"
                data-testid="product-images"
              />
              <Input
                type="number"
                placeholder="Stock Quantity"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
                className="bg-transparent border-white/20 text-white"
                data-testid="product-stock"
              />
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 accent-[#D4AF37]"
                />
                <span className="text-white text-sm">Featured Product</span>
              </label>
              <Button type="submit" className="w-full btn-primary py-3" data-testid="save-product-btn">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-[#0F0F0F] skeleton" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-[#0F0F0F] border border-white/5">
          <p className="text-[#A3A3A3]">No products yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-[#0F0F0F] border border-white/5 p-4 flex items-center gap-4"
              data-testid={`admin-product-${product.id}`}
            >
              <div className="w-16 h-20 bg-[#1A1A1A] overflow-hidden flex-shrink-0">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-medium truncate">{product.name}</h3>
                  {product.featured && (
                    <span className="px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] text-xs">Featured</span>
                  )}
                </div>
                <p className="text-[#A3A3A3] text-sm">{product.category}</p>
                <p className="text-[#D4AF37]">${product.price_bbd.toFixed(2)} BBD</p>
              </div>
              <div className="text-right">
                <p className="text-white text-sm">{product.stock} in stock</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(product)}
                  className="text-[#A3A3A3] hover:text-[#D4AF37]"
                >
                  <Edit size={18} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                  className="text-[#A3A3A3] hover:text-[#EF4444]"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Orders Management
const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API}/admin/orders`, {
          headers: getAuthHeaders()
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [getAuthHeaders]);

  const updateStatus = async (orderId, status) => {
    try {
      await axios.put(
        `${API}/admin/orders/${orderId}/status?status=${status}`,
        {},
        { headers: getAuthHeaders() }
      );
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      toast.success('Status updated!');
    } catch (error) {
      toast.error('Failed to update status');
    }
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

  return (
    <div>
      <h1 className="text-2xl font-serif text-white mb-8">Orders</h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-[#0F0F0F] skeleton" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-[#0F0F0F] border border-white/5">
          <p className="text-[#A3A3A3]">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-[#0F0F0F] border border-white/5 p-6"
              data-testid={`admin-order-${order.id}`}
            >
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <p className="text-xs text-[#A3A3A3] uppercase">Order ID</p>
                  <p className="text-white text-sm font-mono">{order.id.slice(0, 8)}...</p>
                </div>
                <div>
                  <p className="text-xs text-[#A3A3A3] uppercase">Customer</p>
                  <p className="text-white text-sm">{order.user_email}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A3A3A3] uppercase">Date</p>
                  <p className="text-white text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A3A3A3] uppercase">Total</p>
                  <p className="text-[#D4AF37] font-serif">${order.total_bbd.toFixed(2)} BBD</p>
                </div>
                <div>
                  <p className="text-xs text-[#A3A3A3] uppercase">Payment</p>
                  <span className={`px-2 py-1 text-xs uppercase ${
                    order.payment_status === 'paid' ? 'status-delivered' : 'status-pending'
                  }`}>
                    {order.payment_status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 text-xs uppercase ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <Select
                  value={order.status}
                  onValueChange={(value) => updateStatus(order.id, value)}
                >
                  <SelectTrigger className="w-40 bg-transparent border-white/20 text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0F0F0F] border-white/10">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Shipping Address */}
              <div className="mt-4 pt-4 border-t border-white/5 text-sm">
                <p className="text-[#A3A3A3]">
                  Ship to: {order.shipping_address}, {order.city}, {order.postal_code}, {order.country}
                </p>
                <p className="text-[#A3A3A3]">Phone: {order.phone}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Messages
const MessagesManagement = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API}/admin/contacts`, {
          headers: getAuthHeaders()
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [getAuthHeaders]);

  return (
    <div>
      <h1 className="text-2xl font-serif text-white mb-8">Contact Messages</h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-[#0F0F0F] skeleton" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12 bg-[#0F0F0F] border border-white/5">
          <p className="text-[#A3A3A3]">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-[#0F0F0F] border border-white/5 p-6"
              data-testid={`admin-message-${msg.id}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white font-medium">{msg.subject}</h3>
                  <p className="text-[#A3A3A3] text-sm">From: {msg.name} ({msg.email})</p>
                </div>
                <span className="text-xs text-[#525252]">
                  {new Date(msg.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-[#A3A3A3] text-sm">{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Admin Dashboard
const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: MessageSquare, label: 'Messages', path: '/admin/messages' }
  ];

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex" data-testid="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar w-64 flex-shrink-0 fixed left-0 top-0 bottom-0 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <Link to="/">
            <img 
              src="https://customer-assets.emergentagent.com/job_8aaf14c8-9661-4336-8e9d-83cf935f1bb7/artifacts/f1ti0xuj_Screenshot_20260120_173740_Canva.jpg" 
              alt="Perennia" 
              className="h-12 w-auto"
            />
          </Link>
          <p className="text-[#525252] text-xs uppercase tracking-widest mt-2">Admin Panel</p>
        </div>

        <nav className="flex-1 py-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item flex items-center space-x-3 ${
                location.pathname === item.path ? 'active' : ''
              }`}
            >
              <item.icon size={18} />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#A3A3A3]">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-[#A3A3A3] hover:text-white transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <Routes>
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="products" element={<ProductsManagement />} />
          <Route path="orders" element={<OrdersManagement />} />
          <Route path="messages" element={<MessagesManagement />} />
          <Route path="*" element={<DashboardOverview />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
