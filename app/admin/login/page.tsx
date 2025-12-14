"use client";
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';


export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setMessage(data?.detail || 'Login failed');
      } else {
        // Clear any existing user tokens to prevent conflicts
        localStorage.removeItem('auth_token');
        // Use separate storage keys for admin authentication
        localStorage.setItem('admin_token', data.token);
        if (data.user) {
          localStorage.setItem('admin_user_role', data.user.role || 'admin');
          localStorage.setItem('admin_is_staff', String(!!data.user.is_staff));
        }
        setMessage('Login successful');
        router.push('/admin/dashboard');
      }
    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/images/WhelpsLogo.png"
          alt="WHELPS Logo"
          width={120}
          height={120}
          className="mx-auto"
        />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-myOrage rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center text-white mb-6">Log In</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white bg-opacity-20 placeholder-white text-white focus:outline-none focus:border-white focus:bg-opacity-30 rounded-md"
              required
            />
          </div>

          <div className="mt-6">
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white bg-opacity-20 placeholder-white text-white focus:outline-none focus:border-white focus:bg-opacity-30 rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mx-auto bg-white text-myOrage py-1 px-16 rounded-2xl hover:bg-opacity-90 transition duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 mt-8 font-medium text-lg block disabled:opacity-60"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {message && (
          <p className="text-center text-white mt-4">{message}</p>
        )}
      </div>
    </div>
  );
}