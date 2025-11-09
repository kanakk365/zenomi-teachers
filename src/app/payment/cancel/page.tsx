'use client';

import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full font-urbanist bg-[#F5F0F8] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <X className="w-10 h-10 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Cancelled
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. No charges have been made to your account.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => router.push('/pricing')}
            className="w-full py-3 px-6 bg-gradient-to-r from-[#8B2D6C] to-[#704180] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Pricing
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 px-6 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

