import useSWR from 'swr';
import { useCallback, useState } from 'react';
import { fetcher } from '@/lib/api/client';
import { useAuth } from './useAuth';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function usePayments() {
  const { isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data, error, mutate } = useSWR<any>(
    isAuthenticated ? '/api/payments/transactions' : null,
    fetcher
  );

  const { data: balanceData } = useSWR<any>(
    isAuthenticated ? '/api/payments/balance' : null,
    fetcher
  );

  const createOrder = useCallback(async (orderDetails: any) => {
    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderDetails),
      });

      if (!response.ok) throw new Error('Failed to create order');

      return await response.json();
    } catch (error) {
      throw error;
    }
  }, []);

  const verifyPayment = useCallback(async (paymentDetails: any) => {
    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentDetails),
      });

      if (!response.ok) throw new Error('Failed to verify payment');

      mutate(); // Refresh transactions
      return await response.json();
    } catch (error) {
      throw error;
    }
  }, [mutate]);

  const initializeRazorpay = useCallback(async (orderDetails: any) => {
    setIsProcessing(true);

    try {
      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });

      const order = await createOrder(orderDetails);

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'InternHub',
        description: orderDetails.purpose,
        order_id: order.orderId,
        handler: async (response: any) => {
          await verifyPayment(response);
          setIsProcessing(false);
        },
        prefill: {
          name: orderDetails.userName,
          email: orderDetails.userEmail,
          contact: orderDetails.userPhone,
        },
        theme: {
          color: '#344A86',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setIsProcessing(false);
      throw error;
    }
  }, [createOrder, verifyPayment]);

  const requestWithdrawal = useCallback(async (amount: number, method: any) => {
    try {
      const response = await fetch('/api/payments/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method }),
      });

      if (!response.ok) throw new Error('Failed to request withdrawal');

      mutate(); // Refresh transactions
      return await response.json();
    } catch (error) {
      throw error;
    }
  }, [mutate]);

  return {
    transactions: data?.transactions || [],
    balance: balanceData?.balance,
    monthly: balanceData?.monthly,
    summary: data?.summary,
    pagination: data?.pagination,
    isLoading: !error && !data,
    isError: error,
    isProcessing,
    initializeRazorpay,
    requestWithdrawal,
    mutate,
  };
}

export const usePayment = usePayments;
