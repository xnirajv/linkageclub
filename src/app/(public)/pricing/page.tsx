import type { Metadata } from 'next';
import PricingClient from './PricingClient';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Choose the perfect plan for your needs',
};

export default function PricingPage() {
  return <PricingClient />;
}
