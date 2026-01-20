import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, X, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Button } from '@/components/ui/button';

const Cart = () => {
  const { items, removeItem, updateQuantity, totalBBD, totalUSD } = useCart();
  const { currency, formatPrice, getPrice } = useCurrency();

  const displayTotal = currency === 'USD' ? totalUSD : totalBBD;

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center" data-testid="cart-page">
        <div className="text-center px-6">
          <ShoppingBag size={64} className="text-white/20 mx-auto mb-6" />
          <h1 className="text-2xl font-serif text-[var(--text-primary)] mb-4">Your cart is empty</h1>
          <p className="text-[var(--text-secondary)] mb-8">Looks like you haven't added anything yet.</p>
          <Button asChild className="btn-primary px-8 py-3">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20" data-testid="cart-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-serif text-[var(--text-primary)] mb-12"
        >
          Shopping Cart
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map(({ product, quantity }, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 p-6 bg-[var(--bg-paper)] border border-white/5"
                data-testid={`cart-item-${product.id}`}
              >
                <div className="w-24 h-32 bg-[var(--bg-subtle)] overflow-hidden flex-shrink-0">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-[var(--text-primary)] font-medium">{product.name}</h3>
                      <p className="text-xs text-[var(--text-secondary)] uppercase mt-1">{product.category}</p>
                    </div>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="text-white/40 hover:text-[var(--error)] transition-colors"
                      data-testid={`remove-${product.id}`}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    {/* Quantity */}
                    <div className="flex items-center">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="quantity-btn"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-[var(--text-primary)] text-sm">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="quantity-btn"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-[var(--brand-gold)] font-serif">
                        ${(getPrice(product.price_bbd, product.price_usd) * quantity).toFixed(2)} {currency}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--bg-paper)] p-6 border border-white/5 sticky top-28">
              <h2 className="text-lg font-serif text-[var(--text-primary)] mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Subtotal</span>
                  <span className="text-[var(--text-primary)]">${displayTotal.toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Shipping</span>
                  <span className="text-[var(--text-primary)]">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-[var(--text-primary)] uppercase tracking-widest text-sm">Total</span>
                  <div className="text-right">
                    <p className="text-xl font-serif text-[var(--brand-gold)]">
                      ${displayTotal.toFixed(2)} {currency}
                    </p>
                  </div>
                </div>
              </div>

              <Button asChild className="w-full btn-primary py-4">
                <Link to="/checkout" data-testid="proceed-checkout">
                  Proceed to Checkout
                  <ArrowRight size={18} className="ml-2" />
                </Link>
              </Button>

              <Button asChild variant="ghost" className="w-full mt-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
