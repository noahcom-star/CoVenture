'use client';

import { motion } from 'framer-motion';
import { UserProfile } from '@/types/profile';
import { LightBulbIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface ProjectStatusProps {
  profile: UserProfile;
}

export default function ProjectStatus({ profile }: ProjectStatusProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl p-6"
    >
      <h2 className="text-xl font-bold text-[var(--white)] mb-6">Project Status</h2>

      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          {profile.project_status === 'has_idea' ? (
            <LightBulbIcon className="w-6 h-6 text-[var(--accent)]" />
          ) : (
            <MagnifyingGlassIcon className="w-6 h-6 text-[var(--accent)]" />
          )}
          <span className="text-[var(--white)] font-medium">
            {profile.project_status === 'has_idea' ? 'Has Project Idea' : 'Looking for Projects'}
          </span>
        </div>

        {profile.project_status === 'has_idea' && profile.project_idea && (
          <div>
            <h3 className="text-sm font-medium text-[var(--light-slate)] mb-2">Project Idea</h3>
            <p className="text-[var(--white)]">{profile.project_idea}</p>
          </div>
        )}

        {profile.project_status === 'looking' && (
          <div className="bg-[var(--accent)]/10 rounded-lg p-4">
            <h3 className="text-sm font-medium text-[var(--accent)] mb-2">Looking to Join</h3>
            <p className="text-[var(--slate)]">
              You're currently looking for exciting projects to join. We'll notify you when we find
              matches based on your skills and interests.
            </p>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() => {/* TODO: Implement project preferences update */}}
            className="w-full py-2 px-4 bg-[var(--accent)]/20 text-[var(--accent)] rounded-lg font-medium hover:bg-[var(--accent)]/30 transition-colors"
          >
            Update Preferences
          </button>
        </div>
      </div>
    </motion.div>
  );
} 