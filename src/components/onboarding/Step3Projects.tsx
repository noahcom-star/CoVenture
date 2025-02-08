'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LinkIcon } from '@heroicons/react/24/outline';

interface Step3Props {
  data: {
    linkedin_url?: string;
    portfolio_url?: string;
    project_status: 'looking' | 'has_idea';
    project_idea?: string;
  };
  onNext: (data: Step3Props['data']) => void;
  onBack: () => void;
}

export default function Step3Projects({ data, onNext, onBack }: Step3Props) {
  const [formData, setFormData] = useState(data);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.project_status === 'has_idea' && !formData.project_idea?.trim()) {
      setError('Please describe your project idea');
      return;
    }

    // Validate URLs if provided
    const urlRegex = /^https?:\/\/.+/;
    if (formData.linkedin_url && !urlRegex.test(formData.linkedin_url)) {
      setError('Please enter a valid LinkedIn URL');
      return;
    }
    if (formData.portfolio_url && !urlRegex.test(formData.portfolio_url)) {
      setError('Please enter a valid portfolio URL');
      return;
    }

    onNext(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[var(--white)]">Project Preferences</h2>
        <p className="text-[var(--slate)] mt-2">Tell us about your project ideas and experience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="linkedin" className="block text-sm font-medium text-[var(--light-slate)]">
            LinkedIn Profile (Optional)
          </label>
          <div className="mt-1 flex rounded-lg shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[var(--accent)]/20 bg-[var(--navy-light)] text-[var(--slate)]">
              <LinkIcon className="h-5 w-5" />
            </span>
            <input
              type="url"
              id="linkedin"
              value={formData.linkedin_url || ''}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              className="flex-1 px-3 py-2 bg-[var(--navy-light)] border border-[var(--accent)]/20 rounded-r-lg text-[var(--white)] placeholder-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>

        <div>
          <label htmlFor="portfolio" className="block text-sm font-medium text-[var(--light-slate)]">
            Portfolio/Website (Optional)
          </label>
          <div className="mt-1 flex rounded-lg shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[var(--accent)]/20 bg-[var(--navy-light)] text-[var(--slate)]">
              <LinkIcon className="h-5 w-5" />
            </span>
            <input
              type="url"
              id="portfolio"
              value={formData.portfolio_url || ''}
              onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
              className="flex-1 px-3 py-2 bg-[var(--navy-light)] border border-[var(--accent)]/20 rounded-r-lg text-[var(--white)] placeholder-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
              placeholder="https://yourportfolio.com"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-[var(--light-slate)]">
            Project Status
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, project_status: 'looking', project_idea: '' })}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                formData.project_status === 'looking'
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                  : 'border-[var(--accent)]/20 hover:border-[var(--accent)]/50'
              }`}
            >
              <h3 className="font-semibold text-[var(--white)]">Looking for Projects</h3>
              <p className="text-sm text-[var(--slate)]">
                I want to join exciting projects and collaborate with others
              </p>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, project_status: 'has_idea' })}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                formData.project_status === 'has_idea'
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                  : 'border-[var(--accent)]/20 hover:border-[var(--accent)]/50'
              }`}
            >
              <h3 className="font-semibold text-[var(--white)]">I Have an Idea</h3>
              <p className="text-sm text-[var(--slate)]">
                I have a project idea and I'm looking for teammates
              </p>
            </button>
          </div>
        </div>

        {formData.project_status === 'has_idea' && (
          <div>
            <label htmlFor="idea" className="block text-sm font-medium text-[var(--light-slate)]">
              Tell us about your idea
            </label>
            <textarea
              id="idea"
              value={formData.project_idea || ''}
              onChange={(e) => setFormData({ ...formData, project_idea: e.target.value })}
              rows={4}
              className="mt-1 block w-full px-3 py-2 bg-[var(--navy-light)] border border-[var(--accent)]/20 rounded-lg text-[var(--white)] placeholder-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
              placeholder="Describe your project idea briefly..."
            />
          </div>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm"
          >
            {error}
          </motion.p>
        )}

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onBack}
            className="flex-1 py-3 px-4 border border-[var(--accent)] text-[var(--accent)] rounded-lg font-semibold hover:bg-[var(--accent)]/10 transition-all"
          >
            Back
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="flex-1 py-3 px-4 bg-[var(--accent)] text-[var(--navy-dark)] rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            Complete Profile
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
} 