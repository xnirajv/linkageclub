import { createSlice } from '@reduxjs/toolkit';
import type { BalanceInfo, Payment, PaymentSummary } from '@/types/payment';

interface PaymentsState {
  transactions: Payment[];
  currentTransaction: Payment | null;
  balance: BalanceInfo | null;
  summary: PaymentSummary | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PaymentsState = {
  transactions: [],
  currentTransaction: null,
  balance: null,
  summary: null,
  pagination: null,
  isLoading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {},
});

export default paymentSlice.reducer;
