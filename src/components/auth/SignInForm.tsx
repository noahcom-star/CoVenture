'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function SignInForm() {
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear errors when user starts typing
    setError(null);
  };

  const validateForm = () => {
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await signIn(formData.email, formData.password);
      toast.success('Successfully signed in!');
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      toast.error('Failed to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--light-slate)]">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
            className="mt-1 block w-full px-3 py-2 bg-[var(--navy-light)] border border-[var(--accent)]/20 rounded-lg text-[var(--white)] placeholder-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 disabled:opacity-50"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--light-slate)]">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isSubmitting}
            className="mt-1 block w-full px-3 py-2 bg-[var(--navy-light)] border border-[var(--accent)]/20 rounded-lg text-[var(--white)] placeholder-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 disabled:opacity-50"
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-[var(--accent)] text-[var(--navy-dark)] rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-[var(--navy-dark)] border-t-transparent rounded-full animate-spin mr-2" />
              Signing In...
            </div>
          ) : (
            'Sign In'
          )}
        </motion.button>
      </form>
    </div>
  );
} 