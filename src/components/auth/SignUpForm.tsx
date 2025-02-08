'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function SignUpForm() {
  const { signUp, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.age) {
      setValidationError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return;
    }

    const age = parseInt(formData.age);
    if (isNaN(age) || age < 13 || age > 19) {
      setValidationError('You must be between 13 and 19 years old to sign up');
      return;
    }

    await signUp(formData.email, formData.password, age);
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
            className="mt-1 block w-full px-3 py-2 bg-[var(--navy-light)] border border-[var(--accent)]/20 rounded-lg text-[var(--white)] placeholder-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium text-[var(--light-slate)]">
            Age
          </label>
          <input
            type="number"
            name="age"
            id="age"
            value={formData.age}
            onChange={handleChange}
            min="13"
            max="19"
            className="mt-1 block w-full px-3 py-2 bg-[var(--navy-light)] border border-[var(--accent)]/20 rounded-lg text-[var(--white)] placeholder-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
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
            className="mt-1 block w-full px-3 py-2 bg-[var(--navy-light)] border border-[var(--accent)]/20 rounded-lg text-[var(--white)] placeholder-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--light-slate)]">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-[var(--navy-light)] border border-[var(--accent)]/20 rounded-lg text-[var(--white)] placeholder-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
            placeholder="••••••••"
          />
        </div>

        {(error || validationError) && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm"
          >
            {error || validationError}
          </motion.p>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-[var(--accent)] text-[var(--navy-dark)] rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </motion.button>
      </form>
    </div>
  );
} 