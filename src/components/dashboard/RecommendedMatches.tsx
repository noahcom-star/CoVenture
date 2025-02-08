'use client';

import { motion } from 'framer-motion';
import { UserProfile } from '@/types/profile';
import { StarIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';

interface RecommendedMatchesProps {
  profile: UserProfile;
}

// Placeholder data - In a real app, this would come from the backend
const PLACEHOLDER_MATCHES = [
  {
    id: 1,
    title: 'AI-Powered Learning Platform',
    description: 'Building an adaptive learning platform using AI to personalize education.',
    skills: ['Machine Learning', 'React', 'Python'],
    teamSize: 4,
    matchScore: 92,
    postedAt: '2 days ago',
  },
  {
    id: 2,
    title: 'Sustainable Fashion Marketplace',
    description: 'Creating a platform to connect eco-friendly fashion brands with conscious consumers.',
    skills: ['Next.js', 'Node.js', 'UI/UX'],
    teamSize: 3,
    matchScore: 85,
    postedAt: '5 days ago',
  },
  {
    id: 3,
    title: 'Community Health Tracker',
    description: 'Developing a mobile app to track and improve community health metrics.',
    skills: ['React Native', 'Firebase', 'TypeScript'],
    teamSize: 5,
    matchScore: 78,
    postedAt: '1 week ago',
  },
];

export default function RecommendedMatches({ profile }: RecommendedMatchesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--navy-light)]/50 backdrop-blur-lg rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--white)]">Recommended Matches</h2>
        <button
          className="text-sm text-[var(--accent)] hover:underline"
          onClick={() => {/* TODO: Implement view all */}}
        >
          View All
        </button>
      </div>

      <div className="space-y-6">
        {PLACEHOLDER_MATCHES.map((match) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-[var(--navy-dark)] rounded-lg p-4 cursor-pointer hover:bg-[var(--navy-dark)]/80 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-[var(--white)] mb-1">
                  {match.title}
                </h3>
                <p className="text-[var(--slate)] text-sm line-clamp-2">
                  {match.description}
                </p>
              </div>
              <div className="flex items-center space-x-1 bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-1 rounded-full">
                <StarIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{match.matchScore}%</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {match.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-[var(--accent)]/5 text-[var(--accent)] rounded-full text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-[var(--slate)]">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <UserGroupIcon className="w-4 h-4" />
                  <span>{match.teamSize} members</span>
                </span>
                <span className="flex items-center space-x-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>{match.postedAt}</span>
                </span>
              </div>
              <button
                className="text-[var(--accent)] hover:underline"
                onClick={() => {/* TODO: Implement apply */}}
              >
                Learn More
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Filters */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => {/* TODO: Implement filter */}}
          className="flex-1 py-2 px-4 bg-[var(--accent)]/20 text-[var(--accent)] rounded-lg font-medium hover:bg-[var(--accent)]/30 transition-colors"
        >
          Filter by Skills
        </button>
        <button
          onClick={() => {/* TODO: Implement sort */}}
          className="flex-1 py-2 px-4 bg-[var(--accent)]/20 text-[var(--accent)] rounded-lg font-medium hover:bg-[var(--accent)]/30 transition-colors"
        >
          Sort by Match
        </button>
      </div>
    </motion.div>
  );
} 