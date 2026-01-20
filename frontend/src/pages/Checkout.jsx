import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, FileText, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalBBD, totalUSD, clearCart } = useCart();
  const { isAuthenticated, getAuthHeaders } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shipping_address: '',
    city: '',
    postal_code: '',
    country: 'Barbados',
    phone: '',
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      // Create order
      const orderData = {
        items: items.map(({ product, quantity }) => ({
          product_id: product.id,
          quantity
        })),
        ...formData,
        payment_method: paymentMethod
      };

      const orderResponse = await axios.post(`${API}/orders`, orderData, {
        headers: getAuthHeaders()
      });

      const order = orderResponse.data;

      if (paymentMethod === 'stripe') {
        // Create Stripe checkout session
        const checkoutResponse = await axios.post(
          `${API}/checkout/create-session`,
          {
            order_id: order.id,
            origin_url: window.location.origin
          },
          { headers: getAuthHeaders() }
        );

        // Redirect to Stripe
        window.location.href = checkoutResponse.data.url;
      } else {
        // Simple order form - mark as pending
        clearCart();
        toast.success('Order placed! We will contact you for payment.');
        navigate('/account');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to place order');
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center" data-testid="checkout-page">
        <div className="text-center px-6">
          <h1 className="text-2xl font-serif text-white mb-4">Please Login</h1>
          <p className="text-[#A3A3A3] mb-8">You need to be logged in to checkout.</p>
          <Button asChild className="btn-primary px-8 py-3">
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center" data-testid="checkout-page">
        <div className="text-center px-6">
          <h1 className="text-2xl font-serif text-white mb-4">Your cart is empty</h1>
          <Button asChild className="btn-primary px-8 py-3">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20" data-testid="checkout-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-12">
        <Link
          to="/cart"
          className="inline-flex items-center text-[#A3A3A3] text-sm hover:text-[#D4AF37] transition-colors mb-8"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Cart
        </Link>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-serif text-white mb-12"
        >
          Checkout
        </motion.h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Shipping & Payment */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0F0F0F] p-6 border border-white/5"
              >
                <h2 className="text-lg font-serif text-white mb-6">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      name="shipping_address"
                      placeholder="Street Address"
                      value={formData.shipping_address}
                      onChange={handleChange}
                      required
                      className="form-input border border-white/20 px-4"
                      data-testid="shipping-address"
                    />
                  </div>
                  <Input
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="form-input border border-white/20 px-4"
                    data-testid="city"
                  />
                  <Input
                    name="postal_code"
                    placeholder="Postal Code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    required
                    className="form-input border border-white/20 px-4"
                    data-testid="postal-code"
                  />
                  <Input
                    name="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="form-input border border-white/20 px-4"
                    data-testid="country"
                  />
                  <Input
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="form-input border border-white/20 px-4"
                    data-testid="phone"
                  />
                  <div className="md:col-span-2">
                    <Textarea
                      name="notes"
                      placeholder="Order Notes (optional)"
                      value={formData.notes}
                      onChange={handleChange}
                      className="bg-transparent border-white/20 text-white min-h-[80px]"
                      data-testid="notes"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#0F0F0F] p-6 border border-white/5"
              >
                <h2 className="text-lg font-serif text-white mb-6">Payment Method</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={`p-4 border transition-colors flex items-center space-x-3 ${
                      paymentMethod === 'stripe'
                        ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    data-testid="payment-stripe"
                  >
                    <CreditCard size={24} className={paymentMethod === 'stripe' ? 'text-[#D4AF37]' : 'text-white/60'} />
                    <div className="text-left">
                      <p className="text-white text-sm">Pay with Card</p>
                      <p className="text-[#A3A3A3] text-xs">Secure payment via Stripe</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('form')}
                    className={`p-4 border transition-colors flex items-center space-x-3 ${
                      paymentMethod === 'form'
                        ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    data-testid="payment-form"
                  >
                    <FileText size={24} className={paymentMethod === 'form' ? 'text-[#D4AF37]' : 'text-white/60'} />
                    <div className="text-left">
                      <p className="text-white text-sm">Request Invoice</p>
                      <p className="text-[#A3A3A3] text-xs">We'll contact you for payment</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#0F0F0F] p-6 border border-white/5 sticky top-28">
                <h2 className="text-lg font-serif text-white mb-6">Order Summary</h2>

                {/* Items */}
                <div className="space-y-4 mb-6">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex gap-3">
                      <div className="w-12 h-14 bg-[#1A1A1A] overflow-hidden flex-shrink-0">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{product.name}</p>
                        <p className="text-xs text-[#A3A3A3]">Qty: {quantity}</p>
                      </div>
                      <p className="text-sm text-white">
                        ${(product.price_bbd * quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A3A3A3]">Subtotal</span>
                    <span className="text-white">${totalBBD.toFixed(2)} BBD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A3A3A3]">Shipping</span>
                    <span className="text-white">TBD</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mt-4">
                  <div className="flex justify-between">
                    <span className="text-white uppercase tracking-widest text-sm">Total</span>
                    <div className="text-right">
                      <p className="text-xl font-serif text-[#D4AF37]">
                        ${totalBBD.toFixed(2)} BBD
                      </p>
                      <p className="text-sm text-[#A3A3A3]">
                        ${totalUSD.toFixed(2)} USD
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-4 mt-6"
                  data-testid="place-order-btn"
                >
                  {loading ? 'Processing...' : paymentMethod === 'stripe' ? 'Pay Now' : 'Place Order'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
