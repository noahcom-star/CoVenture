import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '@/types/profile';
import {
  UserCircleIcon,
  ChevronDownIcon,
  PencilIcon,
  LinkIcon,
  TagIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { createPortal } from 'react-dom';

interface ProfileDropdownProps {
  profile: UserProfile;
  onProfileUpdate: () => void;
}

export default function ProfileDropdown({ profile, onProfileUpdate }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { signOut } = useAuth();

  const renderDropdown = () => (
    <div className="fixed inset-0" style={{ zIndex: 99999 }}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="fixed top-[4rem] right-4 w-72 bg-[var(--navy-dark)] rounded-xl shadow-xl border border-[var(--accent)]/10 overflow-hidden" style={{ zIndex: 100000 }}>
        <div className="p-4 border-b border-[var(--accent)]/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-[var(--white)]">{profile.full_name}</h3>
            <button
              onClick={() => {
                setIsOpen(false);
                setShowEditModal(true);
              }}
              className="p-1 hover:bg-[var(--accent)]/10 rounded-lg transition-colors"
            >
              <PencilIcon className="w-4 h-4 text-[var(--accent)]" />
            </button>
          </div>
          <p className="text-sm text-[var(--slate)]">{profile.bio}</p>
        </div>

        <div className="p-4 border-b border-[var(--accent)]/10">
          <h4 className="text-sm font-medium text-[var(--light-slate)] mb-2">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[var(--accent)]/10 text-[var(--accent)]"
              >
                <TagIcon className="w-3 h-3 mr-1" />
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 border-b border-[var(--accent)]/10">
          <h4 className="text-sm font-medium text-[var(--light-slate)] mb-2">Links</h4>
          <div className="space-y-2">
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-[var(--accent)] hover:underline"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                LinkedIn
              </a>
            )}
            {profile.portfolio_url && (
              <a
                href={profile.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-[var(--accent)] hover:underline"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Portfolio
              </a>
            )}
          </div>
        </div>

        <button
          onClick={signOut}
          className="w-full p-4 flex items-center text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-[var(--navy-light)] transition-colors"
      >
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <UserCircleIcon className="w-8 h-8 text-[var(--accent)]" />
        )}
        <span className="text-[var(--white)]">{profile.full_name}</span>
        <ChevronDownIcon className={`w-4 h-4 text-[var(--slate)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {typeof window !== 'undefined' && (
        <>
          {isOpen && createPortal(renderDropdown(), document.body)}
          {showEditModal && createPortal(
            <EditProfileModal
              profile={profile}
              onClose={() => setShowEditModal(false)}
              onUpdate={onProfileUpdate}
            />,
            document.body
          )}
        </>
      )}
    </div>
  );
}

interface EditProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
  onUpdate: () => void;
}

function EditProfileModal({ profile, onClose, onUpdate }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    full_name: profile.full_name,
    bio: profile.bio,
    skills: profile.skills.join(', '),
    linkedin_url: profile.linkedin_url || '',
    portfolio_url: profile.portfolio_url || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
          linkedin_url: formData.linkedin_url || null,
          portfolio_url: formData.portfolio_url || null
        })
        .eq('user_id', profile.user_id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000000 
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[var(--navy-dark)] rounded-xl p-6 w-full max-w-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-[var(--white)] mb-6">Edit Profile</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--slate)] mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className="w-full px-4 py-2 bg-[var(--navy-light)] text-[var(--white)] rounded-lg focus:outline-none focus:ring-2 ring-[var(--accent)]/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--slate)] mb-1">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 bg-[var(--navy-light)] text-[var(--white)] rounded-lg focus:outline-none focus:ring-2 ring-[var(--accent)]/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--slate)] mb-1">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
              className="w-full px-4 py-2 bg-[var(--navy-light)] text-[var(--white)] rounded-lg focus:outline-none focus:ring-2 ring-[var(--accent)]/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--slate)] mb-1">
              LinkedIn URL (Optional)
            </label>
            <input
              type="url"
              value={formData.linkedin_url}
              onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
              className="w-full px-4 py-2 bg-[var(--navy-light)] text-[var(--white)] rounded-lg focus:outline-none focus:ring-2 ring-[var(--accent)]/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--slate)] mb-1">
              Portfolio URL (Optional)
            </label>
            <input
              type="url"
              value={formData.portfolio_url}
              onChange={(e) => setFormData(prev => ({ ...prev, portfolio_url: e.target.value }))}
              className="w-full px-4 py-2 bg-[var(--navy-light)] text-[var(--white)] rounded-lg focus:outline-none focus:ring-2 ring-[var(--accent)]/50"
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[var(--slate)] hover:text-[var(--white)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--accent)] text-[var(--navy-dark)] rounded-lg font-medium hover:opacity-90 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
} 