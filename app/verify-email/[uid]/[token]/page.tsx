'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const { uid, token } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState('Verifying email...');

  useEffect(() => {
    if (uid && token) {
      fetch(`http://localhost:8000/api/auth/verify-email/${uid}/${token}/`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to verify');
          return res.json();
        })
        .then(data => {
          setStatus(data.message || 'Email verified successfully!');
          // After success, redirect to login page after 2 seconds
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        })
        .catch(() => setStatus('Verification failed!'));
    }
  }, [uid, token, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-xl font-bold">{status}</h1>
    </div>
  );
}
