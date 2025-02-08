'use client';

import { motion } from 'framer-motion';
import { UserProfile } from '@/types/profile';
import { PencilIcon } from '@heroicons/react/24/outline';

interface SkillsOverviewProps {
  profile: UserProfile;
}

export default function SkillsOverview({ profile }: SkillsOverviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl p-6"
    >
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--white)]">Skills & Interests</h2>
        <button
          className="p-2 hover:bg-[var(--accent)]/10 rounded-lg transition-colors"
          onClick={() => {/* TODO: Implement skills edit */}}
        >
          <PencilIcon className="w-5 h-5 text-[var(--accent)]" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills Section */}
        <div>
          <h3 className="text-sm font-medium text-[var(--light-slate)] mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Interests Section */}
        <div>
          <h3 className="text-sm font-medium text-[var(--light-slate)] mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full text-sm"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Skill Level Visualization - Placeholder for now */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-[var(--light-slate)] mb-4">Skill Levels</h3>
        <div className="space-y-4">
          {profile.skills.slice(0, 3).map((skill) => (
            <div key={skill} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--white)]">{skill}</span>
                <span className="text-[var(--slate)]">Intermediate</span>
              </div>
              <div className="h-2 bg-[var(--navy-dark)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--accent)] rounded-full"
                  style={{ width: `${Math.random() * 40 + 40}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => {/* TODO: Implement skill assessment */}}
          className="flex-1 py-2 px-4 bg-[var(--accent)]/20 text-[var(--accent)] rounded-lg font-medium hover:bg-[var(--accent)]/30 transition-colors"
        >
          Take Skill Assessment
        </button>
        <button
          onClick={() => {/* TODO: Implement certificate upload */}}
          className="flex-1 py-2 px-4 bg-[var(--accent)]/20 text-[var(--accent)] rounded-lg font-medium hover:bg-[var(--accent)]/30 transition-colors"
        >
          Upload Certificates
        </button>
      </div>
    </motion.div>
  );
} 