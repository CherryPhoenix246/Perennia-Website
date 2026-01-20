import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

const ProductCard = ({ product, index = 0 }) => {
  const { addItem } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="product-card group"
      data-testid={`product-card-${product.id}`}
    >
      <Link to={`/product/${product.id}`}>
        {/* Image */}
        <div className="relative aspect-[4/5] bg-[var(--bg-subtle)] overflow-hidden mb-4">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          
          {/* Quick add button */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-4 right-4 w-10 h-10 bg-[var(--brand-gold)] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[var(--brand-gold-dim)]"
            data-testid={`quick-add-${product.id}`}
          >
            <ShoppingBag size={18} />
          </button>

          {/* Featured badge */}
          {product.featured && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-[var(--brand-gold)] text-black text-xs uppercase tracking-widest">
              Featured
            </span>
          )}

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-[var(--text-primary)] text-xs uppercase tracking-widest">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-2">
          <h3 className="text-[var(--text-primary)] text-sm font-medium">{product.name}</h3>
          
          {/* Rating */}
          {product.review_count > 0 && (
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={i < Math.round(product.average_rating) ? 'star-filled fill-current' : 'star-empty'}
                  />
                ))}
              </div>
              <span className="text-xs text-[var(--text-secondary)]">({product.review_count})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline space-x-2">
            <span className="text-[var(--brand-gold)] font-serif">${product.price_bbd.toFixed(2)} BBD</span>
            <span className="text-xs text-[var(--text-secondary)]">${product.price_usd.toFixed(2)} USD</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
