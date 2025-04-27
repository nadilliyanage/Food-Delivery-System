import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';
import { toast } from 'react-toastify';


const StripePaymentForm = ({ orderId, totalAmount, restaurantId, onPaymentSuccess, loading, setLoading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setError(null);
    setLoading(true);

    try {
      // Step 1: Create payment intent
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment`,
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const clientSecret = data?.clientSecret;
      if (!clientSecret) throw new Error('Failed to get client secret');

      // Step 2: Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (stripeError) throw stripeError;

      if (paymentIntent?.status === 'succeeded') {
        // Payment successful - clear cart
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/cart/clear/${restaurantId}`,
          { 
            headers: { 
              Authorization: `Bearer ${localStorage.getItem('token')}` 
            } 
          }
        );

        toast.success('Payment successful!');
        onPaymentSuccess();
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMsg = err?.message || err?.response?.data?.message || 'Payment processing failed';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="border rounded-lg p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={loading || !stripe}
        className={`w-full py-4 rounded-lg font-medium ${
          loading || !stripe ? 'bg-gray-400' : 'bg-primary text-white'
        }`}
      >
        {loading ? 'Processing...' : `Pay LKR ${totalAmount.toFixed(2)}`}
      </button>
    </form>
  );
};

export default StripePaymentForm;
