import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CheckoutCancel = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center" data-testid="checkout-cancel-page">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center px-6 max-w-lg"
      >
        <XCircle size={64} className="text-[#EF4444] mx-auto mb-6" />
        <h1 className="text-3xl font-serif text-white mb-4">Payment Cancelled</h1>
        <p className="text-[#A3A3A3] mb-8">
          Your payment was cancelled. Your cart items are still saved. 
          Would you like to try again?
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="btn-primary px-8 py-3">
            <Link to="/checkout">Try Again</Link>
          </Button>
          <Button asChild variant="ghost" className="btn-secondary px-8 py-3">
            <Link to="/cart">Back to Cart</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutCancel;
