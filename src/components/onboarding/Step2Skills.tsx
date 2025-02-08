'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Step2Props {
  data: {
    skills: string[];
    interests: string[];
  };
  onNext: (data: Step2Props['data']) => void;
  onBack: () => void;
}

const SUGGESTED_SKILLS = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Digital Marketing',
  'Content Creation',
  'Data Analysis',
  'Product Management',
  'Business Strategy',
];

const SUGGESTED_INTERESTS = [
  'AI/ML',
  'E-commerce',
  'EdTech',
  'FinTech',
  'Healthcare',
  'Social Impact',
  'Sustainability',
  'Gaming',
];

export default function Step2Skills({ data, onNext, onBack }: Step2Props) {
  const [formData, setFormData] = useState(data);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [error, setError] = useState<string | null>(null);

  const addSkill = (skill: string) => {
    if (!skill.trim()) return;
    if (formData.skills.includes(skill.trim())) return;
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, skill.trim()],
    }));
    setNewSkill('');
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }));
  };

  const addInterest = (interest: string) => {
    if (!interest.trim()) return;
    if (formData.interests.includes(interest.trim())) return;
    setFormData(prev => ({
      ...prev,
      interests: [...prev.interests, interest.trim()],
    }));
    setNewInterest('');
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.skills.length === 0) {
      setError('Please add at least one skill');
      return;
    }

    if (formData.interests.length === 0) {
      setError('Please add at least one interest');
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
        <h2 className="text-2xl font-bold text-[var(--white)]">Skills & Interests</h2>
        <p className="text-[var(--slate)] mt-2">What are you good at and what excites you?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Skills Section */}
        <div>
          <label className="block text-sm font-medium text-[var(--light-slate)] mb-2">
            Your Skills
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[var(--accent)]/10 text-[var(--accent)]"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-2 hover:text-[var(--white)]"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(newSkill))}
              className="flex-1 px-3 py-2 bg-[var(--navy-light)] border border-[var(--accent)]/20 rounded-lg text-[var(--white)] placeholder-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
              placeholder="Add a skill..."
            />
            <button
              type="button"
              onClick={() => addSkill(newSkill)}
              className="px-4 py-2 bg-[var(--accent)]/20 text-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/30"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_SKILLS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                className="px-3 py-1 text-sm border border-[var(--accent)]/20 rounded-full hover:bg-[var(--accent)]/10"
              >
                + {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Interests Section */}
        <div>
          <label className="block text-sm font-medium text-[var(--light-slate)] mb-2">
            Your Interests
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.interests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[var(--accent)]/10 text-[var(--accent)]"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => removeInterest(interest)}
                  className="ml-2 hover:text-[var(--white)]"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest(newInterest))}
              className="flex-1 px-3 py-2 bg-[var(--navy-light)] border border-[var(--accent)]/20 rounded-lg text-[var(--white)] placeholder-[var(--slate)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
              placeholder="Add an interest..."
            />
            <button
              type="button"
              onClick={() => addInterest(newInterest)}
              className="px-4 py-2 bg-[var(--accent)]/20 text-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/30"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_INTERESTS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => addInterest(interest)}
                className="px-3 py-1 text-sm border border-[var(--accent)]/20 rounded-full hover:bg-[var(--accent)]/10"
              >
                + {interest}
              </button>
            ))}
          </div>
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
            Continue
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
} 