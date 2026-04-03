'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Wallet,
  Banknote,
  Smartphone,
  CheckCircle,
  Info,
  Lock,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import DashboardLayout from '@/app/dashboard/layout';
import { Label } from '@/components/ui/lable';
import { RadioGroup, RadioGroupItem } from '@/components/forms/RadioGroup';

export default function WithdrawEarningsPage() {
  const router = useRouter();
  const [withdrawMethod, setWithdrawMethod] = useState<'bank' | 'upi'>('bank');
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);

  // Mock data - replace with actual API
  const availableBalance = 45250;
  const minimumWithdrawal = 500;
  const maximumWithdrawal = 100000;

  // Bank account details
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    accountType: 'savings',
  });

  // UPI details
  const [upiDetails, setUpiDetails] = useState({
    upiId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return 'Please enter a valid amount';
    }
    if (numAmount < minimumWithdrawal) {
      return `Minimum withdrawal amount is ${formatCurrency(minimumWithdrawal)}`;
    }
    if (numAmount > availableBalance) {
      return 'Insufficient balance';
    }
    if (numAmount > maximumWithdrawal) {
      return `Maximum withdrawal amount is ${formatCurrency(maximumWithdrawal)}`;
    }
    return '';
  };

  const validateBankDetails = () => {
    const newErrors: Record<string, string> = {};

    if (!bankDetails.accountNumber) {
      newErrors.accountNumber = 'Account number is required';
    } else if (bankDetails.accountNumber.length < 9 || bankDetails.accountNumber.length > 18) {
      newErrors.accountNumber = 'Account number should be 9-18 digits';
    }

    if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
      newErrors.confirmAccountNumber = 'Account numbers do not match';
    }

    if (!bankDetails.ifscCode) {
      newErrors.ifscCode = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifscCode)) {
      newErrors.ifscCode = 'Invalid IFSC code format';
    }

    if (!bankDetails.accountHolderName) {
      newErrors.accountHolderName = 'Account holder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUpiDetails = () => {
    const newErrors: Record<string, string> = {};

    if (!upiDetails.upiId) {
      newErrors.upiId = 'UPI ID is required';
    } else if (!/^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(upiDetails.upiId)) {
      newErrors.upiId = 'Invalid UPI ID format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    const amountError = validateAmount();
    if (amountError) {
      setErrors({ amount: amountError });
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = async () => {
    let isValid = false;
    if (withdrawMethod === 'bank') {
      isValid = validateBankDetails();
    } else {
      isValid = validateUpiDetails();
    }

    if (!isValid) return;

    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setWithdrawalSuccess(true);
    }, 2000);
  };

  const handleDone = () => {
    router.push('/dashboard/mentor/earnings');
  };

  const getFee = () => {
    const numAmount = parseFloat(amount) || 0;
    const fee = Math.min(numAmount * 0.01, 100); // 1% fee, max ₹100
    const netAmount = numAmount - fee;
    return { fee, netAmount };
  };

  const { fee, netAmount } = getFee();

  if (withdrawalSuccess) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto">
          <Card className="p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Withdrawal Initiated!</h2>
            <p className="text-charcoal-600 mb-4">
              Your withdrawal request for {formatCurrency(parseFloat(amount) || 0)} has been submitted successfully.
            </p>
            <div className="bg-charcoal-100/50 p-4 rounded-lg mb-6 text-left">
              <p className="text-sm text-charcoal-600 mb-1">Transaction Details:</p>
              <p className="text-sm font-medium">Amount: {formatCurrency(parseFloat(amount) || 0)}</p>
              <p className="text-sm font-medium">Fee: {formatCurrency(fee)}</p>
              <p className="text-sm font-medium">Net Amount: {formatCurrency(netAmount)}</p>
              <p className="text-sm text-charcoal-500 mt-2">
                Funds will be transferred within 2-3 business days.
              </p>
            </div>
            <Button onClick={handleDone} className="w-full">
              Done
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-charcoal-950">Withdraw Earnings</h1>
            <p className="text-charcoal-600">Transfer your earnings to your bank account</p>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-medium
                ${step >= s 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-charcoal-100 text-charcoal-600'
                }
              `}>
                {s}
              </div>
              {s < 2 && (
                <div className={`
                  flex-1 h-1 mx-2
                  ${step > s ? 'bg-primary-600' : 'bg-charcoal-100'}
                `} />
              )}
            </div>
          ))}
        </div>

        {step === 1 ? (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Enter Withdrawal Amount</h2>

            <div className="space-y-4">
              {/* Available Balance */}
              <div className="p-4 bg-blue-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-blue-700">Available Balance</span>
                </div>
                <span className="text-xl font-bold text-blue-700">
                  {formatCurrency(availableBalance)}
                </span>
              </div>

              {/* Amount Input */}
              <div>
                <Label htmlFor="amount">Amount to Withdraw (₹)</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-500">₹</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                    min={minimumWithdrawal}
                    max={Math.min(availableBalance, maximumWithdrawal)}
                    step="100"
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-red-600 mt-1">{errors.amount}</p>
                )}
                <p className="text-xs text-charcoal-500 mt-1">
                  Min: {formatCurrency(minimumWithdrawal)} | Max: {formatCurrency(maximumWithdrawal)}
                </p>
              </div>

              {/* Fee Breakdown */}
              {amount && !isNaN(parseFloat(amount)) && (
                <div className="p-4 bg-charcoal-100/50 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-600">Withdrawal Amount</span>
                    <span>{formatCurrency(parseFloat(amount))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-600">Transaction Fee (1%)</span>
                    <span className="text-red-600">-{formatCurrency(fee)}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Net Amount</span>
                    <span className="text-green-600">{formatCurrency(netAmount)}</span>
                  </div>
                  <p className="text-xs text-charcoal-500 mt-2">
                    <Info className="h-3 w-3 inline mr-1" />
                    Fee capped at ₹100 per transaction
                  </p>
                </div>
              )}

              {/* Next Button */}
              <Button
                onClick={handleNext}
                className="w-full"
                disabled={!amount || parseFloat(amount) < minimumWithdrawal}
              >
                Next
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Select Withdrawal Method</h2>

            <RadioGroup
              value={withdrawMethod}
              onValueChange={(value) => setWithdrawMethod(value as 'bank' | 'upi')}
              className="space-y-4 mb-6"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-4">
                <RadioGroupItem value="bank" id="bank" />
                <Label htmlFor="bank" className="flex items-center gap-3 flex-1 cursor-pointer">
                  <Banknote className="h-5 w-5 text-charcoal-600" />
                  <div>
                    <p className="font-medium">Bank Transfer</p>
                    <p className="text-sm text-charcoal-500">2-3 business days</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-lg p-4">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi" className="flex items-center gap-3 flex-1 cursor-pointer">
                  <Smartphone className="h-5 w-5 text-charcoal-600" />
                  <div>
                    <p className="font-medium">UPI Transfer</p>
                    <p className="text-sm text-charcoal-500">Instant (24 hours max)</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {withdrawMethod === 'bank' ? (
              <div className="space-y-4">
                <h3 className="font-medium">Bank Account Details</h3>
                
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    placeholder="Enter account number"
                    className="mt-1"
                  />
                  {errors.accountNumber && (
                    <p className="text-sm text-red-600 mt-1">{errors.accountNumber}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmAccountNumber">Confirm Account Number</Label>
                  <Input
                    id="confirmAccountNumber"
                    value={bankDetails.confirmAccountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, confirmAccountNumber: e.target.value })}
                    placeholder="Re-enter account number"
                    className="mt-1"
                  />
                  {errors.confirmAccountNumber && (
                    <p className="text-sm text-red-600 mt-1">{errors.confirmAccountNumber}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    value={bankDetails.ifscCode}
                    onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="e.g., HDFC0001234"
                    className="mt-1"
                  />
                  {errors.ifscCode && (
                    <p className="text-sm text-red-600 mt-1">{errors.ifscCode}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="accountHolderName">Account Holder Name</Label>
                  <Input
                    id="accountHolderName"
                    value={bankDetails.accountHolderName}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                    placeholder="As per bank records"
                    className="mt-1"
                  />
                  {errors.accountHolderName && (
                    <p className="text-sm text-red-600 mt-1">{errors.accountHolderName}</p>
                  )}
                </div>

                <div>
                  <Label>Account Type</Label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="accountType"
                        value="savings"
                        checked={bankDetails.accountType === 'savings'}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountType: e.target.value })}
                      />
                      <span>Savings</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="accountType"
                        value="current"
                        checked={bankDetails.accountType === 'current'}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountType: e.target.value })}
                      />
                      <span>Current</span>
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-medium">UPI Details</h3>
                
                <div>
                  <Label htmlFor="upiId">UPI ID</Label>
                  <Input
                    id="upiId"
                    value={upiDetails.upiId}
                    onChange={(e) => setUpiDetails({ upiId: e.target.value })}
                    placeholder="e.g., username@okhdfcbank"
                    className="mt-1"
                  />
                  {errors.upiId && (
                    <p className="text-sm text-red-600 mt-1">{errors.upiId}</p>
                  )}
                  <p className="text-xs text-charcoal-500 mt-1">
                    Supported UPI apps: Google Pay, PhonePe, Paytm, BHIM
                  </p>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="mt-6 p-4 bg-charcoal-100/50 rounded-lg">
              <h4 className="font-medium mb-2">Withdrawal Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal-600">Amount</span>
                  <span>{formatCurrency(parseFloat(amount) || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-600">Fee</span>
                  <span className="text-red-600">-{formatCurrency(fee)}</span>
                </div>
                <div className="flex justify-between font-medium pt-1 border-t">
                  <span>You'll receive</span>
                  <span className="text-green-600">{formatCurrency(netAmount)}</span>
                </div>
              </div>
            </div>

            {/* Security Note */}
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg flex items-start gap-2">
              <Lock className="h-4 w-4 text-yellow-600 mt-0.5" />
              <p className="text-xs text-yellow-700">
                Your bank details are encrypted and secure. We never store your full account numbers.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleSubmit} isLoading={isProcessing}>
                Confirm Withdrawal
              </Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}