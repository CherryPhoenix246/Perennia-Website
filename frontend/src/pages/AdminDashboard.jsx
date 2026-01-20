import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  Settings,
  Palette,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Save,
  Image,
  Eye,
  EyeOff
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
          <Package size={24} className="text-[var(--brand-gold)] mb-4" />
          <p className="text-3xl font-serif text-white">{stats.products}</p>
          <p className="text-[#A3A3A3] text-sm">Products</p>
        </div>
        <div className="bg-[#0F0F0F] border border-white/5 p-6">
          <ShoppingCart size={24} className="text-[var(--brand-turquoise)] mb-4" />
          <p className="text-3xl font-serif text-white">{stats.orders}</p>
          <p className="text-[#A3A3A3] text-sm">Total Orders</p>
        </div>
        <div className="bg-[#0F0F0F] border border-white/5 p-6">
          <MessageSquare size={24} className="text-[var(--brand-purple-haze)] mb-4" />
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
    name: '', description: '', price_bbd: '', price_usd: '',
    category: 'resin', images: '', stock: '', featured: false
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

  useEffect(() => { fetchProducts(); }, []);

  const resetForm = () => {
    setFormData({ name: '', description: '', price_bbd: '', price_usd: '', category: 'resin', images: '', stock: '', featured: false });
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name, description: product.description,
      price_bbd: product.price_bbd.toString(), price_usd: product.price_usd.toString(),
      category: product.category, images: product.images.join(', '),
      stock: product.stock.toString(), featured: product.featured
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name, description: formData.description,
        price_bbd: parseFloat(formData.price_bbd), price_usd: parseFloat(formData.price_usd),
        category: formData.category, images: formData.images.split(',').map(s => s.trim()).filter(Boolean),
        stock: parseInt(formData.stock), featured: formData.featured
      };

      if (editingProduct) {
        await axios.put(`${API}/admin/products/${editingProduct.id}`, data, { headers: getAuthHeaders() });
        toast.success('Product updated!');
      } else {
        await axios.post(`${API}/admin/products`, data, { headers: getAuthHeaders() });
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
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`${API}/admin/products/${productId}`, { headers: getAuthHeaders() });
      toast.success('Product deleted!');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif text-white">Products</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="btn-primary px-4 py-2" data-testid="add-product-btn">
              <Plus size={18} className="mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0F0F0F] border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white font-serif">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription className="text-[#A3A3A3]">{editingProduct ? 'Update product details.' : 'Fill in product details.'}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <Input placeholder="Product Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="bg-transparent border-white/20 text-white" />
              <Textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required className="bg-transparent border-white/20 text-white min-h-[100px]" />
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" step="0.01" placeholder="Price BBD" value={formData.price_bbd} onChange={(e) => setFormData({ ...formData, price_bbd: e.target.value })} required className="bg-transparent border-white/20 text-white" />
                <Input type="number" step="0.01" placeholder="Price USD" value={formData.price_usd} onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })} required className="bg-transparent border-white/20 text-white" />
              </div>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="bg-transparent border-white/20 text-white"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent className="bg-[#0F0F0F] border-white/10">
                  <SelectItem value="resin">Resin Art & Décor</SelectItem>
                  <SelectItem value="soaps">Soaps, Lotions & Scrubs</SelectItem>
                  <SelectItem value="candles">Candles</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Image URLs (comma separated)" value={formData.images} onChange={(e) => setFormData({ ...formData, images: e.target.value })} required className="bg-transparent border-white/20 text-white" />
              <Input type="number" placeholder="Stock Quantity" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required className="bg-transparent border-white/20 text-white" />
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} className="w-4 h-4 accent-[var(--brand-gold)]" />
                <span className="text-white text-sm">Featured Product</span>
              </label>
              <Button type="submit" className="w-full btn-primary py-3">{editingProduct ? 'Update' : 'Create'} Product</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-[#0F0F0F] skeleton" />)}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-[#0F0F0F] border border-white/5"><p className="text-[#A3A3A3]">No products yet.</p></div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="bg-[#0F0F0F] border border-white/5 p-4 flex items-center gap-4">
              <div className="w-16 h-20 bg-[#1A1A1A] overflow-hidden flex-shrink-0">
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-medium truncate">{product.name}</h3>
                  {product.featured && <span className="px-2 py-0.5 bg-[var(--brand-gold)]/20 text-[var(--brand-gold)] text-xs">Featured</span>}
                </div>
                <p className="text-[#A3A3A3] text-sm">{product.category}</p>
                <p className="text-[var(--brand-gold)]">${product.price_bbd.toFixed(2)} BBD</p>
              </div>
              <div className="text-right"><p className="text-white text-sm">{product.stock} in stock</p></div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(product)} className="text-[#A3A3A3] hover:text-[var(--brand-gold)]"><Edit size={18} /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)} className="text-[#A3A3A3] hover:text-[#EF4444]"><Trash2 size={18} /></Button>
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
        const response = await axios.get(`${API}/admin/orders`, { headers: getAuthHeaders() });
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
      await axios.put(`${API}/admin/orders/${orderId}/status?status=${status}`, {}, { headers: getAuthHeaders() });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      toast.success('Status updated!');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const getStatusClass = (status) => {
    const classes = { pending: 'status-pending', processing: 'status-processing', shipped: 'status-shipped', delivered: 'status-delivered', cancelled: 'status-cancelled' };
    return classes[status] || 'status-pending';
  };

  return (
    <div>
      <h1 className="text-2xl font-serif text-white mb-8">Orders</h1>
      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-[#0F0F0F] skeleton" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-[#0F0F0F] border border-white/5"><p className="text-[#A3A3A3]">No orders yet.</p></div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-[#0F0F0F] border border-white/5 p-6">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div><p className="text-xs text-[#A3A3A3] uppercase">Order ID</p><p className="text-white text-sm font-mono">{order.id.slice(0, 8)}...</p></div>
                <div><p className="text-xs text-[#A3A3A3] uppercase">Customer</p><p className="text-white text-sm">{order.user_email}</p></div>
                <div><p className="text-xs text-[#A3A3A3] uppercase">Date</p><p className="text-white text-sm">{new Date(order.created_at).toLocaleDateString()}</p></div>
                <div><p className="text-xs text-[#A3A3A3] uppercase">Total</p><p className="text-[var(--brand-gold)] font-serif">${order.total_bbd.toFixed(2)} BBD</p></div>
                <div><p className="text-xs text-[#A3A3A3] uppercase">Payment</p><span className={`px-2 py-1 text-xs uppercase ${order.payment_status === 'paid' ? 'status-delivered' : 'status-pending'}`}>{order.payment_status}</span></div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className={`px-3 py-1 text-xs uppercase ${getStatusClass(order.status)}`}>{order.status}</span>
                <Select value={order.status} onValueChange={(value) => updateStatus(order.id, value)}>
                  <SelectTrigger className="w-40 bg-transparent border-white/20 text-white text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0F0F0F] border-white/10">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 text-sm">
                <p className="text-[#A3A3A3]">Ship to: {order.shipping_address}, {order.city}, {order.postal_code}, {order.country}</p>
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
        const response = await axios.get(`${API}/admin/contacts`, { headers: getAuthHeaders() });
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
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-[#0F0F0F] skeleton" />)}</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12 bg-[#0F0F0F] border border-white/5"><p className="text-[#A3A3A3]">No messages yet.</p></div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="bg-[#0F0F0F] border border-white/5 p-6">
              <div className="flex justify-between items-start mb-4">
                <div><h3 className="text-white font-medium">{msg.subject}</h3><p className="text-[#A3A3A3] text-sm">From: {msg.name} ({msg.email})</p></div>
                <span className="text-xs text-[#525252]">{new Date(msg.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-[#A3A3A3] text-sm">{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Color Picker Component
const ColorPicker = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded">
    <span className="text-white text-sm">{label}</span>
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 bg-transparent border-white/20 text-white text-xs font-mono"
      />
    </div>
  </div>
);

// Site Settings Management
const SiteSettingsManagement = () => {
  const { settings, updateSettings, refreshSettings } = useSiteSettings();
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');
  const [formData, setFormData] = useState({
    business_name: '', tagline: '', logo_url: '', footer_text: '',
    social_links: { instagram: '', facebook: '', twitter: '', tiktok: '', whatsapp: '', youtube: '', pinterest: '' },
    contact_info: { address: '', phone: '', email: '' },
    hero_section: { tagline: '', title: '', subtitle: '', description: '', image_url: '' },
    about_section: { title: '', content: '', quote: '', image_url: '' },
    theme_colors: { primary: '#D4AF37', secondary: '#40E0D0', accent: '#4A0E5C', background: '#050505', surface: '#0F0F0F', text_primary: '#F5F5F5', text_secondary: '#A3A3A3' },
    layout_settings: { show_hero: true, show_categories: true, show_featured: true, show_about_snippet: true, show_newsletter: true, navbar_style: 'glass', footer_style: 'full', product_card_style: 'default' }
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        business_name: settings.business_name || '',
        tagline: settings.tagline || '',
        logo_url: settings.logo_url || '',
        footer_text: settings.footer_text || '',
        social_links: { ...formData.social_links, ...settings.social_links },
        contact_info: { ...formData.contact_info, ...settings.contact_info },
        hero_section: { ...formData.hero_section, ...settings.hero_section },
        about_section: { ...formData.about_section, ...settings.about_section },
        theme_colors: { ...formData.theme_colors, ...settings.theme_colors },
        layout_settings: { ...formData.layout_settings, ...settings.layout_settings }
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(formData, token);
      refreshSettings();
      toast.success('Settings saved! Changes applied to site.');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const presetThemes = [
    { name: 'Gold Luxury (Default)', colors: { primary: '#D4AF37', secondary: '#40E0D0', accent: '#4A0E5C', background: '#050505', surface: '#0F0F0F', text_primary: '#F5F5F5', text_secondary: '#A3A3A3' } },
    { name: 'Rose Gold', colors: { primary: '#B76E79', secondary: '#F8E8E0', accent: '#8B4557', background: '#1A1A1A', surface: '#252525', text_primary: '#FFFFFF', text_secondary: '#CCCCCC' } },
    { name: 'Ocean Blue', colors: { primary: '#4A90A4', secondary: '#7DD3C8', accent: '#2C5F6E', background: '#0A1929', surface: '#132F4C', text_primary: '#FFFFFF', text_secondary: '#B2BAC2' } },
    { name: 'Forest Green', colors: { primary: '#4CAF50', secondary: '#81C784', accent: '#2E7D32', background: '#0D1F0D', surface: '#1A2E1A', text_primary: '#FFFFFF', text_secondary: '#A5D6A7' } },
    { name: 'Sunset Purple', colors: { primary: '#9C27B0', secondary: '#E040FB', accent: '#6A1B9A', background: '#12001A', surface: '#1E0029', text_primary: '#FFFFFF', text_secondary: '#CE93D8' } },
    { name: 'Clean White', colors: { primary: '#1976D2', secondary: '#42A5F5', accent: '#0D47A1', background: '#FAFAFA', surface: '#FFFFFF', text_primary: '#212121', text_secondary: '#757575' } }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif text-white">Site Settings</h1>
        <Button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2" data-testid="save-settings-btn">
          <Save size={18} className="mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent border-b border-white/10 rounded-none w-full justify-start mb-8 p-0 flex-wrap">
          <TabsTrigger value="branding" className="data-[state=active]:bg-transparent data-[state=active]:text-[var(--brand-gold)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--brand-gold)] rounded-none px-4 py-3 text-[#A3A3A3]">
            <Image size={16} className="mr-2" /> Branding
          </TabsTrigger>
          <TabsTrigger value="theme" className="data-[state=active]:bg-transparent data-[state=active]:text-[var(--brand-gold)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--brand-gold)] rounded-none px-4 py-3 text-[#A3A3A3]">
            <Palette size={16} className="mr-2" /> Colors
          </TabsTrigger>
          <TabsTrigger value="layout" className="data-[state=active]:bg-transparent data-[state=active]:text-[var(--brand-gold)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--brand-gold)] rounded-none px-4 py-3 text-[#A3A3A3]">
            <LayoutDashboard size={16} className="mr-2" /> Layout
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-transparent data-[state=active]:text-[var(--brand-gold)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--brand-gold)] rounded-none px-4 py-3 text-[#A3A3A3]">
            Social
          </TabsTrigger>
          <TabsTrigger value="contact" className="data-[state=active]:bg-transparent data-[state=active]:text-[var(--brand-gold)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--brand-gold)] rounded-none px-4 py-3 text-[#A3A3A3]">
            Contact
          </TabsTrigger>
          <TabsTrigger value="hero" className="data-[state=active]:bg-transparent data-[state=active]:text-[var(--brand-gold)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--brand-gold)] rounded-none px-4 py-3 text-[#A3A3A3]">
            Hero
          </TabsTrigger>
          <TabsTrigger value="about" className="data-[state=active]:bg-transparent data-[state=active]:text-[var(--brand-gold)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--brand-gold)] rounded-none px-4 py-3 text-[#A3A3A3]">
            About
          </TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding">
          <div className="bg-[#0F0F0F] border border-white/5 p-6 space-y-6">
            <div>
              <label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">Business Name</label>
              <Input value={formData.business_name} onChange={(e) => setFormData({ ...formData, business_name: e.target.value })} className="bg-transparent border-white/20 text-white" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">Tagline</label>
              <Input value={formData.tagline} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} className="bg-transparent border-white/20 text-white" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">Logo URL</label>
              <Input value={formData.logo_url} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} placeholder="https://example.com/logo.png" className="bg-transparent border-white/20 text-white" />
              {formData.logo_url && (
                <div className="mt-4 p-4 bg-[#1A1A1A] flex items-center gap-4">
                  <p className="text-xs text-[#A3A3A3]">Preview:</p>
                  <img src={formData.logo_url} alt="Logo Preview" className="h-16 w-auto mix-blend-lighten" />
                </div>
              )}
              <p className="text-xs text-[#525252] mt-2">Tip: Upload your logo to a free image host like Imgur or use any direct image URL.</p>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">Footer Text</label>
              <Textarea value={formData.footer_text} onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })} className="bg-transparent border-white/20 text-white min-h-[100px]" />
            </div>
          </div>
        </TabsContent>

        {/* Theme Colors Tab */}
        <TabsContent value="theme">
          <div className="space-y-6">
            {/* Preset Themes */}
            <div className="bg-[#0F0F0F] border border-white/5 p-6">
              <h3 className="text-white text-sm uppercase tracking-widest mb-4">Quick Theme Presets</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {presetThemes.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setFormData({ ...formData, theme_colors: preset.colors })}
                    className="p-3 border border-white/10 hover:border-[var(--brand-gold)]/50 transition-colors text-left"
                  >
                    <div className="flex gap-1 mb-2">
                      {[preset.colors.primary, preset.colors.secondary, preset.colors.accent, preset.colors.background].map((color, i) => (
                        <div key={i} className="w-6 h-6 rounded" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    <p className="text-white text-xs">{preset.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="bg-[#0F0F0F] border border-white/5 p-6">
              <h3 className="text-white text-sm uppercase tracking-widest mb-4">Custom Colors</h3>
              <div className="space-y-3">
                <ColorPicker label="Primary (Buttons, Accents)" value={formData.theme_colors.primary} onChange={(v) => setFormData({ ...formData, theme_colors: { ...formData.theme_colors, primary: v } })} />
                <ColorPicker label="Secondary (Highlights)" value={formData.theme_colors.secondary} onChange={(v) => setFormData({ ...formData, theme_colors: { ...formData.theme_colors, secondary: v } })} />
                <ColorPicker label="Accent (Decorative)" value={formData.theme_colors.accent} onChange={(v) => setFormData({ ...formData, theme_colors: { ...formData.theme_colors, accent: v } })} />
                <ColorPicker label="Background" value={formData.theme_colors.background} onChange={(v) => setFormData({ ...formData, theme_colors: { ...formData.theme_colors, background: v } })} />
                <ColorPicker label="Surface (Cards)" value={formData.theme_colors.surface} onChange={(v) => setFormData({ ...formData, theme_colors: { ...formData.theme_colors, surface: v } })} />
                <ColorPicker label="Text Primary" value={formData.theme_colors.text_primary} onChange={(v) => setFormData({ ...formData, theme_colors: { ...formData.theme_colors, text_primary: v } })} />
                <ColorPicker label="Text Secondary" value={formData.theme_colors.text_secondary} onChange={(v) => setFormData({ ...formData, theme_colors: { ...formData.theme_colors, text_secondary: v } })} />
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-[#0F0F0F] border border-white/5 p-6">
              <h3 className="text-white text-sm uppercase tracking-widest mb-4">Live Preview</h3>
              <div className="p-6 rounded" style={{ backgroundColor: formData.theme_colors.background }}>
                <div className="p-4 rounded mb-4" style={{ backgroundColor: formData.theme_colors.surface }}>
                  <h4 style={{ color: formData.theme_colors.text_primary }} className="font-serif text-lg mb-2">Sample Card Title</h4>
                  <p style={{ color: formData.theme_colors.text_secondary }} className="text-sm mb-3">This is how your text will look with the selected colors.</p>
                  <button style={{ backgroundColor: formData.theme_colors.primary, color: formData.theme_colors.background }} className="px-4 py-2 text-sm font-medium">
                    Sample Button
                  </button>
                </div>
                <div className="flex gap-2">
                  <span style={{ color: formData.theme_colors.primary }} className="text-sm">Primary</span>
                  <span style={{ color: formData.theme_colors.secondary }} className="text-sm">Secondary</span>
                  <span style={{ color: formData.theme_colors.accent }} className="text-sm">Accent</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout">
          <div className="bg-[#0F0F0F] border border-white/5 p-6 space-y-6">
            <h3 className="text-white text-sm uppercase tracking-widest mb-4">Homepage Sections</h3>
            <p className="text-[#A3A3A3] text-sm mb-6">Toggle which sections appear on your homepage.</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded">
                <div className="flex items-center gap-3">
                  {formData.layout_settings.show_hero ? <Eye size={18} className="text-[var(--brand-gold)]" /> : <EyeOff size={18} className="text-[#525252]" />}
                  <Label className="text-white">Hero Section</Label>
                </div>
                <Switch checked={formData.layout_settings.show_hero} onCheckedChange={(v) => setFormData({ ...formData, layout_settings: { ...formData.layout_settings, show_hero: v } })} />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded">
                <div className="flex items-center gap-3">
                  {formData.layout_settings.show_categories ? <Eye size={18} className="text-[var(--brand-gold)]" /> : <EyeOff size={18} className="text-[#525252]" />}
                  <Label className="text-white">Category Cards</Label>
                </div>
                <Switch checked={formData.layout_settings.show_categories} onCheckedChange={(v) => setFormData({ ...formData, layout_settings: { ...formData.layout_settings, show_categories: v } })} />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded">
                <div className="flex items-center gap-3">
                  {formData.layout_settings.show_featured ? <Eye size={18} className="text-[var(--brand-gold)]" /> : <EyeOff size={18} className="text-[#525252]" />}
                  <Label className="text-white">Featured Products</Label>
                </div>
                <Switch checked={formData.layout_settings.show_featured} onCheckedChange={(v) => setFormData({ ...formData, layout_settings: { ...formData.layout_settings, show_featured: v } })} />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded">
                <div className="flex items-center gap-3">
                  {formData.layout_settings.show_about_snippet ? <Eye size={18} className="text-[var(--brand-gold)]" /> : <EyeOff size={18} className="text-[#525252]" />}
                  <Label className="text-white">About Snippet</Label>
                </div>
                <Switch checked={formData.layout_settings.show_about_snippet} onCheckedChange={(v) => setFormData({ ...formData, layout_settings: { ...formData.layout_settings, show_about_snippet: v } })} />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded">
                <div className="flex items-center gap-3">
                  {formData.layout_settings.show_newsletter ? <Eye size={18} className="text-[var(--brand-gold)]" /> : <EyeOff size={18} className="text-[#525252]" />}
                  <Label className="text-white">Newsletter Section</Label>
                </div>
                <Switch checked={formData.layout_settings.show_newsletter} onCheckedChange={(v) => setFormData({ ...formData, layout_settings: { ...formData.layout_settings, show_newsletter: v } })} />
              </div>
            </div>

            <h3 className="text-white text-sm uppercase tracking-widest mt-8 mb-4">Style Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">Navbar Style</label>
                <Select value={formData.layout_settings.navbar_style} onValueChange={(v) => setFormData({ ...formData, layout_settings: { ...formData.layout_settings, navbar_style: v } })}>
                  <SelectTrigger className="bg-transparent border-white/20 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0F0F0F] border-white/10">
                    <SelectItem value="glass">Glass (Blur Effect)</SelectItem>
                    <SelectItem value="solid">Solid Background</SelectItem>
                    <SelectItem value="transparent">Transparent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">Footer Style</label>
                <Select value={formData.layout_settings.footer_style} onValueChange={(v) => setFormData({ ...formData, layout_settings: { ...formData.layout_settings, footer_style: v } })}>
                  <SelectTrigger className="bg-transparent border-white/20 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0F0F0F] border-white/10">
                    <SelectItem value="full">Full (All Sections)</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social">
          <div className="bg-[#0F0F0F] border border-white/5 p-6 space-y-6">
            <p className="text-[#A3A3A3] text-sm mb-4">Enter your social media profile URLs. Leave blank to hide.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">Instagram</label><Input value={formData.social_links.instagram} onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, instagram: e.target.value } })} placeholder="https://instagram.com/yourusername" className="bg-transparent border-white/20 text-white" /></div>
              <div><label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">Facebook</label><Input value={formData.social_links.facebook} onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, facebook: e.target.value } })} placeholder="https://facebook.com/yourpage" className="bg-transparent border-white/20 text-white" /></div>
              <div><label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">Twitter / X</label><Input value={formData.social_links.twitter} onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, twitter: e.target.value } })} placeholder="https://twitter.com/yourusername" className="bg-transparent border-white/20 text-white" /></div>
              <div><label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">TikTok</label><Input value={formData.social_links.tiktok} onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, tiktok: e.target.value } })} placeholder="https://tiktok.com/@yourusername" className="bg-transparent border-white/20 text-white" /></div>
              <div><label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">WhatsApp Number</label><Input value={formData.social_links.whatsapp} onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, whatsapp: e.target.value } })} placeholder="+1246XXXXXXX" className="bg-transparent border-white/20 text-white" /></div>
              <div><label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">YouTube</label><Input value={formData.social_links.youtube} onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, youtube: e.target.value } })} placeholder="https://youtube.com/@yourchannel" className="bg-transparent border-white/20 text-white" /></div>
            </div>
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <div className="bg-[#0F0F0F] border border-white/5 p-6 space-y-6">
            <div><label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">Business Address</label><Textarea value={formData.contact_info.address} onChange={(e) => setFormData({ ...formData, contact_info: { ...formData.contact_info, address: e.target.value } })} placeholder="Bridgetown, Barbados" className="bg-transparent border-white/20 text-white" /></div>
            <div><label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">Phone Number</label><Input value={formData.contact_info.phone} onChange={(e) => setFormData({ ...formData, contact_info: { ...formData.contact_info, phone: e.target.value } })} placeholder="+1 (246) 123-4567" className="bg-transparent border-white/20 text-white" /></div>
            <div><label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">Email Address</label><Input value={formData.contact_info.email} onChange={(e) => setFormData({ ...formData, contact_info: { ...formData.contact_info, email: e.target.value } })} placeholder="info@perennia.bb" className="bg-transparent border-white/20 text-white" /></div>
          </div>
        </TabsContent>

        {/* Hero Tab */}
        <TabsContent value="hero">
          <div className="bg-[#0F0F0F] border border-white/5 p-6 space-y-6">
            <p className="text-[#A3A3A3] text-sm mb-4">Customize the homepage hero section.</p>
            <div><label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">Tagline</label><Input value={formData.hero_section.tagline} onChange={(e) => setFormData({ ...formData, hero_section: { ...formData.hero_section, tagline: e.target.value } })} placeholder="Handcrafted in Barbados" className="bg-transparent border-white/20 text-white" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">Title (Line 1)</label><Input value={formData.hero_section.title} onChange={(e) => setFormData({ ...formData, hero_section: { ...formData.hero_section, title: e.target.value } })} placeholder="Luxury Artisan" className="bg-transparent border-white/20 text-white" /></div>
              <div><label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">Subtitle (Line 2)</label><Input value={formData.hero_section.subtitle} onChange={(e) => setFormData({ ...formData, hero_section: { ...formData.hero_section, subtitle: e.target.value } })} placeholder="Gifts & Décor" className="bg-transparent border-white/20 text-white" /></div>
            </div>
            <div><label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">Description</label><Textarea value={formData.hero_section.description} onChange={(e) => setFormData({ ...formData, hero_section: { ...formData.hero_section, description: e.target.value } })} className="bg-transparent border-white/20 text-white min-h-[100px]" /></div>
            <div><label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">Background Image URL</label><Input value={formData.hero_section.image_url} onChange={(e) => setFormData({ ...formData, hero_section: { ...formData.hero_section, image_url: e.target.value } })} className="bg-transparent border-white/20 text-white" /></div>
          </div>
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about">
          <div className="bg-[#0F0F0F] border border-white/5 p-6 space-y-6">
            <div><label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">Section Title</label><Input value={formData.about_section.title} onChange={(e) => setFormData({ ...formData, about_section: { ...formData.about_section, title: e.target.value } })} className="bg-transparent border-white/20 text-white" /></div>
            <div><label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">Content</label><Textarea value={formData.about_section.content} onChange={(e) => setFormData({ ...formData, about_section: { ...formData.about_section, content: e.target.value } })} className="bg-transparent border-white/20 text-white min-h-[200px]" /></div>
            <div><label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">Quote</label><Input value={formData.about_section.quote} onChange={(e) => setFormData({ ...formData, about_section: { ...formData.about_section, quote: e.target.value } })} className="bg-transparent border-white/20 text-white" /></div>
            <div><label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">Image URL</label><Input value={formData.about_section.image_url} onChange={(e) => setFormData({ ...formData, about_section: { ...formData.about_section, image_url: e.target.value } })} className="bg-transparent border-white/20 text-white" /></div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Main Admin Dashboard
const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) navigate('/admin/login');
  }, [isAuthenticated, isAdmin, navigate]);

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' }
  ];

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="min-h-screen flex" data-testid="admin-dashboard">
      <aside className="admin-sidebar w-64 flex-shrink-0 fixed left-0 top-0 bottom-0 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <Link to="/">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={settings.business_name} className="h-12 w-auto mix-blend-lighten" />
            ) : (
              <span className="text-xl font-serif text-[var(--brand-gold)]">{settings.business_name}</span>
            )}
          </Link>
          <p className="text-[#525252] text-xs uppercase tracking-widest mt-2">Admin Panel</p>
        </div>
        <nav className="flex-1 py-6">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`admin-nav-item flex items-center space-x-3 ${location.pathname === item.path ? 'active' : ''}`}>
              <item.icon size={18} /><span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#A3A3A3]">{user?.email}</span>
            <button onClick={handleLogout} className="text-[#A3A3A3] hover:text-white transition-colors"><LogOut size={18} /></button>
          </div>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-8">
        <Routes>
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="products" element={<ProductsManagement />} />
          <Route path="orders" element={<OrdersManagement />} />
          <Route path="messages" element={<MessagesManagement />} />
          <Route path="settings" element={<SiteSettingsManagement />} />
          <Route path="*" element={<DashboardOverview />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
