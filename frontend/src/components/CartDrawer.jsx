import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalBBD, totalUSD } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[var(--bg-paper)] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-lg font-serif text-[var(--text-primary)]">Your Cart</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                data-testid="close-cart"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={48} className="text-white/20 mb-4" />
                  <p className="text-[var(--text-secondary)] text-sm">Your cart is empty</p>
                  <Button
                    onClick={() => setIsOpen(false)}
                    className="mt-6 btn-secondary px-6 py-2"
                    asChild
                  >
                    <Link to="/shop">Continue Shopping</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="cart-item pb-6" data-testid={`cart-item-${product.id}`}>
                      <div className="flex gap-4">
                        <div className="w-20 h-24 bg-[var(--bg-subtle)] overflow-hidden flex-shrink-0">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm text-[var(--text-primary)] truncate">{product.name}</h3>
                          <p className="text-xs text-[var(--brand-gold)] mt-1">
                            ${product.price_bbd.toFixed(2)} BBD
                          </p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            ${product.price_usd.toFixed(2)} USD
                          </p>

                          {/* Quantity */}
                          <div className="flex items-center mt-3 space-x-3">
                            <button
                              onClick={() => updateQuantity(product.id, quantity - 1)}
                              className="quantity-btn"
                              data-testid={`decrease-qty-${product.id}`}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm text-[var(--text-primary)] w-8 text-center">{quantity}</span>
                            <button
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              className="quantity-btn"
                              data-testid={`increase-qty-${product.id}`}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="text-white/40 hover:text-[var(--error)] transition-colors"
                          data-testid={`remove-item-${product.id}`}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--text-secondary)] uppercase tracking-widest">Total</span>
                  <div className="text-right">
                    <p className="text-lg font-serif text-[var(--brand-gold)]">
                      ${totalBBD.toFixed(2)} BBD
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      ${totalUSD.toFixed(2)} USD
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsOpen(false)}
                  className="w-full btn-primary py-4"
                  asChild
                >
                  <Link to="/checkout" data-testid="checkout-btn">
                    Checkout
                  </Link>
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  className="w-full text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  asChild
                >
                  <Link to="/cart">View Cart</Link>
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
