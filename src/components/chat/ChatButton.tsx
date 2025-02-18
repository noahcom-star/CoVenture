'use client';

import { useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { UserProfile } from '@/types/profile';
import dynamic from 'next/dynamic';

const ChatModal = dynamic(() => import('./ChatModal'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--navy-light)] rounded-lg shadow-xl w-full max-w-2xl mx-4 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" />
      </div>
    </div>
  ),
});

interface ChatButtonProps {
  currentUser: NonNullable<UserProfile>;
  otherUser: UserProfile;
  projectId: string;
  applicationId: string;
  projectTitle: string;
}

export default function ChatButton({
  currentUser,
  otherUser,
  projectId,
  applicationId,
  projectTitle
}: ChatButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const roomId = `${projectId}_${applicationId}`;

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/20 transition-colors"
      >
        <ChatBubbleLeftRightIcon className="w-5 h-5" />
      </button>

      {showModal && (
        <ChatModal
          roomId={roomId}
          otherUser={otherUser}
          projectTitle={projectTitle}
          onClose={handleClose}
          currentUser={currentUser}
        />
      )}
    </>
  );
} 