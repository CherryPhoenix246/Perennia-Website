import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Minus, Plus, ChevronLeft, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const { isAuthenticated, getAuthHeaders } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const [productRes, reviewsRes] = await Promise.all([
          axios.get(`${API}/products/${id}`),
          axios.get(`${API}/products/${id}/reviews`)
        ]);
        setProduct(productRes.data);
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast.success(`${product.name} added to cart`);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to write a review');
      return;
    }
    
    setSubmittingReview(true);
    try {
      const response = await axios.post(
        `${API}/products/${id}/reviews`,
        {
          product_id: id,
          rating: reviewRating,
          comment: reviewComment
        },
        { headers: getAuthHeaders() }
      );
      setReviews([response.data, ...reviews]);
      setReviewComment('');
      setReviewRating(5);
      toast.success('Review submitted!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-[4/5] bg-[#1A1A1A] skeleton" />
            <div className="space-y-6">
              <div className="h-8 bg-[#1A1A1A] skeleton w-3/4" />
              <div className="h-6 bg-[#1A1A1A] skeleton w-1/2" />
              <div className="h-24 bg-[#1A1A1A] skeleton" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <p className="text-[#A3A3A3]">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20" data-testid="product-detail-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-12">
        {/* Breadcrumb */}
        <Link
          to="/shop"
          className="inline-flex items-center text-[#A3A3A3] text-sm hover:text-[#D4AF37] transition-colors mb-8"
        >
          <ChevronLeft size={18} />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="aspect-[4/5] bg-[#1A1A1A] overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 overflow-hidden gallery-thumb ${
                      selectedImage === idx ? 'active' : ''
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-28 lg:self-start space-y-6"
          >
            {/* Category */}
            <span className="text-xs uppercase tracking-widest text-[#D4AF37]">
              {product.category === 'resin' && 'Resin Art & Décor'}
              {product.category === 'soaps' && 'Body Care'}
              {product.category === 'candles' && 'Candles'}
            </span>

            <h1 className="text-3xl md:text-4xl font-serif text-white">{product.name}</h1>

            {/* Rating */}
            {product.review_count > 0 && (
              <div className="flex items-center space-x-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.round(product.average_rating) ? 'star-filled fill-current' : 'star-empty'}
                    />
                  ))}
                </div>
                <span className="text-sm text-[#A3A3A3]">
                  {product.average_rating.toFixed(1)} ({product.review_count} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="space-y-1">
              <p className="text-2xl font-serif text-[#D4AF37]">
                ${product.price_bbd.toFixed(2)} BBD
              </p>
              <p className="text-sm text-[#A3A3A3]">
                ${product.price_usd.toFixed(2)} USD
              </p>
            </div>

            {/* Description */}
            <p className="text-[#A3A3A3] leading-relaxed">
              {product.description}
            </p>

            {/* Stock */}
            <p className={`text-sm ${product.stock > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>

            {/* Quantity & Add to Cart */}
            {product.stock > 0 && (
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="quantity-btn"
                    data-testid="decrease-qty"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="quantity-btn"
                    data-testid="increase-qty"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="flex-1 btn-primary py-4"
                  data-testid="add-to-cart-btn"
                >
                  <ShoppingBag size={18} className="mr-2" />
                  Add to Cart
                </Button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Reviews Section */}
        <section className="mt-24 pt-12 border-t border-white/5">
          <h2 className="text-2xl font-serif text-white mb-8">Customer Reviews</h2>

          {/* Write Review */}
          <div className="bg-[#0F0F0F] p-6 mb-8">
            <h3 className="text-sm uppercase tracking-widest text-white mb-4">Write a Review</h3>
            {isAuthenticated ? (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          size={24}
                          className={star <= reviewRating ? 'star-filled fill-current' : 'star-empty'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#A3A3A3] mb-2 block">
                    Your Review
                  </label>
                  <Textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="bg-transparent border-white/20 text-white min-h-[100px]"
                    data-testid="review-comment"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-primary px-6 py-2"
                  data-testid="submit-review-btn"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
              </form>
            ) : (
              <p className="text-[#A3A3A3]">
                Please <Link to="/login" className="text-[#D4AF37] hover:underline">login</Link> to write a review.
              </p>
            )}
          </div>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <p className="text-[#A3A3A3]">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-white/5 pb-6" data-testid={`review-${review.id}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{review.user_name}</span>
                    <span className="text-xs text-[#525252]">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < review.rating ? 'star-filled fill-current' : 'star-empty'}
                      />
                    ))}
                  </div>
                  <p className="text-[#A3A3A3] text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
