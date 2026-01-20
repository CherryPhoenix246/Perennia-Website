import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();
  const { getAuthHeaders } = useAuth();
  const [status, setStatus] = useState('checking');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const pollPaymentStatus = async () => {
      if (!sessionId || attempts >= 5) {
        if (attempts >= 5) setStatus('timeout');
        return;
      }

      try {
        const response = await axios.get(
          `${API}/checkout/status/${sessionId}`,
          { headers: getAuthHeaders() }
        );

        if (response.data.payment_status === 'paid') {
          setStatus('success');
          clearCart();
        } else if (response.data.status === 'expired') {
          setStatus('expired');
        } else {
          setAttempts(prev => prev + 1);
          setTimeout(pollPaymentStatus, 2000);
        }
      } catch (error) {
        console.error('Error checking payment:', error);
        setAttempts(prev => prev + 1);
        setTimeout(pollPaymentStatus, 2000);
      }
    };

    pollPaymentStatus();
  }, [sessionId, attempts, getAuthHeaders, clearCart]);

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center" data-testid="checkout-success-page">
      <div className="text-center px-6 max-w-lg">
        {status === 'checking' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 size={64} className="text-[#D4AF37] mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-serif text-white mb-4">Processing Payment...</h1>
            <p className="text-[#A3A3A3]">Please wait while we confirm your payment.</p>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <CheckCircle size={64} className="text-[#10B981] mx-auto mb-6" />
            <h1 className="text-3xl font-serif text-white mb-4">Thank You!</h1>
            <p className="text-[#A3A3A3] mb-8">
              Your order has been placed successfully. You will receive a confirmation email shortly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="btn-primary px-8 py-3">
                <Link to="/account">View Orders</Link>
              </Button>
              <Button asChild variant="ghost" className="btn-secondary px-8 py-3">
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </motion.div>
        )}

        {(status === 'timeout' || status === 'expired') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h1 className="text-2xl font-serif text-white mb-4">
              {status === 'expired' ? 'Payment Expired' : 'Payment Status Unknown'}
            </h1>
            <p className="text-[#A3A3A3] mb-8">
              {status === 'expired'
                ? 'Your payment session has expired. Please try again.'
                : 'We couldn\'t confirm your payment. Please check your email for confirmation or contact support.'}
            </p>
            <Button asChild className="btn-primary px-8 py-3">
              <Link to="/account">View My Orders</Link>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CheckoutSuccess;
