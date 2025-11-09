'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Instantly redirect to dashboard
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen w-full font-urbanist bg-black flex items-center justify-center">

    </div>
  );
}

