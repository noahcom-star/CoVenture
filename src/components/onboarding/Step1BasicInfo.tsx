'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircleIcon } from '@heroicons/react/24/outline';

interface Step1Props {
  data: {
    full_name: string;
    bio: string;
    avatar_url?: string;
  };
  onNext: (data: Step1Props['data']) => void;
}

export default function Step1BasicInfo({ data, onNext }: Step1Props) {
  const [formData, setFormData] = useState(data);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.full_name.trim()) {
      setError('Name is required');
      return;
    }

    if (!formData.bio.trim()) {
      setError('Bio is required');
      return;
    }

    if (formData.bio.length > 250) {
      setError('Bio must be less than 250 characters');
      return;
    }

    onNext(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[var(--white)]">Let's Get Started!</h2>
        <p className="text-[var(--slate)] mt-2">Tell us a bit about yourself</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center mb-8">
          <div className="relative">
            {formData.avatar_url ? (
              <img
                src={formData.avatar_url}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-[var(--accent)]"
              />
            ) : (
              <UserCircleIcon className="w-24 h-24 text-[var(--accent)]" />
            )}
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-[var(--accent)] text-[var(--navy-dark)] rounded-full p-2 text-xs font-medium"
              onClick={() => {
                // TODO: Implement image upload
                alert('Image upload will be implemented');
              }}
            >
              Edit
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-[var(--light-slate)]">
            Full Name
          </label>
          <input
            type="text"
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="mt-1 block w-full px-3 py-2 bg-[var(--navy-light)] border border-[var(--accent)]/20 rounded-lg text-[var(--white)] placeholder-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-[var(--light-slate)]">
            Bio
          </label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            className="mt-1 block w-full px-3 py-2 bg-[var(--navy-light)] border border-[var(--accent)]/20 rounded-lg text-[var(--white)] placeholder-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
            placeholder="Tell us about yourself, your interests, and what you hope to achieve..."
          />
          <p className="mt-1 text-sm text-[var(--slate)]">
            {formData.bio.length}/250 characters
          </p>
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
          className="w-full py-3 px-4 bg-[var(--accent)] text-[var(--navy-dark)] rounded-lg font-semibold hover:opacity-90 transition-all"
        >
          Continue
        </motion.button>
      </form>
    </motion.div>
  );
} 